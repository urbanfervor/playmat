"use client";
import { useState } from "react";
import type { GameDefinition } from "@/games/types";
import { updateTableSettings, type Player, type Room } from "@/lib/rooms";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field } from "@/components/ui/Field";
import { Input, inputClass } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface Props {
  roomId: string;
  game: GameDefinition;
  room: Room;
  players: Player[];
  onClose: () => void;
}

/** Host-only editor for the table's name, description, format and visibility. */
export function TableSettings({ roomId, game, room, players, onClose }: Props) {
  const [name, setName] = useState(room.name);
  const [description, setDescription] = useState(room.description ?? "");
  const [format, setFormat] = useState(room.format);
  const [isPrivate, setPrivate] = useState(room.private ?? false);
  const tooSmall = (f: GameDefinition["formats"][number]) => Math.max(...f.players) < players.length;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await updateTableSettings(roomId, room, { name: name.trim(), description: description.trim(), format, private: isPrivate });
    onClose();
  }

  return (
    <Dialog onClose={onClose} className="max-w-sm">
      <h2 className="text-sm font-semibold text-fg">Table settings</h2>
      <form className="flex flex-col gap-3" onSubmit={save}>
        <Field label="Table name">
          <Input value={name} maxLength={60} autoFocus onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Description">
          <textarea
            className={`${inputClass} min-h-20 resize-y py-1.5 text-sm`}
            placeholder="House rules, power level, who's welcome…"
            value={description}
            maxLength={300}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        <Field label="Game">
          <Input value={game.name} disabled title="Start a new table to play a different game" />
        </Field>
        <Field label="Format">
          <Select value={format} onChange={(e) => setFormat(e.target.value)}>
            {game.formats.map((f) => (
              <option key={f.id} value={f.id} disabled={tooSmall(f)}>
                {f.name} · {f.players.join("/")} players{tooSmall(f) ? " · too many seated" : ""}
              </option>
            ))}
          </Select>
        </Field>
        <label className="flex items-center gap-2 text-sm text-fg">
          <input type="checkbox" className="accent-accent" checked={isPrivate} onChange={(e) => setPrivate(e.target.checked)} />
          Private
          <span className="text-xs text-muted">· not listed on the home page, join by link only</span>
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" size="md" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" size="md" disabled={!name.trim()}>Save</Button>
        </div>
      </form>
    </Dialog>
  );
}
