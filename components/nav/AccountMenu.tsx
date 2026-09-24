"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { signInWithGoogle, signOutAccount } from "@/lib/account";
import { useUser } from "@/lib/useUser";
import { useClickOutside } from "@/lib/useClickOutside";
import { Button, buttonClass } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { SettingsMenu, SettingsOptions } from "./SettingsMenu";

/** Optional Google sign-in. Anonymous play keeps working without it. */
export function AccountMenu() {
  const user = useUser();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, open, () => setOpen(false));

  async function signIn() {
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("sign-in failed", err);
    } finally {
      setBusy(false);
    }
  }

  if (!user) return null;
  if (user.isAnonymous) {
    return (
      <>
        <Button variant="ghost" title="Keep your wins and hearts across devices" disabled={busy} onClick={signIn}>
          <Icon name="user" /> Sign in
        </Button>
        <SettingsMenu />
      </>
    );
  }

  const name = user.displayName ?? user.email ?? "Account";
  return (
    <div ref={ref} className="relative">
      <button type="button" title={name} className="flex h-control w-control items-center justify-center" onClick={() => setOpen((o) => !o)}>
        <Avatar name={name} photoURL={user.photoURL} size={24} />
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+4px)] z-30 w-60 rounded-lg border border-line bg-panel p-2 shadow-xl">
          <div className="truncate px-1.5 text-sm font-medium text-fg">{user.displayName ?? "Signed in"}</div>
          {user.email && <div className="truncate px-1.5 pb-2 text-xs text-muted">{user.email}</div>}
          <Link href="/profile" className={`${buttonClass("ghost")} w-full justify-start`} onClick={() => setOpen(false)}>
            <Icon name="user" /> Profile
          </Link>
          <Button variant="ghost" className="w-full justify-start" onClick={() => { setOpen(false); signOutAccount(); }}>
            <Icon name="leave" /> Sign out
          </Button>
          <div className="mt-2 border-t border-line pt-2">
            <SettingsOptions />
          </div>
        </div>
      )}
    </div>
  );
}
