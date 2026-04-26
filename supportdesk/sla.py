from datetime import timedelta

HOURS = {"urgent": 2, "high": 12, "normal": 24, "low": 48}

def due_at(created_at, priority, tz="UTC"):
    
    hours = HOURS.get(priority, 24)
    return created_at + timedelta(hours=hours)
