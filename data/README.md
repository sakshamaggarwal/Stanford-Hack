# Demo data (synthetic)
All names, `555` phone numbers and `example.com` emails are fake. No real personal data is used.

- `customers.csv`: one row per customer. `preferences_id` links to the child table.
- `buying_preferences.csv`: one row per customer (1:1).
- `buying_capability_score = min(10, round(20 × annual_household_income ÷ budget, 1))`

Marital status and buyer age are optional and informational only. They are not used in the score or the hot flag.
