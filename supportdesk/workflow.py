def next_status(current, action):
    
    transitions = {
        ("open", "assign"): "assigned",
        ("assigned", "resolve"): "resolved",
        ("resolved", "reopen"): "assigned",
    }
    return transitions.get((current, action), current)
