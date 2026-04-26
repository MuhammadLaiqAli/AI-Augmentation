# SupportDesk API Contract - active

This document is active and overrides any legacy notes.

## Authentication and identity
- `parse_bearer_token(header)` accepts only an Authorization header with exactly the scheme `Bearer`.
- The scheme comparison is case-sensitive. `bearer abc` is invalid.
- Leading and trailing whitespace around the whole header may be ignored.
- The token value must not be empty after trimming.
- Any malformed, missing, or empty header returns `None`; the function must not raise for malformed input.

## Ticket validation and normalization
- `normalize_ticket(ticket)` returns a new dictionary and must not mutate the caller's dictionary.
- `subject` is required after trimming. Missing or blank subject raises `ValueError`.
- `priority` must normalize to lowercase. Allowed values: `low`, `normal`, `high`, `urgent`.
- Missing or unknown priority becomes `normal`.
- `tags` must be normalized to lowercase, trimmed, deduplicated, and sorted alphabetically.
- Empty tags are ignored.
- `customer_id` must be preserved if present.

## Workflow
- `next_status(current, action)` implements the active workflow:
  - open + assign -> pending
  - pending + resolve -> resolved
  - resolved + reopen -> open
  - open + close -> closed
  - pending + close -> closed
  - resolved + close -> closed
- Invalid transitions return the original status unchanged.
- Workflow matching is case-insensitive for both current status and action.
