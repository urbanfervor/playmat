"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useJoinAlertsSetting } from "@/lib/joinAlerts";
import { deleteRoom, isAdmin, takeHost } from "@/lib/admin";
import { useUser } from "@/lib/useUser";
import { leaveRoom, passTurn, rollDie, setSeats, startGame, updateRoom, type Player } from "@/lib/rooms";
import type { TableProps } from "./Table";
import { Button, IconButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { GameStatus } from "./GameStatus";
import { Spectators } from "./Spectators";

function Divider() {
  return <span className="mx-1 h-5 w-px bg-line" />;
}

interface Props extends Omit<TableProps, "me"> {
  me: Player;
  onSearch: () => void;
  onShortcuts: () => void;
  onSettings: () => void;
  onDeck: () => void;
  onWinner: () => void;
  /** Opens the chat and log sheet on phones. */
  onPanel: () => void;
}

export function Toolbar({ roomId, game, room, players, me, onSearch, onShortcuts, onSettings, onDeck, onWinner, onPanel }: Props) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const roll = (sides: number) => rollDie(roomId, me.name, sides);
  const active = players.find((p) => p.uid === room.turn.playerUid);
  const myTurn = active?.uid === me.uid;
  const isHost = me.uid === room.hostUid;
  const seatOptions = game.formats.find((f) => f.id === room.format)?.players ?? [];
  const winner = players.find((p) => p.uid === room.winnerUid);
  const over = room.status === "over";
  const alerts = useJoinAlertsSetting();
  const admin = isAdmin(useUser());

  async function leave() {
    if (me.uid === room.hostUid) {
      const next = players.find((p) => p.uid !== me.uid);
      if (next) await updateRoom(roomId, { hostUid: next.uid });
    }
    await leaveRoom(roomId, me);
    router.push("/");
  }
  async function closeTable() {
    if (!confirm(`Close “${room.name}”? This removes the table for everyone.`)) return;
    await deleteRoom(roomId);
    router.push("/");
  }
  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-0.5 border-t border-line bg-bg-2 px-2 py-1 md:h-bar md:flex-nowrap md:overflow-x-auto md:py-0">
      <GameStatus roomId={roomId} room={room} players={players} editable={isHost} onOver={onWinner} />
      {over && (winner || isHost) && (
        <Button variant="ghost" className="text-amber-400" title={isHost ? "Change the winner" : undefined} disabled={!isHost} onClick={onWinner}>
          <Icon name="trophy" /> {winner ? `${winner.name} won` : "Pick winner"}
        </Button>
      )}
      {isHost && (
        <>
          <IconButton title="Table settings: name, description, format" onClick={onSettings}>
            <Icon name="gear" />
          </IconButton>
          <IconButton
            title={alerts.on ? "Join alerts on: tone and desktop notification when someone sits down" : "Join alerts off"}
            className={alerts.on ? undefined : "text-muted"}
            onClick={alerts.toggle}
          >
            <Icon name={alerts.on ? "bell" : "bell-off"} />
          </IconButton>
          {alerts.needsPermission && (
            <Button variant="ghost" className="text-accent" title="Desktop notifications need your permission once" onClick={alerts.requestPermission}>
              Allow notifications
            </Button>
          )}
        </>
      )}
      <Divider />
      {active ? (
        <>
          <span className={`whitespace-nowrap px-1 text-ui ${myTurn ? "font-medium text-accent" : "text-muted"}`}>
            {myTurn ? `Your ${game.turnLabel.toLowerCase()}` : `${active.name}'s ${game.turnLabel.toLowerCase()}`}
          </span>
          <Button variant={myTurn ? "primary" : "ghost"} onClick={() => passTurn(roomId, room, players)}>
            Pass <Icon name="arrow-right" size={13} />
          </Button>
        </>
      ) : (
        <Button variant="primary" onClick={() => startGame(roomId, players)}>Start game</Button>
      )}
      {isHost && seatOptions.length > 1 && (
        <>
          <Divider />
          <span className="whitespace-nowrap px-1 text-ui text-muted">Seats</span>
          {seatOptions.map((n) => (
            <Button
              key={n}
              variant="ghost"
              active={(room.seats ?? 4) === n}
              disabled={n < players.length}
              title={n < players.length ? "Too many players seated" : `${n} seats`}
              onClick={() => setSeats(roomId, n)}
            >
              {n}
            </Button>
          ))}
        </>
      )}
      <Divider />
      {game.cards && (
        <>
          <Button variant="ghost" onClick={onSearch}>
            <Icon name="card" /> Show card
          </Button>
          <Button variant="ghost" title={me.deck ? "Edit your deck" : "Set your deck"} onClick={onDeck}>
            <Icon name="deck" /> Deck
          </Button>
        </>
      )}
      <Button variant="ghost" onClick={() => roll(6)}>
        <Icon name="dice" /> d6
      </Button>
      <Button variant="ghost" onClick={() => roll(20)}>
        <Icon name="dice" /> d20
      </Button>
      <Button variant="ghost" onClick={() => roll(2)}>
        <Icon name="coin" /> Coin
      </Button>
      {room.lastRoll && (
        <span className="ml-2 whitespace-nowrap text-ui text-muted">
          {room.lastRoll.by} rolled d{room.lastRoll.sides}
          <span className="ml-1.5 rounded bg-panel px-1.5 py-0.5 font-mono font-semibold text-fg">{room.lastRoll.value}</span>
        </span>
      )}
      <span className="ml-auto flex items-center gap-0.5">
        <Spectators players={players} />
        <IconButton title="Keyboard shortcuts (?)" className="max-md:hidden" onClick={onShortcuts}>
          <Icon name="keyboard" />
        </IconButton>
      </span>
      <Button variant="ghost" className="md:hidden" onClick={onPanel}>
        <Icon name="chat" /> Chat
      </Button>
      <Button variant="ghost" onClick={copyLink}>
        <Icon name={copied ? "check" : "link"} /> {copied ? "Copied" : "Invite"}
      </Button>
      <Button variant="ghost" title="Leave the table and free your seat" onClick={leave}>
        <Icon name="leave" /> Leave
      </Button>
      {admin && !isHost && (
        <Button variant="ghost" title="Admin: make yourself the host" onClick={() => takeHost(roomId, me.uid, me.name)}>
          <Icon name="crown" /> Take over hosting
        </Button>
      )}
      {admin && (
        <Button variant="ghost" className="text-danger" title="Admin: delete this table for everyone" onClick={closeTable}>
          <Icon name="trash" /> Close table
        </Button>
      )}
    </div>
  );
}
