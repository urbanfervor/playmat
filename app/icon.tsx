import { ImageResponse } from "next/og";
import { PlaymatIcon } from "@/components/ui/PlaymatIcon";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<PlaymatIcon size={64} />, size);
}
