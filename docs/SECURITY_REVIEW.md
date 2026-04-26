# Security review - active

## Export path safety
`safe_export_path(base_dir, requested)` must protect export writing.
- Absolute requested paths are rejected with ValueError.
- Traversal outside the base directory is rejected with ValueError.
- Sibling-prefix tricks such as base `/tmp/reports` and requested `../reports_evil/x.csv` must be rejected.
- Use pathlib path relationship checks, not string prefix checks.
- Valid paths return a resolved pathlib.Path.

## Rate limiting
`allow_request(history, now, limit=5, window_seconds=60)` must use a sliding window.
- Ignore events older than `window_seconds` before `now`.
- Events exactly on the left boundary are still inside the window.
- Return True if the number of in-window events is less than limit.
- Return False once the in-window event count is equal to or greater than limit.
- Do not mutate the history list.

## Customer notices
`build_notice(customer_name, ticket_id, status, internal_note=None)` is customer-facing.
- Trim customer_name. Blank or missing customer names become `Customer`.
- Include the ticket id and normalized lowercase status.
- Never include internal_note or any secret token-like string in the message.
- Message must be a single line without newline characters.
- The customer-facing notice must use this exact format: `Hello {customer_name}, ticket {ticket_id} is {status}.`
- For blank or missing customer names, use `Customer`.
- Example: `Hello Customer, ticket T-10 is open.`
