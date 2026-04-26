def search_tickets(tickets, query="", include_internal=False):
    q = (query or "").lower()
    results = []
    for ticket in tickets:
        haystack = " ".join([
            str(ticket.get("subject", "")),
            str(ticket.get("body", "")),
            " ".join(ticket.get("tags", [])),
        ]).lower()
        
        if not q or q in haystack:
            results.append(ticket)
    return results
