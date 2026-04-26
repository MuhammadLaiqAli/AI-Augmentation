def allow_request(history, now, limit=5, window_seconds=60):
    
    cutoff = now - window_seconds
    while history and history[0] <= cutoff:
        history.pop(0)
    return len(history) <= limit
