import type { GameDefinition } from "../types";

export const swu: GameDefinition = {
  id: "swu",
  name: "Star Wars: Unlimited",
  formats: [
    { id: "premier", name: "Premier", players: [2] },
    { id: "twin-suns", name: "Twin Suns", players: [3, 4] },
  ],
  counters: [
    { id: "baseHp", name: "Base HP", start: 30 },
    { id: "resources", name: "Resources", start: 0 },
    { id: "force", name: "Force", start: 0 },
  ],
  turnLabel: "Initiative",
  deckSlots: [
    { id: "leader", name: "Leader", query: "type:leader" },
    { id: "base", name: "Base", query: "type:base" },
  ],
  deckList: false,
  statLabels: ["Power", "HP"],
  markers: [
    { id: "initiative", name: "Initiative", blurb: "You take the first action this round. Claim it to pass for the phase and hold it next round." },
  ],
  keywords: [
    { id: "exhausted", name: "Exhausted", blurb: "Already attacked or used this round. Readies during the regroup phase." },
    { id: "hidden", name: "Hidden", blurb: "Can't be attacked until the end of the phase it entered play." },
    { id: "sentinel", name: "Sentinel", blurb: "Enemy units attacking into this arena must attack this unit." },
    { id: "saboteur", name: "Saboteur", blurb: "When it attacks, defeat all Shields on the defender and ignore Sentinel." },
    { id: "shielded", name: "Shielded", blurb: "Has a Shield token. The next damage dealt to it is prevented and the Shield is defeated instead." },
    { id: "ambush", name: "Ambush", blurb: "When played, it may ready and attack an enemy unit right away." },
    { id: "overwhelm", name: "Overwhelm", blurb: "Excess damage from its attack is dealt to the defender's base." },
    { id: "raid", name: "Raid", blurb: "Gets extra power while attacking, equal to its Raid value." },
    { id: "restore", name: "Restore", blurb: "When it attacks, heal damage from your base equal to its Restore value." },
    { id: "grit", name: "Grit", blurb: "Gets +1 power for each damage on it." },
  ],
};
