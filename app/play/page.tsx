import type { Metadata } from "next";
import { HomePage } from "@/components/home/HomePage";

export const metadata: Metadata = { title: "I want to play" };

export default function Play() {
  return <HomePage wantOpen />;
}
