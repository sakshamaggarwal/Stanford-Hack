// OwnHomeForYou CRM backend function.
// Actions:
//   availability { token }                    public  – seat counts per 30-min slot (Pacific)
//   book         { token, slotStart, origin } public  – auto-assign a consultant, book, send emails
//   email_view   { token }                    public  – data for the hosted (Chinese / English) email page
//   follow_up    { customerId, origin }       admin   – smart follow-up: reminder if booked, else booking invite
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

/* ---------------------------------------------------------------- time (Pacific) */
const TZ = "America/Los_Angeles";
const SLOT_MIN = 30;
const BOOKING_WINDOW_DAYS = 21;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const partsFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ, hourCycle: "h23", weekday: "short", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
});

function pacificParts(d: Date) {
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
/** Pacific wall-clock (date + minutes since midnight) -> UTC Date. */
function pacificToUtc(ymd: string, minutes: number) {
  const guess = ymdToUtcMs(ymd, minutes);
  const o1 = offsetAt(guess);
  let t = guess - o1;
  const o2 = offsetAt(t);
  if (o2 !== o1) t = guess - o2;
  return new Date(t);
}
function addDays(ymd: string, n: number) {
  return new Date(ymdToUtcMs(ymd) + n * 86400000).toISOString().slice(0, 10);
}
function weekdayOf(ymd: string) {
  return new Date(ymdToUtcMs(ymd)).getUTCDay();
}
/** Mon–Sat 9:00–17:00 (Tuesday until 18:00), 30-minute slots. Returns slot start minutes. */
function slotMinutes(weekday: number) {
  if (weekday === 0) return [];
  const end = weekday === 2 ? 18 * 60 : 17 * 60;
  const out: number[] = [];
  for (let m = 9 * 60; m < end; m += SLOT_MIN) out.push(m);
  return out;
}
function formatSlot(iso: string, lang: "en" | "zh") {
  return new Intl.DateTimeFormat(lang === "zh" ? "zh-CN" : "en-US", {
    timeZone: TZ, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  }).format(new Date(iso)) + (lang === "zh" ? "（太平洋时间）" : " PT");
}

/* ---------------------------------------------------------------- assignment */
type ConsultantRow = { id: string; code: string; name: string; sort_order: number };
type DayBooking = { consultant_id: string; slot_start: string };

/**
 * Auto-assignment for one slot:
 *  (a) only consultants free in that slot
 *  (b) sort by fewest bookings that day, tie-break by consultant order C1→C5
 *  (c) skip anyone whose booking would be back-to-back (adjacent slot before/after) if a non-back-to-back candidate exists
 *  (d) if every candidate would be back-to-back, take the least-booked
 */
function pickConsultant(consultants: ConsultantRow[], dayBookings: DayBooking[], slotMs: number): ConsultantRow | null {
  const busyAt = (cid: string, ms: number) => dayBookings.some((b) => b.consultant_id === cid && Date.parse(b.slot_start) === ms);
  const free = consultants.filter((c) => !busyAt(c.id, slotMs));
  if (!free.length) return null;
  const load = (cid: string) => dayBookings.filter((b) => b.consultant_id === cid).length;
  const ranked = [...free].sort((a, b) => load(a.id) - load(b.id) || a.sort_order - b.sort_order);
  const step = SLOT_MIN * 60000;
  const backToBack = (c: ConsultantRow) => busyAt(c.id, slotMs - step) || busyAt(c.id, slotMs + step);
  return ranked.find((c) => !backToBack(c)) ?? ranked[0];
}

/* ---------------------------------------------------------------- email */
const NEED_LABEL: Record<string, string> = {
  buy: "Buy home", sell: "Sell home", purchase_loan: "Purchase loan", refinance: "Refinance", learning: "Just learning",
};
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

type Customer = {
  id: string; name: string; email: string; phone: string | null; need_type: string; timeline: string;
  booking_token: string; notes: string;
};
type BookingInfo = { slotStart: string; consultantName: string };

function emailHtml(kind: "booking_invite" | "reminder", c: Customer, origin: string, booking: BookingInfo | null) {
  const first = esc(c.name.split(" ")[0]);
  const bookUrl = `${origin}/book/${c.booking_token}`;
  const type = kind === "reminder" ? "reminder" : "invite";
  const zhUrl = `${origin}/email/${c.booking_token}?type=${type}&lang=zh-CN`;
  const btn = (href: string, label: string) =>
    `<a href="${href}" style="display:inline-block;background:#d9a032;color:#1a2547;font-weight:700;font-size:16px;text-decoration:none;padding:14px 28px;border-radius:12px">${label}</a>`;
  const about = `GCFRI is a California real estate &amp; mortgage brokerage helping families buy, sell and finance homes, in English and Chinese.`;
  const body = kind === "booking_invite"
    ? `<p style="margin:0 0 14px">Hi ${first},</p>
       <p style="margin:0 0 14px">Thank you for attending the GCFRI home-buying seminar. It was great to meet you.</p>
       <p style="margin:0 0 26px;color:#5b6475">${about}</p>
       <div style="text-align:center;margin:0 0 26px">${btn(bookUrl, "Book your free consultation")}</div>
       <p style="margin:0;color:#5b6475;font-size:13px">30 minutes, one-on-one with a licensed consultant. Mon–Sat, 9 AM–5 PM Pacific.</p>`
    : `<p style="margin:0 0 14px">Hi ${first},</p>
       <p style="margin:0 0 18px">Thank you for attending the GCFRI home-buying seminar. Your free consultation is confirmed.</p>
       <table role="presentation" width="100%" style="background:#f7f3ea;border-radius:12px;margin:0 0 22px"><tr><td style="padding:18px 20px">
         <div style="font-size:12px;color:#7a6a45;text-transform:uppercase;letter-spacing:.06em">When</div>
         <div style="font-size:18px;font-weight:700;color:#1a2547;margin:2px 0 12px">${esc(formatSlot(booking!.slotStart, "en"))}</div>
         <div style="font-size:12px;color:#7a6a45;text-transform:uppercase;letter-spacing:.06em">Your consultant</div>
         <div style="font-size:16px;font-weight:600;color:#1a2547;margin-top:2px">${esc(booking!.consultantName)}</div>
       </td></tr></table>
       <p style="margin:0 0 22px;color:#5b6475">${about}</p>
       <p style="margin:0">Need a different time? <a href="${bookUrl}" style="color:#b9781f;font-weight:600">Reschedule here</a>.</p>`;
  return `<!doctype html><html><body style="margin:0;background:#f4f1ea;font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;color:#1a2547">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ea;padding:24px 12px"><tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
    <tr><td style="text-align:right;padding:0 4px 8px;font-size:12px"><a href="${zhUrl}" style="color:#b9781f;text-decoration:none">查看中文版</a></td></tr>
    <tr><td style="background:#1a2547;border-radius:16px 16px 0 0;padding:22px 28px">
      <div style="font-size:20px;font-weight:800;color:#fbf8f1">Own<span style="color:#d9a032">Home</span>ForYou</div>
      <div style="font-size:12px;color:#c9cfe0;margin-top:2px">Journey to your home · 安家之路</div>
    </td></tr>
    <tr><td style="background:#ffffff;padding:28px;border-radius:0 0 16px 16px;font-size:15px;line-height:1.6">${body}</td></tr>
    <tr><td style="padding:16px 8px;font-size:11px;color:#8a8f9c;text-align:center">
      GCFRI · OwnHomeForYou · California<br/>Demo mode: this email was intended for ${esc(c.name)} &lt;${esc(c.email)}&gt;.
    </td></tr>
  </table></td></tr></table></body></html>`;
}

function icsFor(bookingId: string, c: Customer, consultant: string, slotStart: string, inbox: string) {
  const fmt = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const start = Date.parse(slotStart);
  const desc = `Customer: ${c.name}\\nEmail: ${c.email}\\nPhone: ${c.phone ?? "-"}\\nNeed: ${NEED_LABEL[c.need_type] ?? c.need_type}\\nNotes: ${(c.notes || "-").replace(/\n/g, "\\n")}`;
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//OwnHomeForYou//Scheduler//EN", "METHOD:REQUEST", "BEGIN:VEVENT",
    `UID:${bookingId}@ownhomeforyou`, `DTSTAMP:${fmt(Date.now())}`, `DTSTART:${fmt(start)}`, `DTEND:${fmt(start + SLOT_MIN * 60000)}`,
    `SUMMARY:Free consultation – ${c.name}`, `DESCRIPTION:${desc}`,
    `ORGANIZER;CN=OwnHomeForYou:mailto:${inbox}`, `ATTENDEE;CN=${consultant};RSVP=TRUE:mailto:${inbox}`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
}

async function testInbox() {
  const { data } = await db.from("app_settings").select("test_inbox").eq("id", 1).maybeSingle();
  return data?.test_inbox || "mani.saksham12@gmail.com, sakshamtech12@gmail.com";
}

/** Sends via Resend to the demo test inbox and logs the attempt on the customer. */
async function sendAndLog(opts: {
  customerId: string; type: "booking_invite" | "reminder" | "consultant_invite"; subject: string; html: string;
  attachments?: { filename: string; content: string }[];
}) {
  const inbox = await testInbox();
  let status: "sent" | "failed" = "sent";
  let error: string | null = null;
  let providerId: string | null = null;
  try {
    const key = Deno.env.get("RESEND_API_KEY")?.trim();
    if (!key) throw new Error("Email provider key (RESEND_API_KEY) is not configured");
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: Deno.env.get("RESEND_FROM") || "OwnHomeForYou <onboarding@resend.dev>",
        to: inbox.split(/[,;\s]+/).filter(Boolean), subject: opts.subject, html: opts.html, attachments: opts.attachments,
      }),
    });
    if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
    providerId = ((await res.json()) as { id?: string }).id ?? null;
    console.log("[crm] email sent", opts.type, opts.customerId, providerId);
  } catch (e) {
    status = "failed";
    error = e instanceof Error ? e.message : String(e);
    console.error("[crm] email failed", opts.type, opts.customerId, error);
  }
  await db.from("email_log").insert({ customer_id: opts.customerId, email_type: opts.type, sent_to: inbox, subject: opts.subject, status, error, provider_id: providerId });
  return { status, error, sentTo: inbox, providerId };
}

