# Ticket Normalization Casebook - Active

## Purpose

This document defines how incoming ticket data must be normalized before it is stored, indexed, searched, imported, or used for workflow decisions.

The normalization function is used by web forms, partner CSV imports, and internal migration scripts. It must be predictable and must not mutate caller-owned dictionaries.

## Reviewed Function

Public function:

`supportdesk.tickets.normalize_ticket(ticket)`

## Subject Rules

The `subject` field is required.

Requirements:

- The subject must be read from the input dictionary.
- Leading and trailing whitespace must be removed.
- If the subject is missing, empty, or blank after trimming, raise `ValueError`.
- The returned normalized ticket must contain the trimmed subject.

Examples:

| Input subject | Expected |
|---|---|
| `Printer down` | `Printer down` |
| `  Printer down  ` | `Printer down` |
| empty string | `ValueError` |
| spaces only | `ValueError` |
| missing subject | `ValueError` |

## Priority Rules

The active priority set is:

- `low`
- `normal`
- `high`
- `urgent`

Priority normalization requirements:

- Convert priority to lowercase.
- Trim whitespace around priority.
- If priority is missing, use `normal`.
- If priority is unknown, use `normal`.
- Do not preserve unsupported priority values.

Examples:

| Input priority | Expected |
|---|---|
| `HIGH` | `high` |
| ` urgent ` | `urgent` |
| `escalated` | `normal` |
| missing | `normal` |

## Tag Rules

Tags are used for routing, search, and reporting. Tag normalization must be stable.

Requirements:

- Read tags from the `tags` field.
- If tags are missing or null, use an empty list.
- Convert every tag to string.
- Trim whitespace.
- Convert to lowercase.
- Ignore empty tags.
- Deduplicate tags.
- Sort tags alphabetically for deterministic output.

Example:

```python
[" Vip ", "network", "vip", "", " Network "]