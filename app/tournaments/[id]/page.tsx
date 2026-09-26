import type { Metadata } from "next";
import { TournamentClient } from "@/components/tournament/TournamentClient";

export const metadata: Metadata = { title: "Tournament", description: "Sign up and follow the bracket on Playmat." };

export default async function TournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TournamentClient id={id} />;
}
