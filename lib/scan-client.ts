import type { ProfitOpportunityReport, ScannerAnswers, ScannerProfile } from '../types';

export type ScanSummary = {
  scanId: string;
  completedAt: string;
  referralSource: string;
  profile: ScannerProfile;
  answers: ScannerAnswers;
  report: ProfitOpportunityReport;
};

export async function sendScanEvent(payload: Record<string, unknown>): Promise<{ delivered: boolean }> {
  const response = await fetch('/api/scans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(body?.error || 'Notification request failed');
  }
  return response.json().catch(() => ({ delivered: false }));
}
