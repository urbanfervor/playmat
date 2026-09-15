# Playmat (playmat.games) — plan of attack

Webcam tabletop for physical card games. Competitor to SpellTable and Convoke.
MTG and Star Wars: Unlimited (SWU) are first-class; other games plug in.

## 1. Name

**Playmat**, domain **playmat.games**. Game-agnostic so SWU and future games fit.

## 2. Stack (follows repo conventions)

| Layer | Choice | Why |
|---|---|---|
| App | Next.js 15 App Router, React 19, TS, Tailwind 4 | matches `flick.bid` / `copquest` |
| Video | **LiveKit Cloud** (SFU) | 4-player mesh WebRTC is fragile; free tier covers early users; can self-host on GCE later |
| Auth | Firebase Auth (anonymous + Google) | anon lets people join a link with zero friction |
| Realtime state | Firestore (`rooms/{id}`, `rooms/{id}/players/{uid}`) | low write rate; snapshots give sync for free |
| Card data | Scryfall (MTG), swu-db.com API (SWU) | both free, no key |
| Server bits | Next route handlers on Cloud Run | LiveKit token minting, card proxy/cache |
| Deploy | Docker → Cloud Run via `cloudbuild.yaml`, project `sixth-oxygen` | same as `vada.games` |

Not needed at v1: Postgres/Data Connect, Cloud Functions, a separate API service.

## 3. Architecture

```
playmat/
  app/
    page.tsx                 landing + "new room"
    room/[id]/page.tsx       the table
    api/livekit/token        mint join token (checks room membership)
    api/cards/[game]/search  proxy + cache to Scryfall / swu-db
  components/
    table/                   video grid, layouts (1v1, 3, 4-pod)
    overlay/                 per-player HUD: life, counters, turn marker
    cards/                   search modal, card preview
  games/
    types.ts                 GameDefinition interface
    mtg/                     counters, formats, Scryfall adapter
    swu/                     base HP, resources, damage, swu-db adapter
    index.ts                 registry
  lib/firebase.ts, lib/livekit.ts
```

### Game plugin interface (the "door left open")

```ts
interface GameDefinition {
  id: 'mtg' | 'swu' | string;
  name: string;
  formats: { id: string; name: string; players: number[]; startingLife?: number }[];
  counters: CounterDef[];        // MTG: life, poison, cmdr damage, energy. SWU: base HP, resources, damage
  turnStructure?: string[];      // optional phase labels
  cards: CardProvider;           // search(query) → CardSummary[], image(id) → url
  layout?: LayoutHints;          // e.g. SWU wants base/leader visible
}
```

Adding a game = one folder implementing this. No UI changes.

### Room state (Firestore)

```
rooms/{id}: { game, format, hostUid, createdAt, turn: { playerUid, phase }, status }
rooms/{id}/players/{uid}: { name, seat, counters: {life: 40, ...}, revealedCard?: CardRef }
```

Video never touches Firestore. Firestore is only for game state and presence.

## 4. Phases

**Phase 0 — Scaffold (1 day)**
- `create-next-app`, Tailwind, Dockerfile + `cloudbuild.yaml` copied from `vada.games`.
- Firebase web config, anonymous auth, Firestore rules (only room members write their own player doc).
- Deploy an empty page to Cloud Run so the pipeline works from day one.

**Phase 1 — Rooms + video (1 week)** ← usable for real games
- Create room → shareable link → join with a display name.
- LiveKit: publish cam, subscribe to others, 1v1 and 4-pod layouts.
- Per-player camera controls: pick device, mirror, rotate 180° (top-down cams are upside down), mute.
- Presence: who's in the room, host can kick.

**Phase 2 — Game layer (1 week)**
- `GameDefinition` + registry, MTG and SWU definitions.
- Counter HUD synced via Firestore. Turn/priority marker, pass-turn button.
- Format picker at room creation (Commander, Standard, Modern / SWU Premier, Twin Suns).
- Dice/coin flip, shared timer.

**Phase 3 — Card lookup (1 week)**
- Search overlay with autocomplete, backed by `/api/cards/[game]/search`. Reuse `games/mtg-commander/server/scryfall.ts`.
- "Show card": pin a card image next to your video so opponents can read it.
- Rules text + oracle for MTG, full card text for SWU.

**Phase 4 — Click-to-identify (2 weeks, the SpellTable feature)**
- Click a card in an opponent's video → crop frame → identify.
- Start with a Vision LLM call (crop → name → card search). Cheap to build, good enough to validate.
- If cost or latency bites: perceptual hash index of Scryfall/swu-db art crops, matched client-side.

**Phase 5 — Polish + launch**
- Phone-as-camera flow (scan QR from phone, joins as second video track).
- Spectator links, room persistence for recurring pods.
- Custom domain, Analytics, error reporting.
- Optional later: Discord bot for scheduling, deck import (Moxfield / swudb) for pre-built card lists.

## 5. Status

Phases 0–4 are built (rooms, LiveKit video, MTG/SWU counters and turn marker, card search + show card, click-to-identify).
To run: fill `.env.example` values (Firebase web app config, LiveKit Cloud keys, Anthropic API key) and deploy `firestore.rules`.
Click-to-identify uses a vision model call per click; swap in perceptual hashing if cost or latency bites.

## 6. Out of scope for v1

Rules enforcement, digital card manipulation, deck building, matchmaking, mobile app.
