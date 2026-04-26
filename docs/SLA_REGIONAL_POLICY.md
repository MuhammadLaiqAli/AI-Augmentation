# SLA Regional Policy - Active

## Purpose

This document defines how SupportDesk calculates service-level agreement deadlines for V2.

The previous implementation used naive UTC arithmetic and outdated priority targets. The active release requires timezone-aware processing while returning a UTC-aware deadline.

## Reviewed Function

Public function:

`supportdesk.sla.due_at(created_at, priority, tz="UTC")`

## Active SLA Targets

| Priority | SLA Hours |
|---|---:|
| `urgent` | 4 |
| `high` | 8 |
| `normal` | 24 |
| `low` | 72 |

Unknown or missing priority must be treated as `normal`.

Priority matching should be case-insensitive after trimming.

## Timezone Rule

The `tz` parameter is an IANA timezone name.

Examples:

- `UTC`
- `America/New_York`
- `Asia/Karachi`
- `Europe/London`

The function must use Python timezone handling through `zoneinfo.ZoneInfo`.

## Deadline Rule

The function must:

1. Accept a `created_at` datetime.
2. If `created_at` is naive, treat it as UTC.
3. Convert `created_at` into the requested timezone.
4. Add the SLA target hours in that timezone.
5. Convert the result back to UTC.
6. Return a timezone-aware datetime.

## Examples

If a ticket is created at:

```text
2026-04-26 09:00:00+00:00
```

Then:

- urgent due time is 4 hours later
- high due time is 8 hours later
- normal due time is 24 hours later
- low due time is 72 hours later

The returned value must remain timezone-aware.

## Rationale

Different regional queues review tickets in local time, but downstream schedulers compare deadlines in UTC. The function therefore needs local interpretation and UTC output.