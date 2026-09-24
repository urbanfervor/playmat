"use client";
import { useRecord } from "@/lib/profile";
import { useUser } from "@/lib/useUser";
import { signInWithGoogle, signOutAccount } from "@/lib/account";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Stats } from "@/components/profile/Stats";
import { Avatar } from "@/components/ui/Avatar";
import { GameHistory } from "@/components/profile/GameHistory";
import { AllTables } from "@/components/profile/AllTables";
import { isAdmin } from "@/lib/admin";

/** The signed-in player's account, record, and recent games. */
export function Profile() {
  const user = useUser();
  const record = useRecord(user?.uid);
  if (!user || !record) return <p className="text-muted">Loading…</p>;

  const name = user.isAnonymous ? "Guest" : (user.displayName ?? user.email ?? "Account");
  return (
    <>
      <section className="flex flex-col gap-5 rounded-lg border border-line bg-panel p-5">
        <div className="flex items-center gap-4">
          <Avatar name={name} photoURL={user.photoURL} size={56} />
          <div className="flex min-w-0 flex-1 flex-col">
            <h1 className="truncate text-lg font-semibold text-fg">{name}</h1>
            {user.email && <span className="truncate text-xs text-muted">{user.email}</span>}
            {user.isAnonymous && <span className="text-xs text-muted">Playing as a guest. This record lives in this browser only.</span>}
          </div>
        </div>
        <Stats record={record} size="lg" />
        <p className="text-xs text-muted">Games count once they start with you at the table. Wins are recorded by the host. Hearts come from people you played with.</p>
        <div className="flex justify-end border-t border-line pt-3">
          {user.isAnonymous ? (
            <Button onClick={() => signInWithGoogle().catch((err) => console.error("sign-in failed", err))}>
              <Icon name="user" /> Sign in with Google to keep it
            </Button>
          ) : (
            <Button variant="ghost" onClick={signOutAccount}>
              <Icon name="leave" /> Sign out
            </Button>
          )}
        </div>
      </section>
      <GameHistory uid={user.uid} />
      {isAdmin(user) && <AllTables />}
    </>
  );
}
