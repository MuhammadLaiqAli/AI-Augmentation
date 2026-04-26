# Workflow Transition Matrix - Active

## Purpose

This document defines the active SupportDesk ticket workflow for the V2 compliance release.

The workflow must be simple, auditable, and stable across web UI actions, API calls, and bulk import transitions.

## Reviewed Function

Public function:

`supportdesk.workflow.next_status(current, action)`

## Active Statuses

The supported statuses are:

- `open`
- `pending`
- `resolved`
- `closed`

The historical `assigned` status is deprecated and must not be introduced by the active workflow.

## Active Actions

The supported actions are:

- `assign`
- `resolve`
- `reopen`
- `close`

## Transition Table

| Current Status | Action | Next Status |
|---|---|---|
| `open` | `assign` | `pending` |
| `pending` | `resolve` | `resolved` |
| `resolved` | `reopen` | `open` |
| `open` | `close` | `closed` |
| `pending` | `close` | `closed` |
| `resolved` | `close` | `closed` |

## Invalid Transitions

If a transition is not listed in the active table, the function must return the original status unchanged.

Examples:

| Current Status | Action | Expected |
|---|---|---|
| `pending` | `assign` | `pending` |
| `closed` | `reopen` | `closed` |
| `open` | `bogus` | `open` |

## Case Handling

Workflow matching is case-insensitive for both current status and action. The returned active status should be lowercase.

Examples:

| Input | Expected |
|---|---|
| `next_status("OPEN", "Close")` | `closed` |
| `next_status("Pending", "Resolve")` | `resolved` |

## Deprecation Warning

Do not use the historical workflow from legacy notes. In the old workflow, `open + assign` produced `assigned`. That behavior is no longer valid. The active V2 workflow uses `pending`.