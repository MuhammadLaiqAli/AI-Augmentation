# Active incident reports

## INC-421 Search overexposure
The search endpoint leaked archived tickets and internal-only tickets to normal agents. Search must hide records where `archived` is true. Search must also hide records where `internal` is true unless `include_internal=True` is explicitly passed.

## INC-433 CSV import drift
CSV imports from the partner portal contain comment lines and duplicate external IDs. Import behavior must:
- ignore blank lines
- ignore rows where the first non-space character of the `external_id` field is `#`
- trim field values
- normalize priority by reusing the ticket normalization rules
- when the same external ID appears multiple times, the later row replaces the earlier row

## INC-447 SLA timezone bug
SLA deadlines were calculated with naive UTC assumptions. The `due_at(created_at, priority, tz="UTC")` function must:
- interpret priorities with these hour targets: urgent=4, high=8, normal=24, low=72
- convert created_at to the requested IANA timezone
- return the deadline converted back to UTC
- preserve timezone-aware datetimes
- treat unknown priority as normal
