// Internal, append-only Audit Log writer for the MVH Finance module.
// Lives in lib/ (not pages/api/) so it is never itself an HTTP endpoint —
// only the finance API routes import and call it directly.
//
// This module intentionally exposes only a single "write" function.
// There is no update or delete function here, and none should ever be
// added — the Financial Integrity Principle (v1.0 methodology) requires
// Audit_Log records to never be edited or deleted.

import { createRecord, FINANCE_TABLES } from './airtable'

// Writes one Audit_Log record. Every field is optional except actor,
// module, and actionType, so callers can log partial context without
// the write itself failing.
//
// fields:
//   actor       - admin identifier, or "System" if system-generated
//   module      - "Finance" | "Moderation" | "Control Center" | "Other"
//   actionType  - free text, e.g. "Tour Removed", "Credit Approved"
//   targetType  - "Guide" | "Tour" | "Invoice" | "Credit" | "Benefit" | "Suspension"
//   targetId    - the record ID acted upon
//   beforeValue - text, optional
//   afterValue  - text, optional
//   reason      - text, optional
export async function writeAuditLog({
  actor,
  module: moduleName,
  actionType,
  targetType,
  targetId,
  beforeValue,
  afterValue,
  reason
}) {
  if (!actor || !moduleName || !actionType) {
    return { ok: false, error: 'missing_required_audit_fields' }
  }

  const fields = {
    Timestamp: new Date().toISOString(),
    Actor: actor,
    Module: moduleName,
    Action_Type: actionType
  }

  if (targetType) fields.Target_Type = targetType
  if (targetId) fields.Target_ID = targetId
  if (beforeValue !== undefined) fields.Before_Value = String(beforeValue)
  if (afterValue !== undefined) fields.After_Value = String(afterValue)
  if (reason) fields.Reason = reason

  return createRecord(FINANCE_TABLES.AUDIT_LOG, fields)
}
