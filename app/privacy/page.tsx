import { VRiseLogo } from '../../components/ui/VRiseLogo';

export const metadata = { title: 'Opportunity Scanner Privacy Notice | VRise' };

const headingClass = 'mb-1 text-base font-bold font-heading text-[#0D1726]';
const linkClass = 'font-semibold text-[#4F68FF] hover:underline';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#EEF2F8] px-4 py-10 sm:px-6">
      <article className="mx-auto max-w-3xl rounded-[18px] border border-[rgba(20,35,55,0.10)] bg-white p-6 sm:p-9" style={{ boxShadow: 'var(--shadow-md)' }}>
        <VRiseLogo variant="full-color" height={30} className="mb-7" />
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4F68FF]">Opportunity Scanner</p>
        <h1 className="mt-2 text-3xl font-extrabold font-heading tracking-tight text-[#0D1726]">Privacy notice</h1>

        <div className="mt-7 space-y-5 text-sm leading-relaxed text-[#3B4960]">
          <section>
            <h2 className={headingClass}>Who we are</h2>
            <p>VRise Limited controls the personal data used by this scanner. Contact <a className={linkClass} href="mailto:contact@vrise.tech">contact@vrise.tech</a> about privacy or your data.</p>
          </section>

          <section>
            <h2 className={headingClass}>What we use</h2>
            <p>We use your scanner answers, calculated report, optional company name and email, referral information, and basic security data to operate the scanner, prevent misuse, and respond to an executive-review request. Please do not submit sensitive or confidential personal information.</p>
          </section>

          <section>
            <h2 className={headingClass}>Email choices</h2>
            <p>If you provide an email, it is shared with VRise so we can identify your submission and respond where appropriate. Any relevant personalised follow-up is separate and will only be sent where Irish electronic-marketing rules permit it. Occasional marketing is separate and requires the optional marketing checkbox. You can object or opt out at any time by emailing <a className={linkClass} href="mailto:contact@vrise.tech">contact@vrise.tech</a>.</p>
          </section>

          <section>
            <h2 className={headingClass}>Scoring and service providers</h2>
            <p>The scanner applies fixed rules to your answers to produce indicative opportunity ranges and rankings. It does not make legal or similarly significant decisions. Cloudflare, Render and Resend process limited data to secure, host and email the service. Processing may occur outside the EEA using the safeguards in those providers&apos; data-processing terms.</p>
          </section>

          <section>
            <h2 className={headingClass}>Retention and your rights</h2>
            <p>We keep information only as long as needed to deliver the service, respond to requests, maintain security, meet legal obligations, and honour marketing preferences or opt-outs. You may request access, correction, deletion, restriction or portability, object to certain processing or direct marketing, and withdraw consent. You may also complain to the <a className={linkClass} href="https://www.dataprotection.ie/" target="_blank" rel="noopener noreferrer">Data Protection Commission</a>.</p>
          </section>
        </div>
      </article>
    </main>
  );
}
