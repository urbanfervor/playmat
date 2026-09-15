import type { Metadata } from "next";
import { RoomClient } from "@/components/room/RoomClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Table ${id}`,
    description: "Join this table on Playmat and play over webcam.",
    robots: { index: false },
  };
}

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RoomClient roomId={id} />;
}
