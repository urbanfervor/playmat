/** Keyboard shortcuts at the table. `keys` are display labels; handling lives in components/table/Hotkeys.tsx. */
export const shortcuts: { keys: string[]; label: string }[] = [
  { keys: ["Space"], label: "Pass turn" },
  { keys: ["↑", "↓"], label: "Life +1 / −1" },
  { keys: ["⇧ ↑", "⇧ ↓"], label: "Life +5 / −5" },
  { keys: ["S"], label: "Show a card" },
  { keys: ["D"], label: "Roll d6" },
  { keys: ["R"], label: "Roll d20" },
  { keys: ["F"], label: "Flip a coin" },
  { keys: ["C"], label: "Camera on / off" },
  { keys: ["M"], label: "Mute / unmute" },
  { keys: ["T"], label: "Hold to talk while muted" },
  { keys: ["/"], label: "Type in chat" },
  { keys: ["?"], label: "Show shortcuts" },
  { keys: ["Esc"], label: "Close" },
];
