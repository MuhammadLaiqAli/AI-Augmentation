# Search Visibility Rules - Active

## Purpose

This document defines SupportDesk ticket search visibility for staff-facing ticket search.

Search results must respect visibility constraints before matching query text. The search function must not leak archived tickets or internal-only tickets to normal staff views.

## Reviewed Function

Public function:

`supportdesk.search.search_tickets(tickets, query="", include_internal=False)`

## Visibility Rules

The function receives an iterable of ticket dictionaries.

Before checking the query, apply these visibility rules:

1. If `ticket["archived"]` is true, the ticket must not be returned.
2. If `ticket["internal"]` is true and `include_internal` is not true, the ticket must not be returned.
3. If `include_internal=True`, internal tickets may be returned if they match the query.
4. Archived tickets must never be returned, even when `include_internal=True`.

## Searchable Fields

The query should match against:

- subject
- body
- tags

Tags may be a list. They should be joined into searchable text.

## Query Matching

Query matching should be case-insensitive.

If query is empty or missing, return all visible tickets.

Examples:

| Ticket | Query | include_internal | Expected |
|---|---|---|---|
| normal ticket with subject `VPN broken` | `vpn` | false | included |
| internal ticket with subject `VPN secret` | `vpn` | false | excluded |
| internal ticket with subject `VPN secret` | `vpn` | true | included |
| archived ticket with subject `VPN old` | `vpn` | true | excluded |
| ticket with tag `finance` | `FINANCE` | false | included |

## Security Rationale

Search is a common leakage surface because archived or internal records often contain investigation notes, customer identifiers, and operator-only remediation data. Search must filter visibility before query matching so hidden records are not exposed through search side channels.