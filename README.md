# OwnHomeForYou — Journey to your home 🏡

**Bilingual (English / 中文) AI follow-up that turns real-estate seminar leads into booked consultations.**

Built for the *30×30 Real Business AI Buildathon @ Stanford* (Team 27) for **GCFRI**, a California real estate & mortgage brokerage. Built on Converge.AI (Enter, Framia, Combos).

## Problem
After each seminar, the broker has a list of names, phones and emails. Turning them into consultations is manual: repeated outreach, working out whether someone needs real estate or lending help, booking appointments, and nurturing people who aren't ready yet. There's no clear view of who was contacted, who replied or who is stalled. Many prospects prefer Chinese or bilingual communication.

## Solution
1. **Lead intake**: import the seminar lead list (CSV).
2. **Pipeline**: New → Contacted → Replied → Qualified → Booked → Consulted (plus Nurture / Opt-out), with next action and overdue flags.
3. **Bilingual AI follow-up**: personalised EN / 中文 / bilingual drafts; **the broker approves before anything is sent**.
4. **Needs discovery**: a bilingual chat that classifies buy / sell / loan / refinance / just learning, and hands off to the broker when advice is needed.
5. **Booking**: consultation slots, confirmations, reminders and a short handoff brief for the broker.
6. **Dashboard**: funnel conversion, today's actions, follow-up coverage.

## Guardrails
- Human-in-the-loop: no outbound message without broker approval.
- The AI never gives mortgage, legal or tax advice; it escalates to the licensed broker.
- Consent and opt-out are checked before every message.
- The demo uses **synthetic leads only**, and message sending is simulated.

## Repo layout
```
app/        App source (Enter export / code)
data/       Synthetic demo data
prompts/    AI prompt templates (drafting, discovery, handoff)
docs/       Public submission material (write-up, screenshots)
```