async function sendCustomerEmail(c: Customer, origin: string, booking: BookingInfo | null) {
  if (booking) {
    return sendAndLog({
      customerId: c.id, type: "reminder",
      subject: `[To: ${c.name}] Your GCFRI consultation – ${formatSlot(booking.slotStart, "en")}`,
      html: emailHtml("reminder", c, origin, booking),
    });
  }
  return sendAndLog({
    customerId: c.id, type: "booking_invite",
    subject: `[To: ${c.name}] Thank you for attending the GCFRI seminar – book your free consultation`,
    html: emailHtml("booking_invite", c, origin, null),
  });
}

/* ---------------------------------------------------------------- data helpers */
const CUSTOMER_COLS = "id,name,email,phone,need_type,timeline,booking_token,notes";

async function customerByToken(token: unknown) {
  if (typeof token !== "string" || !/^[0-9a-f-]{36}$/i.test(token)) return null;
  const { data } = await db.from("customers").select(CUSTOMER_COLS).eq("booking_token", token).maybeSingle();
  return data as Customer | null;
}

async function currentBooking(customerId: string): Promise<(BookingInfo & { id: string }) | null> {
  const { data } = await db.from("bookings")
    .select("id,slot_start,consultants(name)")
    .eq("customer_id", customerId).eq("status", "booked")
    .order("slot_start", { ascending: false }).limit(1).maybeSingle();
  if (!data) return null;
  const consultant = data.consultants as unknown as { name: string } | null;
  return { id: data.id, slotStart: data.slot_start, consultantName: consultant?.name ?? "" };
}

