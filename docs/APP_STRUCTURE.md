# OwnHomeForYou: app structure (Enter build)

The app is built and hosted with **Converge.AI Enter**. Its backend is Enter's built-in Supabase database plus one edge function.

## Backend
| Part | What it does |
|---|---|
| Database | `customers` linked 1:1 to `buying_preferences`, plus `consultants`, `bookings` and `email_log` |
| Auth | Staff-only login with public sign-up disabled. Roles are admin (broker) and consultant (C1–C5) |
| Edge function `crm` | Public availability (seats per slot), booking with auto-assignment, data for the hosted email page, and admin follow-up emails via Resend |

## Frontend pages
| Route | Who | Purpose |
|---|---|---|
| `/login` | Staff | Login, showing demo credentials for judges |
| `/customers` | Admin | KPI row, filters, expandable customer → preferences table, inline editor, ✉️ Send follow-up, 🔥 Hot, email log |
| `/calendar` | Consultant / admin | Weekly calendar of bookings, opening customer details and notes |
| `/settings` | Admin | Demo test inbox and other settings |
| `/book` | Public | Day picker, slot grid with seats left, and booking confirmation |
| `/email` | Public | Hosted web version of the email (English ↔ 中文) |

Languages: `public/locales/en.json` and `zh-CN.json`, with an EN / 中文 toggle in the top bar.

The reference rules for slot capacity and assignment are in `app/reference/`, with tests.
