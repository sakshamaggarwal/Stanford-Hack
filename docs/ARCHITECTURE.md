# OwnHomeForYou: architecture

```mermaid
flowchart LR
  subgraph Sources[Lead sources]
    A1[Seminar CSV]
    A2[Eventbrite / Facebook / WeChat export]
    A3[Seminar sign-up page]
  end
  subgraph App[OwnHomeForYou, built with Enter]
    B1[Lead intake & dedupe]
    B2[(Database: leads, interactions,<br/>appointments, seminars)]
    B3[AI engine: drafting, discovery chat,<br/>next best action, handoff brief]
    B4[Broker approval queue]
    B5[Booking & reminders]
    B6[Broker dashboard]
  end
  P[Prospect: bilingual chat + booking page]
  Broker((Broker))
  A1 & A2 & A3 --> B1 --> B2
  B2 <--> B3
  B3 --> B4 -->|approved, simulated send| P
  P -->|replies| B3
  P --> B5 --> B2
  B5 -->|handoff brief| Broker
  B6 --> Broker
```

| Part | Built with |
|---|---|
| Web app, database, AI | Enter (Converge.AI) |
| Seminar promo / nurture visuals | Framia (Converge.AI), planned |
| Public sign-up page | Combos / Enter, planned |

**Design principles:** human approval before any outbound message; consent and opt-out gate; AI never gives financial, legal or tax advice; synthetic data only; channel layer simulated so real SMS / email / WeChat can be plugged in later.
