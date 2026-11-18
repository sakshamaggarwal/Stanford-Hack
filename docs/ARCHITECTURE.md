# OwnHomeForYou: architecture (v0.2)

```mermaid
flowchart LR
  S[Seminar attendee list] --> DB
  subgraph Enter[OwnHomeForYou, built with Enter]
    DB[(Built-in DB<br/>Customers 1:1 Buying preferences<br/>Bookings · Consultants · Email log)]
    AD[Admin dashboard<br/>EN/中文 · Send follow-up · 🔥 Hot · notes]
    EM[Email service<br/>booking email / reminder<br/>+ hosted 中文 version]
    SC[Public scheduler<br/>5 seats per slot]
    AS[Assignment engine<br/>least-booked, avoid back-to-back]
    CD[Consultant dashboard<br/>own calendar + .ics invite]
  end
  AD --> EM -->|demo: team test inbox| Cust((Customer))
  Cust --> SC --> AS --> DB
  AS --> CD
  DB <--> AD
```

**Slot logic:** a slot is available while `bookings < 5`. To assign a booking, take the free consultants, sort them by bookings that day (ties go C1→C5), and skip any consultant whose booking would be back-to-back when a free alternative exists.

**Capability score:** `min(10, round(20 × income ÷ budget, 1))`. For example, $500k income with a $1M budget scores 10.0, and with a $2M budget scores 5.0.
