import { NextResponse } from 'next/server';
import { SCANNER_QUESTIONS } from '../../../data/scanner-questions';
import type { ProfitOpportunityReport, ScannerAnswers, ScannerProfile } from '../../../types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 100_000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactDetails = {
  name: string;
  email: string;
  company: string;
  role: string;
  marketingOptIn: boolean;
  website: string;
};

type ScanPayload = {
  eventType: 'scan_completed' | 'contact_requested';
  scanId: string;
  completedAt: string;
  referralSource: string;
  profile: ScannerProfile;
  answers: ScannerAnswers;
  report: ProfitOpportunityReport;
  contact?: ContactDetails;
};

const isObject = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const boundedString = (value: unknown, max = 500) => typeof value === 'string' && value.length <= max;
const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character] as string));

function validScanPayload(value: unknown): value is ScanPayload {
  if (!isObject(value) || (value.eventType !== 'scan_completed' && value.eventType !== 'contact_requested')) return false;
  if (!boundedString(value.scanId, 100) || !value.scanId || !boundedString(value.completedAt, 50) || Number.isNaN(Date.parse(value.completedAt as string))) return false;
  if (!boundedString(value.referralSource, 100) || !isObject(value.profile) || !isObject(value.answers) || !isObject(value.report)) return false;

  const profile = value.profile;
  const answers = value.answers;
  const report = value.report;
  const requiredProfile = ['sector', 'revenueBand', 'employeeBand', 'geography', 'revenueModel', 'operatingModel'];
  if (!boundedString(profile.companyName, 200) || requiredProfile.some(key => !boundedString(profile[key], 100) || !profile[key])) return false;
  for (const question of SCANNER_QUESTIONS) {
    const raw = question.id in profile ? profile[question.id] : answers[question.id];
    const values = Array.isArray(raw) ? raw : [raw];
    if (!values.length || values.some(item => !boundedString(item, 100) || !question.options.some(option => option.value === item))) return false;
    if (question.type === 'single' && values.length !== 1) return false;
  }

  if (!isObject(report.annualOpportunity) || !isObject(report.marginImpact) || !Array.isArray(report.topLevers) || report.topLevers.length !== 3 || !isObject(report.recommendation)) return false;
  if (!boundedString(report.confidence, 20) || !boundedString(report.summary, 2_000)) return false;
  if (![report.annualOpportunity.low, report.annualOpportunity.high, report.marginImpact.low, report.marginImpact.high].every(item => typeof item === 'number' && Number.isFinite(item))) return false;
  if (report.topLevers.some(lever => !isObject(lever) || !boundedString(lever.name, 200) || typeof lever.valueLow !== 'number' || typeof lever.valueHigh !== 'number')) return false;
  if (!boundedString(report.recommendation.area, 200)) return false;

  if (value.eventType === 'contact_requested') {
    if (!isObject(value.contact)) return false;
    if (!boundedString(value.contact.name, 150) || !value.contact.name || !boundedString(value.contact.email, 254) || !EMAIL_PATTERN.test(value.contact.email as string)) return false;
    if (!boundedString(value.contact.company, 200) || !boundedString(value.contact.role, 150) || typeof value.contact.marketingOptIn !== 'boolean' || !boundedString(value.contact.website, 200)) return false;
  }
  return true;
}

function displayAnswer(payload: ScanPayload, questionId: string): string {
  const question = SCANNER_QUESTIONS.find(item => item.id === questionId)!;
  const raw = questionId in payload.profile
    ? payload.profile[questionId as keyof ScannerProfile]
    : payload.answers[questionId];
  const values = Array.isArray(raw) ? raw : [raw];
  return values.map(value => question.options.find(option => option.value === value)?.label ?? String(value ?? '')).join(', ');
}

function formatMoney(value: unknown): string {
  return typeof value === 'number' && Number.isFinite(value)
    ? new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)
    : 'Unavailable';
}

