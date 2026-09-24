import type { Timestamp } from "firebase/firestore";
import type { Room } from "./rooms";

const dateFormat = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

/** "Thu, Sep 17, 7:00 PM" in the viewer's locale and time zone. */
export const formatScheduled = (at: Timestamp) => dateFormat.format(at.toDate());

/** "in 2d 3h", "in 45m", or "starting now" once the time has passed. */
export function untilScheduled(at: Timestamp, now = Date.now()) {
  const min = Math.round((at.toMillis() - now) / 60_000);
  if (min <= 0) return "starting now";
  if (min < 60) return `in ${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `in ${h}h ${min % 60}m`;
  return `in ${Math.floor(h / 24)}d ${h % 24}h`;
}

/** Two hours is a reasonable block for a game. */
const EVENT_MS = 2 * 60 * 60_000;

const calendarStamp = (ms: number) => new Date(ms).toISOString().replace(/[-:]|\.\d{3}/g, "");

/** A Google Calendar "add event" link for a scheduled table. */
export function googleCalendarUrl(room: Room, url: string) {
  const start = room.scheduledAt!.toMillis();
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${room.name} · Playmat`,
    dates: `${calendarStamp(start)}/${calendarStamp(start + EVENT_MS)}`,
    details: `${room.description ? room.description + "\n\n" : ""}Join at ${url}`,
    location: url,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}
