import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { SCANNER_QUESTIONS } from '../../../data/scanner-questions';
import { runProfitOpportunityEngine } from '../../../lib/profit-opportunity-engine';
import { generateReportPdf } from '../../../lib/report/report-pdf';
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
  eventType: 'scan_completed' | 'report_delivery_requested' | 'contact_requested';
  scanId: string;
  completedAt: string;
  referralSource: string;
  profile: ScannerProfile;
  answers: ScannerAnswers;
  report: ProfitOpportunityReport;
  deliveryEmail?: string;
  contact?: ContactDetails;
};

const isObject = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const boundedString = (value: unknown, max = 500) => typeof value === 'string' && value.length <= max;
const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character] as string));

function validScanPayload(value: unknown): value is ScanPayload {
  if (!isObject(value) || !['scan_completed', 'report_delivery_requested', 'contact_requested'].includes(String(value.eventType))) return false;
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

  if (value.deliveryEmail !== undefined && (!boundedString(value.deliveryEmail, 254) || !EMAIL_PATTERN.test(String(value.deliveryEmail)))) return false;
  if (value.eventType === 'report_delivery_requested' && !value.deliveryEmail) return false;

  if (value.eventType === 'contact_requested') {
    if (!isObject(value.contact)) return false;
    if (!boundedString(value.contact.name, 150) || !value.contact.name || !boundedString(value.contact.email, 254) || !EMAIL_PATTERN.test(value.contact.email as string)) return false;
    if (!boundedString(value.contact.company, 200) || !boundedString(value.contact.role, 150) || typeof value.contact.marketingOptIn !== 'boolean' || !boundedString(value.contact.website, 200)) return false;
  }
  return true;
}

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = Number(process.env.SCAN_RATE_LIMIT || 10);
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

type EmailSendResult = {
  accepted: boolean;
  skipped?: boolean;
  id?: string;
  status?: number;
  error?: string;
};

const emailResults = new Map<string, { expiresAt: number; promise: Promise<EmailSendResult> }>();
const EMAIL_RESULT_TTL_MS = 15 * 60 * 1000;

function isRateLimited(request: Request): boolean {
  const rawIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const key = createHash('sha256').update(rawIp.trim()).digest('hex').slice(0, 24);
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  return bucket.count > RATE_LIMIT;
}

function canonicalPayload(payload: ScanPayload): ScanPayload | null {
  const report = runProfitOpportunityEngine(payload.profile, payload.answers);
  if (JSON.stringify(report) !== JSON.stringify(payload.report)) return null;
  return { ...payload, deliveryEmail: payload.deliveryEmail?.trim().toLowerCase(), report };
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
  const title = payload.eventType === 'contact_requested' ? 'Executive review requested' : payload.eventType === 'report_delivery_requested' ? 'Opportunity scan contact update' : 'New completed opportunity scan';
  const delivery = payload.deliveryEmail ? `<p><strong>Report delivery email:</strong> ${escapeHtml(payload.deliveryEmail)}<br><strong>Contact permission:</strong> Requested report delivery only; no follow-up or recurring-marketing consent.</p>` : '';
  return `<div style="font-family:Arial,sans-serif;color:#172033;line-height:1.5;max-width:760px"><h1>${title}</h1>${contactBlock}${delivery}<h2>Executive summary</h2><p><strong>Scan ID:</strong> ${escapeHtml(payload.scanId)}<br><strong>Completed:</strong> ${escapeHtml(payload.completedAt)}<br><strong>Referral:</strong> ${escapeHtml(payload.referralSource || 'Direct')}<br><strong>Company:</strong> ${escapeHtml(payload.profile.companyName || 'Anonymous')}</p><p><strong>Estimated annual opportunity:</strong> ${escapeHtml(formatMoney(report.annualOpportunity.low))}–${escapeHtml(formatMoney(report.annualOpportunity.high))}<br><strong>EBITDA-equivalent impact:</strong> ${escapeHtml(report.marginImpact.low)}–${escapeHtml(report.marginImpact.high)}%<br><strong>Confidence:</strong> ${escapeHtml(report.confidence)}</p><p>${escapeHtml(report.summary)}</p><h3>Top three opportunities</h3><ol>${leverItems}</ol><p><strong>Recommended first opportunity:</strong> ${escapeHtml(report.recommendation.area)}</p><h2>Complete submitted answers</h2><table style="border-collapse:collapse;width:100%">${rows}</table><h2>Complete calculated report output</h2><pre style="white-space:pre-wrap;background:#f4f6fa;padding:16px;border-radius:8px">${completeReport}</pre></div>`;
}

function visitorEmail(payload: ScanPayload): string {
  return `<div style="font-family:Arial,sans-serif;color:#172033;line-height:1.6;max-width:680px"><h1>Your VRise opportunity report</h1><p>Your completed AI Profit Opportunity Report is attached.</p><p>This service message was sent because this address was provided for report delivery. It does not consent to a follow-up and you have not been added to recurring marketing.</p><p>For questions about your report or personal data, reply to this email or contact <a href="mailto:contact@vrise.tech">contact@vrise.tech</a>.</p><p><a href="https://scanner.vrise.tech/privacy">Privacy notice</a></p></div>`;
}

