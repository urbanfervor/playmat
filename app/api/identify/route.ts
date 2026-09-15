import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { games } from "@/games";
import { cardProviders } from "@/games/cards";
import { clientIp, rateLimit } from "@/lib/rateLimit";

const client = new Anthropic();
const MAX_IMAGE_BASE64 = 1_000_000; // ~750KB JPEG; a card crop is well under 200KB

export async function POST(req: Request) {
  if (!rateLimit(`identify:${clientIp(req)}`, 20, 60_000)) return NextResponse.json({ error: "too many requests" }, { status: 429 });
  const { game, image } = (await req.json()) as { game: string; image: string };
  const def = games[game];
  const provider = cardProviders[game];
  if (!def || !provider) return NextResponse.json({ error: "unknown game" }, { status: 404 });
  if (typeof image !== "string" || image.length > MAX_IMAGE_BASE64) return NextResponse.json({ error: "image too large" }, { status: 413 });

  let response;
  try {
    response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 256,
      output_config: {
        effort: "low",
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: { name: { type: "string" } },
            required: ["name"],
            additionalProperties: false,
          },
        },
      },
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: image } },
            {
              type: "text",
              text: `This is a crop from a webcam pointed at a ${def.name} table. Identify the card closest to the center of the crop and give its exact printed name. If no card is legible, give an empty name.`,
            },
          ],
        },
      ],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("identify: model call failed:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }

  if (response.stop_reason === "refusal") return NextResponse.json({ name: "", card: null });
  const text = response.content.find((b) => b.type === "text")?.text ?? "{}";
  const { name } = JSON.parse(text) as { name: string };
  if (!name) return NextResponse.json({ name: "", card: null });

  const results = await provider.search(name);
  const exact = results.find((c) => c.name.toLowerCase() === name.toLowerCase());
  return NextResponse.json({ name, card: exact ?? results[0] ?? null });
}
