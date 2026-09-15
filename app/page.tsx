import { FantasyBackground } from "@/components/home/FantasyBackground";
import { NewRoomForm } from "@/components/room/NewRoomForm";
import { LiveTables } from "@/components/home/LiveTables";
import { TopNav } from "@/components/nav/TopNav";

export default function Home() {
  return (
    <>
      <FantasyBackground />
      <TopNav />
      <main className="mx-auto grid max-w-6xl gap-8 px-5 py-6 lg:grid-cols-[1fr_300px]">
        <LiveTables />
        <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
          <NewRoomForm />
        </aside>
      </main>
    </>
  );
}
