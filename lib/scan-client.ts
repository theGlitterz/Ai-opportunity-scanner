import type { ProfitOpportunityReport, ScannerAnswers, ScannerProfile } from '../types';

export type ScanSummary = {
  scanId: string;
  completedAt: string;
  referralSource: string;
  profile: ScannerProfile;
  answers: ScannerAnswers;
  report: ProfitOpportunityReport;
};

export async function sendScanEvent(payload: Record<string, unknown>): Promise<void> {
  const response = await fetch('/api/scans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Notification request failed');
}