function cleanOrigin(o: unknown, req: Request) {
  const v = typeof o === "string" ? o : req.headers.get("origin") ?? "";
  return /^https?:\/\/[^\s/]+$/.test(v) ? v : "https://ownhomeforyou.app";
}

/* ---------------------------------------------------------------- actions */
async function availability(body: Record<string, unknown>) {
  const c = await customerByToken(body.token);
  if (!c) return json({ error: "not_found" }, 404);
  const { count: seats } = await db.from("consultants").select("id", { count: "exact", head: true });
  const today = pacificParts(new Date()).ymd;
  const wd = weekdayOf(today);
  const monday = addDays(today, -((wd + 6) % 7));
  const lastDay = addDays(monday, 20);
  const { data: rows } = await db.from("bookings").select("slot_start")
    .eq("status", "booked")
    .gte("slot_start", pacificToUtc(monday, 0).toISOString())
    .lt("slot_start", pacificToUtc(addDays(lastDay, 1), 0).toISOString());
  const counts = new Map<number, number>();
  for (const r of rows ?? []) counts.set(Date.parse(r.slot_start), (counts.get(Date.parse(r.slot_start)) ?? 0) + 1);
  const now = Date.now();
  const days = [];
  for (let i = 0; i <= 20; i++) {
    const ymd = addDays(monday, i);
    const mins = slotMinutes(weekdayOf(ymd));
    if (!mins.length) continue;
    days.push({
      date: ymd,
      slots: mins.map((m) => {
        const start = pacificToUtc(ymd, m);
        const taken = counts.get(start.getTime()) ?? 0;
        return { start: start.toISOString(), seatsLeft: Math.max(0, (seats ?? 5) - taken), past: start.getTime() <= now };
      }),
    });
  }
  const current = await currentBooking(c.id);
  const booking = current ? { slotStart: current.slotStart, consultantName: current.consultantName } : null;
  return json({ customer: { firstName: c.name.split(" ")[0] }, capacity: seats ?? 5, today, booking, days });
}

