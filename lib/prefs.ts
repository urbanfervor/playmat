export const themes = [
  { id: "graphite", name: "Graphite", swatch: ["#2b2d31", "#d9a441"] },
  { id: "midnight", name: "Midnight", swatch: ["#141b28", "#55c1ff"] },
  { id: "felt", name: "Felt", swatch: ["#15271f", "#e5c56f"] },
  { id: "paper", name: "Paper", swatch: ["#e9e3d6", "#c2410c"] },
] as const;

export const densities = [
  { id: "compact", name: "Compact" },
  { id: "cozy", name: "Cozy" },
  { id: "roomy", name: "Roomy" },
] as const;

export const fonts = [
  { id: "inter", name: "Inter" },
  { id: "manrope", name: "Manrope" },
  { id: "plex", name: "IBM Plex Sans" },
  { id: "grotesk", name: "Space Grotesk" },
] as const;

export type ThemeId = (typeof themes)[number]["id"];
export type DensityId = (typeof densities)[number]["id"];
export type FontId = (typeof fonts)[number]["id"];

export interface Prefs {
  theme: ThemeId;
  density: DensityId;
  font: FontId;
}

export const defaults: Prefs = { theme: "graphite", density: "compact", font: "inter" };

export function currentPrefs(): Prefs {
  const d = document.documentElement.dataset;
  return {
    theme: (d.theme as ThemeId) || defaults.theme,
    density: (d.density as DensityId) || defaults.density,
    font: (d.font as FontId) || defaults.font,
  };
}

export function applyPref<K extends keyof Prefs>(key: K, value: Prefs[K]) {
  document.documentElement.dataset[key] = value;
  localStorage.setItem(`playmat:${key}`, value);
}

/** Runs before paint so saved preferences never flash. */
export const prefsInitScript = `try{var d=document.documentElement.dataset,s=localStorage;${(
  Object.keys(defaults) as (keyof Prefs)[]
)
  .map((k) => `d.${k}=s.getItem("playmat:${k}")||"${defaults[k]}";`)
  .join("")}}catch{}`;
