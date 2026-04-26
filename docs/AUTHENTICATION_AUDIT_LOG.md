# Authentication Audit Log - Active

## Purpose

This document records the authentication review performed for the SupportDesk V2 compliance release. The review focuses on how inbound API requests identify customers and staff operators through the `Authorization` header.

The active requirement is intentionally stricter than the historical behavior. Earlier versions accepted multiple authorization schemes and treated the scheme name case-insensitively. That behavior caused ambiguous authorization handling in API gateways and made it harder for upstream proxies to enforce consistent authentication rules.

## Reviewed Function

Public function:

`supportdesk.auth.parse_bearer_token(header)`

## Active Rule

Only the exact authorization scheme `Bearer` is valid.

The scheme is case-sensitive. The following are valid and invalid examples:

| Header | Expected Result | Reason |
|---|---|---|
| `Bearer abc123` | `abc123` | Exact scheme and non-empty token |
| ` Bearer abc123 ` | `abc123` | Outer whitespace may be ignored |
| `bearer abc123` | `None` | Scheme is lowercase and must be rejected |
| `BEARER abc123` | `None` | Scheme is uppercase and must be rejected |
| `Token abc123` | `None` | Unsupported scheme |
| `Bearer` | `None` | Missing token |
| `Bearer    ` | `None` | Empty token after trimming |
| empty header | `None` | Missing input |
| null header | `None` | Missing input |
| `Bearer a b` | `None` | Token must be a single token segment |

## Rationale

The SupportDesk gateway forwards bearer tokens after authentication normalization. Accepting lowercase or mixed-case variants caused inconsistent behavior between local tests, staging ingress, and production ingress. Therefore, the parser must be strict.

The parser should be defensive. Malformed headers must not raise unexpected exceptions because the function is called in request middleware. Returning `None` allows the caller to handle unauthorized requests consistently.

## Implementation Notes

The function should:

1. Return `None` for missing input.
2. Trim leading and trailing whitespace around the entire header.
3. Split into exactly two parts: scheme and token.
4. Require the scheme to equal `Bearer`.
5. Require the token to be non-empty.
6. Reject headers with additional token segments.
7. Return the token string for valid input.

Do not silently join multiple token segments. A token containing spaces is considered malformed for this release.