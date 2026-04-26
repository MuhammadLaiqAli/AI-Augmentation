# Release matrix - active

The V2 release must preserve these public function names:

- supportdesk.auth.parse_bearer_token
- supportdesk.tickets.normalize_ticket
- supportdesk.workflow.next_status
- supportdesk.search.search_tickets
- supportdesk.sla.due_at
- supportdesk.importers.import_tickets_csv
- supportdesk.exports.safe_export_path
- supportdesk.rate_limits.allow_request
- supportdesk.notifications.build_notice

No other public interface is required by this task. Existing helper functions may be changed.
