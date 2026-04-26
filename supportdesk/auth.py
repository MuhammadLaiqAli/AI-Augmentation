def parse_bearer_token(header):
    if not header:
        return None
    parts = str(header).strip().split()
    if len(parts) < 2:
        return None
    
    if parts[0].lower() != "bearer":
        return None
    token = " ".join(parts[1:])
    return token or None