async function sendResendEmail(apiKey: string, body: Record<string, unknown>, idempotencyKey: string): Promise<EmailSendResult> {
  const cached = emailResults.get(idempotencyKey);
  if (cached && cached.expiresAt > Date.now()) return cached.promise;

  const promise = (async (): Promise<EmailSendResult> => {
    try {
      const response = await fetch(process.env.RESEND_API_URL || 'https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey.slice(0, 256) },
        body: JSON.stringify(body),
      });
      let providerBody: unknown = null;
      try { providerBody = await response.json(); } catch { /* provider may return an empty body */ }
      if (!response.ok) return { accepted: false, status: response.status, error: isObject(providerBody) && typeof providerBody.message === 'string' ? providerBody.message : 'provider_error' };
      return { accepted: true, id: isObject(providerBody) && typeof providerBody.id === 'string' ? providerBody.id : undefined, status: response.status };
    } catch {
      return { accepted: false, error: 'provider_unreachable' };
    }
  })();

  const trackedPromise = promise.then(result => {
    if (!result.accepted) emailResults.delete(idempotencyKey);
    return result;
  });
  emailResults.set(idempotencyKey, { expiresAt: Date.now() + EMAIL_RESULT_TTL_MS, promise: trackedPromise });
  return trackedPromise;
}

export async function POST(request: Request) {
  try {
    if (isRateLimited(request)) return NextResponse.json({ error: 'Too many requests. Please wait and try again.' }, { status: 429 });
    const declaredLength = Number(request.headers.get('content-length') || 0);
    if (declaredLength > MAX_BODY_BYTES) return NextResponse.json({ error: 'Request is too large.' }, { status: 413 });
    const text = await request.text();
    if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) return NextResponse.json({ error: 'Request is too large.' }, { status: 413 });

    let payload: unknown;
    try { payload = JSON.parse(text); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
    if (!validScanPayload(payload)) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    if (payload.eventType === 'contact_requested' && payload.contact?.website) return NextResponse.json({ ok: true });
    const scanPayload = canonicalPayload(payload);
    if (!scanPayload) return NextResponse.json({ error: 'Report validation failed.' }, { status: 400 });

    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.SCAN_NOTIFICATION_TO;
    const from = process.env.SCAN_NOTIFICATION_FROM;
    const replyTo = process.env.SCAN_NOTIFICATION_REPLY_TO || 'contact@vrise.tech';
    if (!apiKey || !to || !from || !EMAIL_PATTERN.test(replyTo)) {
      console.error('Scan notification unavailable: Resend configuration is incomplete.');
      return NextResponse.json({ error: 'Notification service is unavailable.' }, { status: 503 });
    }
    if (/@resend\.dev\b/i.test(from)) {
      console.error('Scan notification unavailable: configure a verified production sender domain.');
      return NextResponse.json({ error: 'Notification service is unavailable.' }, { status: 503 });
    }

    const company = scanPayload.profile.companyName.replace(/[\r\n]+/g, ' ').trim() || 'Anonymous';
    const referral = scanPayload.referralSource.replace(/[\r\n]+/g, ' ').trim() || 'Direct';
    const eventLabel = scanPayload.eventType === 'report_delivery_requested' ? 'Contact update' : scanPayload.eventType === 'contact_requested' ? 'Executive review' : 'New VRise opportunity scan';
    const subject = `${eventLabel} — ${company} — ${referral}`;
    const pdf = scanPayload.eventType === 'contact_requested' ? null : generateReportPdf(scanPayload);
    const attachment = pdf ? { filename: `vrise-opportunity-report-${scanPayload.scanId.slice(0, 36)}.pdf`, content: pdf.toString('base64') } : null;
    const common = attachment ? { from, attachments: [attachment] } : { from };
    const emailHash = scanPayload.deliveryEmail ? createHash('sha256').update(scanPayload.deliveryEmail).digest('hex').slice(0, 24) : 'anonymous';
    const adminReplyTo = scanPayload.deliveryEmail || scanPayload.contact?.email;

    const shouldSendAdmin = scanPayload.eventType !== 'report_delivery_requested';
    const shouldSendCustomer = Boolean(scanPayload.deliveryEmail && scanPayload.eventType !== 'contact_requested');
    const adminPromise = shouldSendAdmin
      ? sendResendEmail(apiKey, { ...common, to: [to], subject, html: buildEmail(scanPayload), ...(adminReplyTo ? { reply_to: adminReplyTo } : {}) }, `${scanPayload.scanId}:vrise:${scanPayload.eventType}:${emailHash}`)
      : Promise.resolve<EmailSendResult>({ accepted: false, skipped: true });
    const customerPromise = shouldSendCustomer
      ? sendResendEmail(apiKey, { ...common, to: [scanPayload.deliveryEmail!], subject: 'Your VRise AI Profit Opportunity Report', html: visitorEmail(scanPayload), reply_to: replyTo }, `${scanPayload.scanId}:visitor:${emailHash}`)
      : Promise.resolve<EmailSendResult>({ accepted: false, skipped: true });
    const [admin, customer] = await Promise.all([adminPromise, customerPromise]);
    const ok = (!shouldSendAdmin || admin.accepted) && (!shouldSendCustomer || customer.accepted);
    if (!ok) console.error(`Scan notification delivery failed (admin:${admin.status ?? 'unavailable'}, customer:${customer.status ?? 'unavailable'}).`);
    return NextResponse.json({ ok, status: ok ? 'accepted' : 'failed', admin, customer, accepted: ok, delivered: false }, { status: ok ? 200 : 502 });
  } catch {
    console.error('Scan notification failed unexpectedly.');
    return NextResponse.json({ error: 'Notification could not be delivered.' }, { status: 500 });
  }
}