async function book(body: Record<string, unknown>, req: Request) {
  const c = await customerByToken(body.token);
  if (!c) return json({ error: "not_found" }, 404);
  const slotMs = typeof body.slotStart === "string" ? Date.parse(body.slotStart) : NaN;
  if (!Number.isFinite(slotMs) || slotMs % (SLOT_MIN * 60000) !== 0) return json({ error: "invalid_slot" }, 400);
  const p = pacificParts(new Date(slotMs));
  if (!slotMinutes(p.weekday).includes(p.minutes)) return json({ error: "outside_hours" }, 400);
  if (slotMs <= Date.now() || slotMs > Date.now() + BOOKING_WINDOW_DAYS * 86400000) return json({ error: "out_of_window" }, 400);
  const slotIso = new Date(slotMs).toISOString();

  const previous = await currentBooking(c.id);
  if (previous && Date.parse(previous.slotStart) === slotMs) {
    return json({ booking: { slotStart: previous.slotStart, consultantName: previous.consultantName }, alreadyBooked: true });
  }

  const { data: consultants } = await db.from("consultants").select("id,code,name,sort_order").order("sort_order");
  const dayStart = pacificToUtc(p.ymd, 0).toISOString();
  const dayEnd = pacificToUtc(addDays(p.ymd, 1), 0).toISOString();

  let created: { id: string; consultant: ConsultantRow } | null = null;
  for (let attempt = 0; attempt < 6 && !created; attempt++) {
    const { data: dayBookings } = await db.from("bookings").select("consultant_id,slot_start")
      .eq("status", "booked").gte("slot_start", dayStart).lt("slot_start", dayEnd)
      .neq("id", previous?.id ?? "00000000-0000-0000-0000-000000000000");
    const pick = pickConsultant((consultants ?? []) as ConsultantRow[], dayBookings ?? [], slotMs);
    if (!pick) return json({ error: "slot_full" }, 409);
    const { data, error } = await db.from("bookings")
      .insert({ customer_id: c.id, consultant_id: pick.id, slot_start: slotIso }).select("id").single();
    if (!error) created = { id: data.id, consultant: pick };
    else if (error.code !== "23505") {
      console.error("[crm] booking insert failed", error);
      return json({ error: "booking_failed" }, 500);
    } // 23505 = consultant just got taken concurrently → recompute and retry
  }
  if (!created) return json({ error: "slot_full" }, 409);

  if (previous) await db.from("bookings").update({ status: "cancelled" }).eq("id", previous.id);
  await db.from("customers")
    .update({ meeting_scheduled: true, last_appointment: slotIso, consultant_id: created.consultant.id })
    .eq("id", c.id);
  console.log("[crm] booked", c.id, slotIso, created.consultant.code, previous ? `rescheduled from ${previous.slotStart}` : "");

  const origin = cleanOrigin(body.origin, req);
  const info = { slotStart: slotIso, consultantName: created.consultant.name };
  const inbox = (await testInbox()).split(/[,;\s]+/).filter(Boolean)[0];
  // Sequential sends: Resend's free tier rate-limits parallel requests.
  const customerMail = await sendCustomerEmail(c, origin, info);
  const consultantMail = await sendAndLog({
      customerId: c.id, type: "consultant_invite",
      subject: `[To: ${created.consultant.name}] New consultation: ${c.name} – ${formatSlot(slotIso, "en")}`,
      html: `<div style="font-family:Inter,Arial,sans-serif;color:#1a2547;font-size:15px;line-height:1.6">
        <p>Hi ${esc(created.consultant.name.split(" ")[0])},</p>
        <p>You have been assigned a free consultation with <b>${esc(c.name)}</b> on <b>${esc(formatSlot(slotIso, "en"))}</b>.</p>
        <p>Need: ${esc(NEED_LABEL[c.need_type] ?? c.need_type)}<br/>Email: ${esc(c.email)}<br/>Phone: ${esc(c.phone ?? "-")}</p>
        <p>The calendar invite is attached (consultation.ics).</p>
        <p style="color:#8a8f9c;font-size:12px">Demo mode: intended for consultant ${esc(created.consultant.name)}.</p></div>`,
      attachments: [{ filename: "consultation.ics", content: btoa(unescape(encodeURIComponent(icsFor(created.id, c, created.consultant.name, slotIso, inbox)))) }],
  });
  return json({
    booking: info, rescheduled: !!previous, emailStatus: customerMail.status,
    emails: {
      customer: { status: customerMail.status, id: customerMail.providerId },
      consultantInvite: { status: consultantMail.status, id: consultantMail.providerId },
    },
  });
}

