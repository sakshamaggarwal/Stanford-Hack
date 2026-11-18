# OwnHomeForYou: build spec v0.2

This replaces the v0.1 feature list. The scope is deliberately lean.

## 1. Follow-up emails (bilingual)
- **Booking email** (customer has not booked): thank you for attending the seminar → 1–2 lines about GCFRI (California real estate & mortgage brokerage that helps families buy, sell and finance homes, in English and Chinese) → **"Book your free consultation"** button linking to the scheduler.
- **Reminder email** (customer has booked): thank you → booked date/time → consultant name → reschedule link.
- **Language:** English by default. A small link at the very top, **"查看中文版"**, opens a hosted Chinese web version of the same email. The Chinese page has "View in English".
- **Demo mode:** every email is sent to one configurable test inbox, not to the customer's address. The subject line shows the intended recipient.

## 2. Scheduler
- **Hours:** Mon–Sat, 9:00 AM – 5:00 PM (Pacific), 30-minute slots. Customers see availability per day and can't pick a consultant.
- **Capacity:** 5 parallel consultants, so each slot has 5 seats. A slot shows as available while seats remain and becomes unavailable once 5 bookings are made.
- **Auto-assignment:**
  1. Find the consultants who are free in that slot.
  2. Sort them by fewest bookings that day.
  3. Skip anyone who would end up with back-to-back meetings (a booking right before or after) if a free alternative exists; otherwise take the next consultant with the fewest bookings.
  4. Tie-break by consultant order (C1 → C5).
- **Demo seed (current week only):** these windows are pre-filled with dummy bookings, all 5 seats taken, so they show as unavailable:
  - Tue 5:00–6:00 PM (Tuesday hours are extended to 6 PM so this slot exists)
  - Wed 9:00–11:00 AM
  - Fri 4:00–5:00 PM

## 3. Database (Enter built-in, nested)
**Customers**

| Field | Notes |
|---|---|
| name, email, phone | |
| need_type | Buy home · Sell home · Purchase loan · Refinance · Just learning |
| timeline | < 3 mo · 3–6 mo · 6–12 mo · 12+ mo |
| meeting_scheduled | yes / no (automatic) |
| last_appointment | date & time (automatic) |
| potential_loan_customer | yes / no (no = not planning a loan) |
| hot | 🔥 flag |
| notes | Free-text consultant notes on interactions |
| → buying preferences | Link to the child record |

**Buying preferences** (one per customer): preferred areas/locations, budget, house size (sq ft), bedrooms, bathrooms, marital status, expected household size, buyer age, estimated credit score, annual household income, **buying capability score**.

**Buying capability score** = `min(10, round(20 × annual_income ÷ budget, 1))`
- $500k income, $1M budget → 10.0
- $500k income, $2M budget → 5.0

## 4. Admin dashboard
- Customer table where each row expands to its buying preferences. Fields are editable inline, including notes.
- Row buttons: **✉️ Send follow-up** (sends the reminder if the customer has booked, otherwise the booking email) and **🔥 Hot** (toggle).
- Filters: Hot only, Booked / Not booked, Loan customer, Need type.
- Top bar: **EN / 中文** toggle for the whole UI.
- Seeded with 30 synthetic customers.

## 5. Consultant dashboard
- 5 consultant logins (demo accounts).
- A weekly calendar showing that consultant's bookings. Clicking a booking shows the customer profile, buying preferences and notes, and the consultant can edit notes, need type and timeline.
- Each booking also generates an .ics calendar invite for the consultant.
