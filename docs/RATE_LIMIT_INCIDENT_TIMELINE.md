# Rate Limit Incident Timeline - Active

## Document Status

Status: Active  
Applies to: SupportDesk V2 compliance release  
Reviewed by: Platform Reliability and Customer Operations  
Related public function: `supportdesk.rate_limits.allow_request(history, now, limit=5, window_seconds=60)`

This document defines the active request rate-limiting behavior after the V2 incident review. It replaces older limiter behavior that removed old entries from the caller-provided list and treated the window boundary inconsistently.

The active policy must be followed even if legacy notes describe a different approach.

## Background

SupportDesk uses a lightweight request limiter to protect customer-facing and internal support APIs from repeated requests over a short period. The limiter is used by webhook retry handlers, dashboard refresh actions, CSV import previews, and customer notification endpoints.

During V2 testing, the previous limiter caused inconsistent results because it mutated the input history list. In several workers, the same history list was reused for logging, audit replay, and multiple limiter checks. Because the limiter removed entries from that list, later checks saw different data from earlier checks. This made debugging difficult and caused inconsistent allow/reject decisions.

The new policy requires the limiter to be pure with respect to the caller's input list.

## Reviewed Function

```python
supportdesk.rate_limits.allow_request(history, now, limit=5, window_seconds=60)
```

## Inputs

| Parameter        | Meaning                                                              |
| ---------------- | -------------------------------------------------------------------- |
| `history`        | A list of previous request timestamps represented as numeric seconds |
| `now`            | Current timestamp represented as numeric seconds                     |
| `limit`          | Maximum allowed number of prior requests inside the active window    |
| `window_seconds` | Size of the sliding window in seconds                                |

The function should not assume that `history` has already been filtered. It should evaluate the active window each time it is called.

## Active Window Rule

A previous request is inside the active window if:

```text
event_time >= now - window_seconds
```

Events exactly on the left boundary are still inside the window.

For example:

```text
history = [100, 110, 120, 130, 140]
now = 160
window_seconds = 60
```

The left boundary is:

```text
now - window_seconds = 100
```

The event at `100` is still inside the active window.

Therefore, all five events are considered in-window:

```text
100, 110, 120, 130, 140
```

## Allow / Reject Rule

Return `True` only when the number of in-window events is **less than** the limit.

Return `False` when the number of in-window events is **equal to or greater than** the limit.

This means:

```text
in_window_count < limit   -> allow
in_window_count >= limit  -> reject
```

## Required Examples

### Example 1: Below limit

```python
history = [100, 110, 120, 130]
now = 160
limit = 5
window_seconds = 60
```

Active window starts at:

```text
100
```

In-window events:

```text
100, 110, 120, 130
```

Count:

```text
4
```

Expected result:

```python
True
```

Reason: `4 < 5`.

### Example 2: At limit

```python
history = [100, 110, 120, 130, 140]
now = 160
limit = 5
window_seconds = 60
```

Active window starts at:

```text
100
```

In-window events:

```text
100, 110, 120, 130, 140
```

Count:

```text
5
```

Expected result:

```python
False
```

Reason: `5 >= 5`.

### Example 3: Older events ignored

```python
history = [50, 80, 99, 100, 120]
now = 160
limit = 3
window_seconds = 60
```

Active window starts at:

```text
100
```

In-window events:

```text
100, 120
```

Expected result:

```python
True
```

Reason: only two events are inside the active window.

## Mutation Rule

The function must not mutate `history`.

This is mandatory.

The caller may reuse `history` for:

* audit replay
* customer request logging
* retry diagnostics
* multiple sequential limiter checks
* support investigation exports

The limiter must calculate the in-window count without removing, reordering, or editing items in the input list.

The following behavior is invalid:

```python
while history and history[0] <= cutoff:
    history.pop(0)
```

That approach mutates the caller's list and may also mishandle the boundary.

## Boundary Clarification

The left boundary is inclusive.

If:

```text
now = 160
window_seconds = 60
```

Then:

```text
event_time = 100
```

is inside the window.

The active comparison is:

```text
event_time >= 100
```

not:

```text
event_time > 100
```

## Sorting Assumption

The active policy does not require the function to mutate or sort the list.

If the list is already sorted, the function may still scan it normally. If it is not sorted, the result should still be based on counting events that satisfy the active window rule.

The safest implementation is to compute a filtered count without changing the original list.

## Final Expected Behavior

The function must:

1. Compute the left boundary as `now - window_seconds`.
2. Count events in `history` where `event_time >= left_boundary` and `event_time <= now`.
3. Return `True` if the count is less than `limit`.
4. Return `False` if the count is equal to or greater than `limit`.
5. Leave the original `history` list unchanged.
