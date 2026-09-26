/**
 * IP-SAKTI Sahayak — Paid Source Access Control Guard
 * 
 * REQUIREMENT: The system must NEVER silently access a paid database.
 * 
 * Paid sources may only be used when:
 * 1. The user has explicitly granted permission.
 * 2. That permission is logged.
 * 3. The system verifies the permission before accessing the paid source.
 * 
 * If no connector is configured → display a clear message instead of attempting access.
 * 
 * This is an additive safety layer. It does NOT modify any existing retrieval logic.
 */

export type PaidSource =
  | 'TKDL_DEEP_ACCESS'      // Full TKDL database API (requires CSIR agreement)
  | 'WESTLAW_IN'             // Westlaw India legal database
  | 'MANUPATRA'              // Manupatra Indian case law
  | 'SCC_ONLINE'             // Supreme Court Cases Online
  | 'LEXISNEXIS_IN'          // LexisNexis India
  | 'IPO_REGISTER_PAID'      // Indian Patent Office paid register export
  | 'NBA_PORTAL_PAID'        // National Biodiversity Authority paid portal
  | string;

export interface PaidSourcePermission {
  sourceId: PaidSource;
  grantedAt: string;        // ISO timestamp
  grantedBy: string;        // user ID or session
  expiresAt?: string;       // ISO timestamp, optional
  logId: string;            // unique log reference
}

export interface PaidSourceGuardResult {
  allowed: boolean;
  source: PaidSource;
  message: string;
  permission?: PaidSourcePermission;
  logEntry?: {
    attempted: boolean;
    timestamp: string;
    userId?: string;
    result: 'ALLOWED' | 'DENIED_NO_CONNECTOR' | 'DENIED_NO_PERMISSION' | 'DENIED_EXPIRED';
  };
}

/**
 * In-memory log of access attempts (non-persistent across sessions).
 * In a production system, this should be persisted to Supabase audit_logs table.
 */
const accessAttemptLog: PaidSourceGuardResult['logEntry'][] = [];

/**
 * Load user's paid source permissions from localStorage.
 * In production, these would come from a verified Supabase user profile.
 */
function loadUserPermissions(): PaidSourcePermission[] {
  try {
    const raw = localStorage.getItem('ipsakti_paid_permissions');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('[PaidSourceGuard] Failed to load permissions:', e);
  }
  return [];
}

/**
 * Grant a paid source permission (called when user explicitly consents).
 * This would normally require backend verification in production.
 */
export function grantPaidSourcePermission(
  sourceId: PaidSource,
  userId: string
): PaidSourcePermission {
  const permission: PaidSourcePermission = {
    sourceId,
    grantedAt: new Date().toISOString(),
    grantedBy: userId,
    logId: `PERM-${Date.now().toString(16).toUpperCase()}`
  };

  const existing = loadUserPermissions();
  const updated = [...existing.filter((p) => p.sourceId !== sourceId), permission];
  localStorage.setItem('ipsakti_paid_permissions', JSON.stringify(updated));

  console.log(`[PaidSourceGuard] Permission granted for ${sourceId} by ${userId}`);
  return permission;
}

/**
 * Revoke a paid source permission.
 */
export function revokePaidSourcePermission(sourceId: PaidSource): void {
  const existing = loadUserPermissions();
  const updated = existing.filter((p) => p.sourceId !== sourceId);
  localStorage.setItem('ipsakti_paid_permissions', JSON.stringify(updated));
  console.log(`[PaidSourceGuard] Permission revoked for ${sourceId}`);
}

/**
 * Check whether the system can access a specific paid source.
 * 
 * Returns a structured result with:
 * - allowed: boolean
 * - message: human-readable explanation
 * - logEntry: audit record of the attempt
 * 
 * The caller MUST check `allowed === true` before proceeding to access the source.
 * This guard does NOT perform the actual retrieval.
 */
export function checkPaidSourceAccess(
  sourceId: PaidSource,
  userId?: string
): PaidSourceGuardResult {
  const timestamp = new Date().toISOString();

  // Step 1: Check if any connector is configured for this source
  // In this prototype, NO paid connectors are configured by default.
  const configuredConnectors: PaidSource[] = [];
  // In production, populate from environment variables or backend config:
  // e.g. if (import.meta.env.VITE_TKDL_API_KEY) configuredConnectors.push('TKDL_DEEP_ACCESS');

  if (!configuredConnectors.includes(sourceId)) {
    const logEntry: PaidSourceGuardResult['logEntry'] = {
      attempted: true,
      timestamp,
      userId,
      result: 'DENIED_NO_CONNECTOR'
    };
    accessAttemptLog.push(logEntry);

    return {
      allowed: false,
      source: sourceId,
      message: `Paid-source connector not configured. The system does not have an active integration with "${sourceId}". Contact your system administrator to configure paid database access credentials.`,
      logEntry
    };
  }

  // Step 2: Check if user has explicit permission
  const permissions = loadUserPermissions();
  const permission = permissions.find((p) => p.sourceId === sourceId);

  if (!permission) {
    const logEntry: PaidSourceGuardResult['logEntry'] = {
      attempted: true,
      timestamp,
      userId,
      result: 'DENIED_NO_PERMISSION'
    };
    accessAttemptLog.push(logEntry);

    return {
      allowed: false,
      source: sourceId,
      message: `Access denied. You have not granted explicit permission to access "${sourceId}". Please enable paid source access in your account settings and confirm consent.`,
      logEntry
    };
  }

  // Step 3: Check if permission is expired
  if (permission.expiresAt && new Date(permission.expiresAt) < new Date()) {
    const logEntry: PaidSourceGuardResult['logEntry'] = {
      attempted: true,
      timestamp,
      userId,
      result: 'DENIED_EXPIRED'
    };
    accessAttemptLog.push(logEntry);

    return {
      allowed: false,
      source: sourceId,
      message: `Your permission to access "${sourceId}" expired on ${permission.expiresAt}. Please renew your subscription access in account settings.`,
      logEntry
    };
  }

  // All checks passed → access allowed
  const logEntry: PaidSourceGuardResult['logEntry'] = {
    attempted: true,
    timestamp,
    userId,
    result: 'ALLOWED'
  };
  accessAttemptLog.push(logEntry);

  console.log(`[PaidSourceGuard] Access ALLOWED for ${sourceId} | User: ${userId} | Log: ${permission.logId}`);

  return {
    allowed: true,
    source: sourceId,
    message: `Access permitted for "${sourceId}" (Permission: ${permission.logId}, Granted: ${permission.grantedAt}).`,
    permission,
    logEntry
  };
}

/**
 * Get the in-memory access attempt log (for audit/display purposes).
 */
export function getPaidSourceAccessLog(): PaidSourceGuardResult['logEntry'][] {
  return [...accessAttemptLog];
}

/**
 * Helper: Generate the standard "not configured" answer data for an answer
 * that attempted to use a paid source but was blocked.
 */
export function getPaidSourceBlockedAnswer(sourceId: PaidSource): {
  blocked: true;
  sourceId: PaidSource;
  userMessage: string;
  technicalNote: string;
} {
  return {
    blocked: true,
    sourceId,
    userMessage:
      'This query requires access to a paid legal database. The paid-source connector is not configured on this system. ' +
      'Please use the free authoritative sources available in the Statutory Library (/sources), or contact your system administrator to configure paid database access.',
    technicalNote: `Paid connector "${sourceId}" not configured. Guard blocked access at ${new Date().toISOString()}.`
  };
}
