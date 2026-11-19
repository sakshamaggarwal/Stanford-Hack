# OwnHomeForYou — Journey to your home · 安家之路 🏡

**Turns real-estate seminar attendees into booked consultations with bilingual (English / 中文) follow-up emails and a capacity-aware scheduler.**

Built for the *30×30 Real Business AI Buildathon @ Stanford* (Team 27) for **GCFRI**, a California real estate & mortgage brokerage. Built with Converge.AI **Enter**.

## Features (v0.2)
1. **Bilingual follow-up email**: thank you, a short GCFRI intro and a booking link. If the customer has already booked, a reminder with their slot is sent instead. English by default, with a 查看中文版 link at the top that opens a hosted Chinese version.
2. **Scheduler**: Mon–Sat 9–5 PT, 30-minute slots, 5 seats per slot (one per consultant). Customers only see availability; consultants are auto-assigned by fewest bookings that day, avoiding back-to-back meetings.
3. **Nested customer database**: customers → buying preferences, with an automatic buying capability score.
4. **Admin dashboard**: expandable customer rows, inline notes, ✉️ Send follow-up, 🔥 Hot flag and filter, EN / 中文 toggle.
5. **Consultant dashboard**: each consultant logs in to see their own calendar of bookings, with customer details and notes.

**Live app:** https://5d14ca86121c43be8e4121f656edae2a.prod.enter.pro (demo accounts are listed on the login page)
**One-page summary:** [docs/OwnHomeForYou_One_Page_Summary.pdf](docs/OwnHomeForYou_One_Page_Summary.pdf)

## Repo layout
```
app/enter/       Full Enter app source (React + Supabase migrations + `crm` edge function)
app/reference/   Scheduler assignment + capability score reference logic with tests
data/            Synthetic customers + buying preferences (CSV)
docs/            Architecture and build spec
```
Run the tests: `cd app/reference && python3 -c "import test_scheduler as t; [getattr(t,n)() for n in dir(t) if n.startswith('test_')]"`

## Guardrails
- Synthetic data only. During the demo, every email goes to a team test inbox.
- Optional sensitive fields (marital status, age) are never used for scoring or prioritisation.
