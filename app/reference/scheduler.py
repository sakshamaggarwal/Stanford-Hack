"""Reference logic for OwnHomeForYou's scheduler (mirrors the Enter app).

Rules:
- Mon-Sat 9:00-17:00 Pacific (Tuesday until 18:00 for the demo week), 30-minute slots.
- Each slot has CAPACITY seats (one per consultant); it is unavailable once full.
- Assignment: free consultants, sorted by fewest bookings that day; skip anyone
  who would get back-to-back meetings if a free alternative exists; tie-break C1..C5.
- Buying capability score = min(10, round(20 * income / budget, 1)).
"""
from datetime import date, datetime, time, timedelta

CAPACITY = 5
CONSULTANTS = ["C1", "C2", "C3", "C4", "C5"]
SLOT = timedelta(minutes=30)


def day_hours(d: date, demo_week_start: date | None = None):
    if d.weekday() == 6:  # Sunday closed
        return None
    end = time(17, 0)
    if demo_week_start and d.weekday() == 1 and demo_week_start <= d < demo_week_start + timedelta(days=7):
        end = time(18, 0)
    return time(9, 0), end


def slots_for_day(d: date, demo_week_start: date | None = None):
    hours = day_hours(d, demo_week_start)
    if not hours:
        return []
    t, end = datetime.combine(d, hours[0]), datetime.combine(d, hours[1])
    out = []
    while t + SLOT <= end:
        out.append(t)
        t += SLOT
    return out


def seats_left(bookings, slot):
    return CAPACITY - sum(1 for b in bookings if b["start"] == slot)


def assign_consultant(bookings, slot):
    """bookings: list of {"consultant", "start"}. Returns a consultant id or None if full."""
    busy = {b["consultant"] for b in bookings if b["start"] == slot}
    free = [c for c in CONSULTANTS if c not in busy]
    if not free:
        return None
    day = slot.date()

    def count(c):
        return sum(1 for b in bookings if b["consultant"] == c and b["start"].date() == day)

    def back_to_back(c):
        return any(b["consultant"] == c and b["start"] in (slot - SLOT, slot + SLOT) for b in bookings)

    ranked = sorted(free, key=lambda c: (count(c), CONSULTANTS.index(c)))
    for c in ranked:
        if not back_to_back(c):
            return c
    return ranked[0]


def capability_score(income: float, budget: float) -> float | None:
    if not income or not budget or budget <= 0:
        return None
    return min(10.0, round(20 * income / budget, 1))
