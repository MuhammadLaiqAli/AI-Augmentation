# Export Security Review 2026 - Active

## Purpose

This document defines secure path handling for generated report exports.

The export function is used when staff members download CSV summaries, SLA reports, workflow audit reports, and search result exports. The function must ensure that requested export paths remain inside the configured export directory.

## Reviewed Function

Public function:

`supportdesk.exports.safe_export_path(base_dir, requested)`

## Active Security Requirements

The function must:

1. Resolve the base directory.
2. Reject absolute requested paths.
3. Join the requested path to the base directory.
4. Resolve the final candidate path.
5. Confirm the candidate is inside the resolved base directory.
6. Return a resolved `pathlib.Path` object for valid paths.

## Rejected Inputs

The following categories must raise `ValueError`:

- absolute requested paths
- `..` traversal outside the base directory
- sibling-prefix tricks

Examples:

| Base | Requested | Result |
|---|---|---|
| `/tmp/reports` | `daily/out.csv` | valid |
| `/tmp/reports` | `/etc/passwd` | reject |
| `/tmp/reports` | `../escape.csv` | reject |
| `/tmp/reports` | `../reports_evil/out.csv` | reject |

## Sibling Prefix Explanation

A string-prefix check is not sufficient.

Example:

```text
base = /tmp/reports
candidate = /tmp/reports_evil/out.csv
```

The candidate starts with the characters `/tmp/reports`, but it is not inside `/tmp/reports`.

Therefore, the implementation must use path relationship checks such as `Path.relative_to()` or equivalent logic.

## Output Requirement

For valid requested paths, return a resolved `pathlib.Path` object.

Do not return a string.