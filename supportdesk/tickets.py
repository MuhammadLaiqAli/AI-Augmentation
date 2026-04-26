ALLOWED_PRIORITIES = {"low", "normal", "high", "urgent"}

def normalize_ticket(ticket):
    
    subject = ticket.get("subject", "")
    ticket["subject"] = subject.strip()
    if not ticket["subject"]:
        raise ValueError("subject required")
    priority = ticket.get("priority", "normal")
    ticket["priority"] = priority if priority in ALLOWED_PRIORITIES else "normal"
    ticket["tags"] = list(set(ticket.get("tags", [])))
    return ticket
