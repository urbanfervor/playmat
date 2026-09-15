import { Profile } from "@/components/profile/Profile";
import { TopNav } from "@/components/nav/TopNav";

export default function ProfilePage() {
  return (
    <>
      <TopNav />
      <main className="mx-auto flex max-w-xl flex-col gap-4 px-5 py-6">
        <Profile />
      </main>
    </>
  );
}