async function emailView(body: Record<string, unknown>) {
  const c = await customerByToken(body.token);
  if (!c) return json({ error: "not_found" }, 404);
  const booking = await currentBooking(c.id);
  return json({ name: c.name, booking: booking ? { slotStart: booking.slotStart, consultantName: booking.consultantName } : null });
}

async function followUp(body: Record<string, unknown>, req: Request) {
  const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: auth } = await db.auth.getUser(jwt);
  if (!auth?.user) return json({ error: "unauthorized" }, 401);
  const { data: isAdmin } = await db.from("staff_admins").select("user_id").eq("user_id", auth.user.id).maybeSingle();
  if (!isAdmin) return json({ error: "forbidden" }, 403);
  if (typeof body.customerId !== "string") return json({ error: "invalid_customer" }, 400);
  const { data: c } = await db.from("customers").select(CUSTOMER_COLS).eq("id", body.customerId).maybeSingle();
  if (!c) return json({ error: "not_found" }, 404);
  const booking = await currentBooking(c.id);
  const upcoming = booking && Date.parse(booking.slotStart) > Date.now() ? booking : null;
  const result = await sendCustomerEmail(c as Customer, cleanOrigin(body.origin, req), upcoming);
  return json({ type: upcoming ? "reminder" : "booking_invite", ...result }, result.status === "sent" ? 200 : 502);
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    switch (body.action) {
      case "availability": return await availability(body);
      case "book": return await book(body, req);
      case "email_view": return await emailView(body);
      case "follow_up": return await followUp(body, req);
      default: return json({ error: "unknown_action" }, 400);
    }
  } catch (e) {
    console.error("[crm] unhandled", e);
    return json({ error: "server_error" }, 500);
  }
});
