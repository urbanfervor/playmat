import type { GameDefinition } from "../types";

export const mtg: GameDefinition = {
  id: "mtg",
  name: "Magic: The Gathering",
  formats: [
    { id: "commander", name: "Commander", players: [2, 3, 4], startingCounters: { life: 40 } },
    { id: "standard", name: "Standard", players: [2] },
    { id: "pioneer", name: "Pioneer", players: [2] },
    { id: "modern", name: "Modern", players: [2] },
    { id: "legacy", name: "Legacy", players: [2] },
  ],
  counters: [
    { id: "life", name: "Life", start: 20 },
    { id: "poison", name: "Poison", start: 0 },
    { id: "energy", name: "Energy", start: 0 },
    { id: "cmdr", name: "Cmdr", start: 0, perOpponent: true },
  ],
  turnLabel: "Turn",
  deckSlots: [
    { id: "commander", name: "Commander", query: "is:commander", formats: ["commander"] },
    { id: "partner", name: "Partner or background", query: "is:commander", formats: ["commander"], optional: true },
  ],
  deckList: true,
  cards: true,
  statLabels: ["Power", "Toughness"],
  markers: [
    { id: "monarch", name: "Monarch", blurb: "Draw a card at your end step. Whoever deals combat damage to you becomes the monarch." },
    { id: "initiative", name: "Initiative", blurb: "Venture into Undercity at your upkeep. Whoever deals combat damage to you takes the initiative." },
  ],
  keywords: [
    { id: "tapped", name: "Tapped", blurb: "Turned sideways. Can't attack, block, or use tap abilities until it untaps." },
    { id: "sick", name: "Summoning sick", blurb: "Came under your control this turn. Can't attack or use tap abilities yet." },
    { id: "flying", name: "Flying", blurb: "Can only be blocked by creatures with flying or reach." },
    { id: "first-strike", name: "First strike", blurb: "Deals combat damage before creatures without first strike." },
    { id: "deathtouch", name: "Deathtouch", blurb: "Any amount of damage it deals to a creature is enough to destroy it." },
    { id: "lifelink", name: "Lifelink", blurb: "Damage it deals also gains you that much life." },
    { id: "trample", name: "Trample", blurb: "Excess combat damage carries over to the player or planeswalker it's attacking." },
    { id: "hexproof", name: "Hexproof", blurb: "Can't be the target of spells or abilities your opponents control." },
    { id: "indestructible", name: "Indestructible", blurb: "Can't be destroyed by damage or by effects that say destroy." },
    { id: "vigilance", name: "Vigilance", blurb: "Attacking doesn't cause it to tap." },
    { id: "menace", name: "Menace", blurb: "Can't be blocked except by two or more creatures." },
    { id: "haste", name: "Haste", blurb: "Can attack and use tap abilities the turn it comes under your control." },
  ],
};
