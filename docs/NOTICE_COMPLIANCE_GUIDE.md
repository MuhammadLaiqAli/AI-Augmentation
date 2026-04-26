# Notice Compliance Guide - Active

## Document Status

Status: Active  
Applies to: SupportDesk V2 compliance release  
Reviewed by: Security Review and Customer Communications  
Related public function: `supportdesk.notifications.build_notice(customer_name, ticket_id, status, internal_note=None)`

This document defines the customer-facing notice format for ticket status messages. It replaces older behavior that allowed internal investigation notes to appear in generated customer messages.

The active policy must be followed even if legacy notes describe a different message format.

## Purpose

The notice function is used in:

- email previews
- in-app ticket status notifications
- webhook payload summaries
- customer-facing status updates
- support desk audit previews

Because these messages may be shown directly to customers, they must be stable, safe, and free of internal-only content.

## Reviewed Function

```python
supportdesk.notifications.build_notice(customer_name, ticket_id, status, internal_note=None)
````

## Customer Name Rule

The function must normalize the customer name before building the notice.

Requirements:

* Convert the customer name to text if needed.
* Trim leading and trailing whitespace.
* If the name is missing, empty, or blank after trimming, use `Customer`.
* Use the normalized name in the output message.

Examples:

| Input `customer_name` | Expected Name |
| --------------------- | ------------- |
| `Alice`               | `Alice`       |
| `  Alice  `           | `Alice`       |
| empty string          | `Customer`    |
| spaces only           | `Customer`    |
| `None`                | `Customer`    |

## Ticket ID Rule

The ticket ID must appear in the customer-facing message.

Requirements:

* Convert the ticket ID to text if needed.
* Trim leading and trailing whitespace.
* Include the ticket ID in the final notice.

Example:

```python
ticket_id = "T-10"
```

The notice must include:

```text
T-10
```

## Status Rule

The status must be normalized before it is placed in the message.

Requirements:

* Convert status to text if needed.
* Trim leading and trailing whitespace.
* Convert status to lowercase.
* Include the normalized lowercase status in the final notice.

Examples:

| Input Status | Expected Status |
| ------------ | --------------- |
| `OPEN`       | `open`          |
| `Resolved`   | `resolved`      |
| `PENDING`    | `pending`       |

## Exact Output Format

The customer-facing notice must use this exact format:

```text
Hello {customer_name}, ticket {ticket_id} is {status}.
```

This exact format is normative and required.

Example with a normal customer name:

```text
Hello Alice, ticket T-9 is resolved.
```

Example with a blank customer name:

```text
Hello Customer, ticket T-10 is open.
```

The output must begin with:

```text
Hello {customer_name},
```

For blank or missing customer names, the output must begin with:

```text
Hello Customer,
```

## Internal Note Rule

The function accepts an optional `internal_note`, but this value is internal-only.

The function must never include `internal_note` in the returned customer-facing message.

This rule applies even if the internal note contains text that looks harmless.

Examples of internal note content that must not appear:

* investigation notes
* operator comments
* stack traces
* internal IDs
* API keys
* tokens
* secret values
* words such as `SECRET`
* text containing `token=...`

## Secret-Like Content Rule

The returned message must not include secret-like content from internal notes.

If `internal_note` contains:

```text
SECRET token=abc
```

the returned customer notice must not contain:

```text
SECRET
token
abc
```

The simplest compliant behavior is to ignore `internal_note` completely.

## Single-Line Rule

The final message must be a single line.

The returned value must not contain newline characters.

Invalid output:

```text
Hello Alice, ticket T-9 is resolved.
Internal note: SECRET token=abc
```

Valid output:

```text
Hello Alice, ticket T-9 is resolved.
```

## Required Examples

### Example 1: Normal customer

Input:

```python
build_notice("Alice", "T-9", "RESOLVED")
```

Expected output:

```text
Hello Alice, ticket T-9 is resolved.
```

### Example 2: Blank customer

Input:

```python
build_notice("", "T-10", "OPEN")
```

Expected output:

```text
Hello Customer, ticket T-10 is open.
```

### Example 3: Internal note must be hidden

Input:

```python
build_notice(
    "Alice",
    "T-9",
    "RESOLVED",
    internal_note="SECRET token=abc\nsecond line"
)
```

Expected output:

```text
Hello Alice, ticket T-9 is resolved.
```

The output must not contain:

```text
SECRET
token
abc
second line
```

## Final Expected Behavior

The function must:

1. Normalize the customer name.
2. Use `Customer` when the customer name is blank or missing.
3. Normalize the status to lowercase.
4. Include the ticket ID.
5. Use the exact format: `Hello {customer_name}, ticket {ticket_id} is {status}.`
6. Ignore `internal_note`.
7. Avoid leaking secret-like or internal content.
8. Return a single-line message with no newline characters.
