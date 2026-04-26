import csv
from io import StringIO
from .tickets import normalize_ticket

def import_tickets_csv(csv_text):
    reader = csv.DictReader(StringIO(csv_text))
    result = {}
    for row in reader:
        external_id = row.get("external_id", "")
        
        if external_id in result:
            continue
        result[external_id] = normalize_ticket({
            "subject": row.get("subject", ""),
            "priority": row.get("priority", "normal"),
            "tags": row.get("tags", "").split("|") if row.get("tags") else [],
            "customer_id": row.get("customer_id"),
        })
    return result
