"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IconButton, iconButtonClass } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { AccountMenu } from "./AccountMenu";
import { NavRecord } from "./NavRecord";
import { FriendsMenu } from "@/components/friends/FriendsMenu";

const KEY = "playmat:nav";

interface Props {
  roomId?: string;
  title?: string;
  isPrivate?: boolean;
  /** Where the leave button goes; home by default. */
  leaveHref?: string;
}

export function TopNav({ roomId, title, isPrivate, leaveHref = "/" }: Props) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    try {
      setOpen(localStorage.getItem(KEY) !== "closed");
    } catch {}
  }, []);

  function toggle(next: boolean) {
    setOpen(next);
    try {
      localStorage.setItem(KEY, next ? "open" : "closed");
    } catch {}
  }

  if (!open) {
    return (
      <button
        type="button"
        title="Show navigation"
        className="fixed right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-panel shadow-lg hover:bg-panel-2"
        onClick={() => toggle(true)}
      >
        <Logo />
      </button>
    );
  }

  return (
    <header className="flex h-bar shrink-0 items-center gap-2 border-b border-line bg-bg-2 px-3 sm:gap-3">
      <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight text-fg">
        <Logo />
        <span className={roomId ? "hidden sm:inline" : ""}>Playmat</span>
      </Link>
      {roomId && (
        <>
          <span className="h-4 w-px bg-line" />
          <span className="hidden min-w-0 truncate text-muted sm:inline">{title}</span>
          <span className="rounded bg-panel px-1.5 py-0.5 font-mono text-xs tracking-wider text-fg">{roomId}</span>
          {isPrivate && <span title="Private table: not listed, join by link"><Icon name="lock" size={13} className="text-muted" /></span>}
        </>
      )}
      <div className="ml-auto flex shrink-0 items-center gap-0.5">
        <NavRecord />
        <FriendsMenu />
        <AccountMenu />
        {roomId && (
          <Link href={leaveHref} title="Leave table" className={iconButtonClass}>
            <Icon name="leave" />
          </Link>
        )}
        <span className={roomId ? "contents" : "hidden sm:contents"}>
          <IconButton title="Hide navigation" onClick={() => toggle(false)}>
            <Icon name="chevron-up" />
          </IconButton>
        </span>
      </div>
    </header>
  );
}
