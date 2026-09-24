import { FantasyBackground } from "./FantasyBackground";
import { LiveTables } from "./LiveTables";
import { UpcomingTables } from "./UpcomingTables";
import { NewRoomForm } from "@/components/room/NewRoomForm";
import { TopNav } from "@/components/nav/TopNav";
import { WantBoard } from "@/components/wants/WantBoard";
import { WantToPlayButton } from "@/components/wants/WantToPlayButton";

/** The home feed. /play renders it with the "I want to play" dialog already open. */
export function HomePage({ wantOpen = false }: { wantOpen?: boolean }) {
  return (
    <>
      <FantasyBackground />
      <TopNav />
      <main className="mx-auto grid max-w-6xl gap-8 px-5 py-6 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-8">
          <WantToPlayButton defaultOpen={wantOpen} />
          <WantBoard />
          <LiveTables />
          <UpcomingTables />
        </div>
        <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
          <NewRoomForm />
        </aside>
      </main>
    </>
  );
}
