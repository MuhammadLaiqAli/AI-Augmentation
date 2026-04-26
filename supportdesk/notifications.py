def build_notice(customer_name, ticket_id, status, internal_note=None):
    
    name = customer_name or "Customer"
    msg = f"Hello {name}, ticket {ticket_id} is {status}."
    if internal_note:
        msg += f" Note: {internal_note}"
    return msg
