import { ImageResponse } from "next/og";
import { PlaymatIcon } from "@/components/ui/PlaymatIcon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<PlaymatIcon size={180} />, size);
}
