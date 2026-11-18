from datetime import date, datetime, timedelta
from scheduler import *

D = datetime(2026, 11, 20, 10, 0)

def test_score():
    assert capability_score(500_000, 1_000_000) == 10.0
    assert capability_score(500_000, 2_000_000) == 5.0
    assert capability_score(300_000, 2_000_000) == 3.0
    assert capability_score(1_000_000, 1_000_000) == 10.0

def test_slot_full():
    bk = [{"consultant": c, "start": D} for c in CONSULTANTS]
    assert seats_left(bk, D) == 0 and assign_consultant(bk, D) is None

def test_least_booked_first():
    bk = [{"consultant": "C1", "start": D + timedelta(hours=3)}]
    assert assign_consultant(bk, D) == "C2"

def test_avoid_back_to_back():
    # C1..C4 each have 1 booking elsewhere; C5 has 1 booking adjacent -> skip C5 if alternative
    bk = [{"consultant": "C5", "start": D - SLOT}] + [{"consultant": c, "start": D + timedelta(hours=4)} for c in ["C1","C2","C3","C4"]]
    assert assign_consultant(bk, D) == "C1"
    # Only C5 free and adjacent -> still assign (no alternative)
    bk2 = [{"consultant": "C5", "start": D - SLOT}] + [{"consultant": c, "start": D} for c in ["C1","C2","C3","C4"]]
    assert assign_consultant(bk2, D) == "C5"

def test_back_to_back_beats_count():
    # C1 has 0 bookings but is adjacent; C2 has 1 non-adjacent -> pick C2
    bk = [{"consultant": "C1", "start": D + SLOT}, {"consultant": "C2", "start": D + timedelta(hours=3)},
          {"consultant": "C3", "start": D + timedelta(hours=3)}, {"consultant": "C3", "start": D + timedelta(hours=4)}]
    # C1 count 1 (adjacent), C2 count 1, C4/C5 count 0 -> C4 first
    assert assign_consultant(bk, D) == "C4"

def test_hours():
    wk = date(2026, 11, 16)
    assert len(slots_for_day(date(2026, 11, 18), wk)) == 16      # Wed 9-5
    assert len(slots_for_day(date(2026, 11, 17), wk)) == 18      # Tue 9-6 demo week
    assert len(slots_for_day(date(2026, 11, 24), wk)) == 16      # next Tue 9-5
    assert slots_for_day(date(2026, 11, 22), wk) == []           # Sunday
