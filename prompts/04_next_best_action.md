# Prompt: next best action

Given a lead's stage, days since last touch, language, interest and consent, return one action:
`send_first_followup | send_reminder | wait_for_reply | call_by_broker | offer_booking | send_confirmation | move_to_nurture | no_action_opted_out`
plus `due_in_days` and a one-line reason.

Defaults: New → first follow-up within 1 day. Contacted with no reply 3 days → reminder; 7 days → broker call; 14 days → nurture. Booked → confirmation now + reminder 24h before.
