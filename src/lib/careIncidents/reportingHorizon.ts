/**
 * INTERNAL — future reporting / alert adapters (not a public product surface).
 *
 * Horizon only. Disabled by default. Do not wire network calls here until
 * ethics, consent, jurisdiction, and legal review are explicit.
 *
 * Possible future destinations (TBD with founder + counsel):
 * - Authorized inspectorate / oversight channels (jurisdiction-specific)
 * - Caregiver-triggered structured reports drafted by optional reflection AI
 * - Local export remains the present-tense path
 *
 * "EBU" / other destination codes: leave as opaque IDs until named.
 */

export type ReportingDestinationId = "local_export" | "inspectorate" | "ai_report_draft" | string;

export type ReportingAdapterConfig = {
  /** Master switch — must stay false until deliberately enabled. */
  enabled: boolean;
  /** Destinations that may receive caregiver-authorized packets later. */
  destinations: ReportingDestinationId[];
  /** If true, optional reflection AI may draft a report text for human review only. */
  aiReportDraftAllowed: boolean;
  /** If true, automated alerts may fire without a human click — default false forever unless reviewed. */
  autoAlertAllowed: boolean;
};

/** Present-tense config: local export only. No network. No auto alerts. */
export const REPORTING_ADAPTER_CONFIG: ReportingAdapterConfig = {
  enabled: false,
  destinations: ["local_export"],
  aiReportDraftAllowed: false,
  autoAlertAllowed: false,
};

export function reportingAdaptersActive(): boolean {
  return REPORTING_ADAPTER_CONFIG.enabled === true;
}
