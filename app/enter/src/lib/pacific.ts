/** Pacific-time helpers. All scheduling happens in America/Los_Angeles. */
export const TZ = "America/Los_Angeles";
export const SLOT_MIN = 30;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const partsFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ,
  hourCycle: "h23",
  weekday: "short",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export function pacificParts(d: Date) {
  const p = Object.fromEntries(partsFmt.formatToParts(d).map((x) => [x.type, x.value]));
  return { ymd: `${p.year}-${p.month}-${p.day}`, minutes: Number(p.hour) * 60 + Number(p.minute), weekday: WEEKDAYS.indexOf(p.weekday) };
}

function ymdToUtcMs(ymd: string, minutes = 0) {
  const [y, m, d] = ymd.split("-").map(Number);
  return Date.UTC(y, m - 1, d, 0, minutes);
}

function offsetAt(ms: number) {
  const p = pacificParts(new Date(ms));
  return ymdToUtcMs(p.ymd, p.minutes) - (ms - (ms % 60000));
}

/** Pacific wall-clock date + minutes since midnight -> UTC Date. */
export function pacificToUtc(ymd: string, minutes: number) {
  const guess = ymdToUtcMs(ymd, minutes);
  const o1 = offsetAt(guess);
  let t = guess - o1;
  const o2 = offsetAt(t);
  if (o2 !== o1) t = guess - o2;
  return new Date(t);
}

export const addDays = (ymd: string, n: number) => new Date(ymdToUtcMs(ymd) + n * 86400000).toISOString().slice(0, 10);
export const weekdayOf = (ymd: string) => new Date(ymdToUtcMs(ymd)).getUTCDay();
export const mondayOf = (ymd: string) => addDays(ymd, -((weekdayOf(ymd) + 6) % 7));
export const todayPacific = () => pacificParts(new Date()).ymd;

/** Mon–Sat 9:00–17:00 (Tuesday until 18:00), 30-minute slot start minutes. */
export function slotMinutes(weekday: number) {
  if (weekday === 0) return [];
  const end = weekday === 2 ? 18 * 60 : 17 * 60;
  const out: number[] = [];
  for (let m = 9 * 60; m < end; m += SLOT_MIN) out.push(m);
  return out;
}

const locale = (lang: string) => (lang.startsWith("zh") ? "zh-CN" : "en-US");

export const formatTime = (d: Date | string, lang: string) =>
  new Intl.DateTimeFormat(locale(lang), { timeZone: TZ, hour: "numeric", minute: "2-digit" }).format(new Date(d));

export const formatDateTime = (d: Date | string, lang: string) =>
  new Intl.DateTimeFormat(locale(lang), { timeZone: TZ, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(d));

export const formatLongDate = (d: Date | string, lang: string) =>
  new Intl.DateTimeFormat(locale(lang), { timeZone: TZ, weekday: "long", month: "long", day: "numeric" }).format(new Date(d));

/** Formats a Pacific calendar day (YYYY-MM-DD) without timezone drift. */
export const formatYmd = (ymd: string, lang: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(locale(lang), { timeZone: "UTC", ...opts }).format(new Date(ymdToUtcMs(ymd)));

/** Wall-clock label for minutes since midnight, e.g. 570 -> "9:30 AM". */
export const minutesLabel = (m: number, lang: string) =>
  new Intl.DateTimeFormat(locale(lang), { timeZone: "UTC", hour: "numeric", minute: "2-digit" }).format(new Date(Date.UTC(2000, 0, 1, 0, m)));