function buildEmail(payload: ScanPayload): string {
  const report = payload.report;
  const rows = SCANNER_QUESTIONS.map(question => `<tr><th style="padding:8px;text-align:left;vertical-align:top;border-bottom:1px solid #e5e7eb">${escapeHtml(question.text)}</th><td style="padding:8px;border-bottom:1px solid #e5e7eb">${escapeHtml(displayAnswer(payload, question.id))}</td></tr>`).join('');
  const contactBlock = payload.contact ? `<h2>Executive review request</h2><p><strong>Name:</strong> ${escapeHtml(payload.contact.name)}<br><strong>Work email:</strong> ${escapeHtml(payload.contact.email)}<br><strong>Company:</strong> ${escapeHtml(payload.contact.company || 'Not provided')}<br><strong>Role:</strong> ${escapeHtml(payload.contact.role || 'Not provided')}<br><strong>Marketing opt-in:</strong> ${payload.contact.marketingOptIn ? 'Yes' : 'No'}</p>` : '';
  const leverItems = report.topLevers.map(lever => `<li><strong>${escapeHtml(lever.name)}</strong>: ${escapeHtml(formatMoney(lever.valueLow))}–${escapeHtml(formatMoney(lever.valueHigh))}</li>`).join('');
  const completeReport = escapeHtml(JSON.stringify(report, null, 2));
  return `<div style="font-family:Arial,sans-serif;color:#172033;line-height:1.5;max-width:760px"><h1>${payload.eventType === 'contact_requested' ? 'Executive review requested' : 'New completed opportunity scan'}</h1>${contactBlock}<h2>Executive summary</h2><p><strong>Scan ID:</strong> ${escapeHtml(payload.scanId)}<br><strong>Completed:</strong> ${escapeHtml(payload.completedAt)}<br><strong>Referral:</strong> ${escapeHtml(payload.referralSource || 'Direct')}<br><strong>Company:</strong> ${escapeHtml(payload.profile.companyName || 'Anonymous')}</p><p><strong>Estimated annual opportunity:</strong> ${escapeHtml(formatMoney(report.annualOpportunity.low))}–${escapeHtml(formatMoney(report.annualOpportunity.high))}<br><strong>EBITDA-equivalent impact:</strong> ${escapeHtml(report.marginImpact.low)}–${escapeHtml(report.marginImpact.high)}%<br><strong>Confidence:</strong> ${escapeHtml(report.confidence)}</p><p>${escapeHtml(report.summary)}</p><h3>Top three opportunities</h3><ol>${leverItems}</ol><p><strong>Recommended first opportunity:</strong> ${escapeHtml(report.recommendation.area)}</p><h2>Complete submitted answers</h2><table style="border-collapse:collapse;width:100%">${rows}</table><h2>Complete calculated report output</h2><pre style="white-space:pre-wrap;background:#f4f6fa;padding:16px;border-radius:8px">${completeReport}</pre></div>`;
}

export async function POST(request: Request) {
  try {
    const declaredLength = Number(request.headers.get('content-length') || 0);
    if (declaredLength > MAX_BODY_BYTES) return NextResponse.json({ error: 'Request is too large.' }, { status: 413 });
    const text = await request.text();
    if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) return NextResponse.json({ error: 'Request is too large.' }, { status: 413 });

    let payload: unknown;
    try { payload = JSON.parse(text); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
    if (!validScanPayload(payload)) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    if (payload.eventType === 'contact_requested' && payload.contact?.website) return NextResponse.json({ ok: true });

    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.SCAN_NOTIFICATION_TO;
    const from = process.env.SCAN_NOTIFICATION_FROM;
    if (!apiKey || !to || !from) {
      console.error('Scan notification unavailable: Resend configuration is incomplete.');
      return NextResponse.json({ error: 'Notification service is unavailable.' }, { status: 503 });
    }

    const company = payload.profile.companyName.replace(/[\r\n]+/g, ' ').trim() || 'Anonymous';
    const referral = payload.referralSource.replace(/[\r\n]+/g, ' ').trim() || 'Direct';
    const subject = `New VRise opportunity scan — ${company} — ${referral}`;
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject, html: buildEmail(payload) }),
    });
    if (!response.ok) {
      console.error(`Scan notification failed with provider status ${response.status}.`);
      return NextResponse.json({ error: 'Notification could not be delivered.' }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    console.error('Scan notification failed unexpectedly.');
    return NextResponse.json({ error: 'Notification could not be delivered.' }, { status: 500 });
  }
}
