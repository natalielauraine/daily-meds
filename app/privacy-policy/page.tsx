import Link from "next/link";
import Logo from "../components/Logo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Daily Meds",
  description: "How Daily Meds collects, uses, and protects your personal data. GDPR compliant, UK Data Protection Act 2018.",
};

const SECTIONS = [
  {
    id: "introduction",
    number: "1",
    title: "Introduction",
    content: (
      <>
        <p>
          Welcome to Daily Meds (<a href="https://thedailymeds.com" target="_blank" rel="noopener noreferrer">thedailymeds.com</a>). We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and protect your information when you use our meditation and wellness platform and related services (the &ldquo;Service&rdquo;).
        </p>
        <p>
          This policy applies to all users worldwide and complies with the <strong>UK General Data Protection Regulation (UK GDPR)</strong>, the <strong>UK Data Protection Act 2018</strong>, the <strong>EU General Data Protection Regulation (EU GDPR)</strong>, and other applicable data protection laws.
        </p>
      </>
    ),
  },
  {
    id: "data-controller",
    number: "2",
    title: "Data Controller",
    content: (
      <>
        <p>The data controller responsible for your personal data is:</p>
        <p className="mt-3">
          <strong>Daily Meds FZ LLC</strong><br />
          CEO and Data Controller: <strong>Natalie Lauraine</strong><br />
          Email: <a href="mailto:support@thedailymeds.com">support@thedailymeds.com</a><br />
          Website: <a href="https://thedailymeds.com" target="_blank" rel="noopener noreferrer">thedailymeds.com</a>
        </p>
        <p className="mt-3">
          If you have any questions about how we handle your personal data, or you wish to exercise any of your data protection rights, please contact us using the details above.
        </p>
      </>
    ),
  },
  {
    id: "information-we-collect",
    number: "3",
    title: "Information We Collect",
    content: (
      <>
        <h3>3.1 Information You Provide</h3>
        <ul>
          <li><strong>Account Information:</strong> Name, email address, and password (or Google account details if using Google OAuth sign-in)</li>
          <li><strong>Payment Information:</strong> Payment card details and billing information, processed securely by Stripe. We do not store your full card number on our servers.</li>
          <li><strong>Profile Data:</strong> Meditation preferences, goals, and other optional profile details you choose to provide</li>
          <li><strong>Community Content:</strong> Posts, comments, reactions, and messages you share in community features</li>
          <li><strong>Communications:</strong> Messages you send to our support team</li>
        </ul>
        <h3>3.2 Information Collected Automatically</h3>
        <ul>
          <li><strong>Usage Data:</strong> Meditation sessions completed, duration, frequency, streaks, and progress tracking</li>
          <li><strong>Device Information:</strong> Device type, operating system, browser type, and IP address</li>
          <li><strong>Log Data:</strong> Access times, pages viewed, and errors encountered</li>
        </ul>
        <h3>3.3 Information from Third Parties</h3>
        <ul>
          <li><strong>Google OAuth:</strong> If you sign in with Google, we receive your name, email address, and profile photo from your Google account</li>
          <li><strong>Stripe:</strong> Transaction confirmation and payment status (we never receive or store your full card number)</li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use",
    number: "4",
    title: "How We Use Your Information",
    content: (
      <>
        <p className="mb-4">We use your information for the following purposes:</p>
        <h3>4.1 Service Delivery</h3>
        <ul>
          <li>Provide access to meditation content, sessions, and features</li>
          <li>Personalise your experience and recommend content</li>
          <li>Track your meditation progress, streaks, and history</li>
          <li>Enable community features and group meditation</li>
          <li>Process payments and manage subscriptions via Stripe</li>
        </ul>
        <h3>4.2 Communication</h3>
        <ul>
          <li>Send essential service-related notifications (e.g. password resets, subscription confirmations)</li>
          <li>Respond to your support enquiries</li>
          <li>Send newsletters and promotional content (only with your explicit consent, and you can unsubscribe at any time)</li>
        </ul>
        <h3>4.3 Improvement and Analytics</h3>
        <ul>
          <li>Analyse usage patterns to improve our Service</li>
          <li>Develop new features and content</li>
          <li>Monitor and improve platform performance and reliability</li>
        </ul>
        <h3>4.4 Safety and Compliance</h3>
        <ul>
          <li>Prevent fraud, abuse, and security threats</li>
          <li>Enforce our Terms and Conditions</li>
          <li>Comply with legal obligations</li>
        </ul>
      </>
    ),
  },
  {
    id: "legal-basis",
    number: "5",
    title: "Legal Basis for Processing",
    content: (
      <>
        <p className="mb-4">Under the UK GDPR and EU GDPR, we process your personal data based on the following lawful grounds:</p>
        <ul>
          <li><strong>Contractual Necessity (Article 6(1)(b)):</strong> Processing necessary to provide our Service and fulfil our contract with you — e.g. creating your account, processing payments, delivering meditation content</li>
          <li><strong>Legitimate Interests (Article 6(1)(f)):</strong> Processing necessary for our legitimate interests, such as improving our Service, ensuring security, and conducting analytics — provided these interests do not override your fundamental rights</li>
          <li><strong>Consent (Article 6(1)(a)):</strong> Where you have given clear consent for us to process your data for a specific purpose — e.g. marketing communications. You can withdraw consent at any time</li>
          <li><strong>Legal Obligation (Article 6(1)(c)):</strong> Processing necessary to comply with applicable laws — e.g. retaining payment records for tax purposes</li>
        </ul>
      </>
    ),
  },
  {
    id: "sharing",
    number: "6",
    title: "How We Share Your Information",
    highlight: true,
    content: (
      <>
        <p className="mb-4"><strong>We do not sell, share, or trade your personal information (including your name, email address, or any other identifying data) to third parties. Full stop.</strong></p>
        <p className="mb-4">We only share your data with trusted service providers who are strictly necessary to operate our Service. These providers process data on our behalf and under our instructions, subject to contractual data processing agreements:</p>
        <h3>6.1 Service Providers</h3>
        <ul>
          <li><strong>Stripe</strong> — Payment processing. Stripe receives your payment card details to process subscriptions. Stripe is PCI DSS Level 1 certified. <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">Stripe Privacy Policy</a></li>
          <li><strong>Supabase</strong> — Database, authentication, and backend infrastructure. Stores your account data and meditation progress. <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Supabase Privacy Policy</a></li>
          <li><strong>Cloudflare</strong> — Content delivery network (CDN) and media storage. Delivers audio and video content to you. <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">Cloudflare Privacy Policy</a></li>
          <li><strong>Resend</strong> — Transactional email delivery. Sends password resets, subscription confirmations, and other service emails. <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Resend Privacy Policy</a></li>
          <li><strong>Vercel</strong> — Web application hosting. Hosts and serves our website. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Vercel Privacy Policy</a></li>
          <li><strong>Daily.co</strong> — Live video infrastructure for group meditation sessions (coming soon). <a href="https://www.daily.co/legal/privacy" target="_blank" rel="noopener noreferrer">Daily.co Privacy Policy</a></li>
          <li><strong>Google</strong> — OAuth authentication. If you choose to sign in with Google, Google provides your basic profile information to us. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></li>
        </ul>
        <h3>6.2 Other Users</h3>
        <p>Information you choose to share publicly (such as community posts, group interactions, or your display name) will be visible to other users according to the feature you are using.</p>
        <h3>6.3 Legal Requirements</h3>
        <p>We may disclose information when required by law, court order, or government request, or to protect our rights, property, or safety, or the rights, property, or safety of others.</p>
        <h3>6.4 Business Transfers</h3>
        <p>If Daily Meds FZ LLC is involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will notify you before your data is transferred and becomes subject to a different privacy policy. You will have the option to request deletion of your data prior to any such transfer.</p>
      </>
    ),
  },
  {
    id: "retention",
    number: "7",
    title: "Data Retention",
    content: (
      <>
        <p className="mb-4">We retain your personal data only for as long as necessary to fulfil the purposes described in this policy:</p>
        <ul>
          <li><strong>Account data</strong> is retained while your account is active and until you request deletion</li>
          <li><strong>Meditation history and progress</strong> is retained to provide continuity of your experience</li>
          <li><strong>Payment records</strong> are retained as required by law (typically 6-7 years for tax and accounting purposes)</li>
          <li><strong>After account deletion</strong>, we will delete or anonymise your personal data within 30 days, except where we are required by law to retain certain records</li>
        </ul>
        <p className="mt-4">You can request deletion of your data at any time (see Section 9 — Your Rights).</p>
      </>
    ),
  },
  {
    id: "cookies",
    number: "8",
    title: "Cookies",
    content: (
      <>
        <p className="mb-4">We use <strong>essential cookies only</strong>. We do not use advertising cookies, tracking cookies, or analytics cookies.</p>
        <p className="mb-4">The only cookies we set are:</p>
        <ul>
          <li><strong>Authentication cookies</strong> — Set by Supabase to keep you signed in to your account. These are strictly necessary for the Service to function and cannot be disabled</li>
        </ul>
        <p className="mt-4">Because we only use strictly necessary cookies, we do not require a cookie consent banner under the UK GDPR and the Privacy and Electronic Communications Regulations (PECR).</p>
      </>
    ),
  },
  {
    id: "security",
    number: "9",
    title: "Data Security",
    content: (
      <>
        <p className="mb-4">We implement appropriate technical and organisational measures to protect your personal data, including:</p>
        <ul>
          <li>Encryption in transit (HTTPS/TLS) on all connections</li>
          <li>Encryption at rest for stored data</li>
          <li>Secure password hashing (your password is never stored in plain text)</li>
          <li>PCI DSS compliant payment processing via Stripe (we never see or store your full card number)</li>
          <li>Row-level security on our database to prevent unauthorised data access</li>
          <li>Regular security reviews</li>
        </ul>
        <p className="mt-4">While we take every reasonable step to protect your data, no system is completely secure. You are responsible for keeping your account credentials confidential.</p>
      </>
    ),
  },
  {
    id: "rights",
    number: "10",
    title: "Your Rights",
    content: (
      <>
        <p className="mb-4">Under the UK GDPR, EU GDPR, and UK Data Protection Act 2018, you have the following rights regarding your personal data:</p>
        <ul>
          <li><strong>Right of Access (Article 15):</strong> Request a copy of the personal data we hold about you</li>
          <li><strong>Right to Rectification (Article 16):</strong> Request correction of any inaccurate or incomplete data</li>
          <li><strong>Right to Erasure (Article 17):</strong> Request deletion of your personal data (&ldquo;right to be forgotten&rdquo;)</li>
          <li><strong>Right to Restriction (Article 18):</strong> Request that we limit how we process your data</li>
          <li><strong>Right to Data Portability (Article 20):</strong> Receive your data in a structured, commonly used, machine-readable format</li>
          <li><strong>Right to Object (Article 21):</strong> Object to processing based on legitimate interests or for direct marketing</li>
          <li><strong>Right to Withdraw Consent:</strong> Where processing is based on consent, withdraw that consent at any time without affecting the lawfulness of prior processing</li>
          <li><strong>Right to Lodge a Complaint:</strong> You have the right to lodge a complaint with the UK Information Commissioner&rsquo;s Office (ICO) at <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</a>, or with your local supervisory authority</li>
        </ul>
        <p className="mt-4">To exercise any of these rights, contact us at <a href="mailto:support@thedailymeds.com">support@thedailymeds.com</a>. We will respond within <strong>one calendar month</strong> as required by law. There is no fee to exercise your rights (unless a request is manifestly unfounded or excessive).</p>
      </>
    ),
  },
  {
    id: "international",
    number: "11",
    title: "International Data Transfers",
    content: (
      <>
        <p className="mb-4">Some of our service providers operate outside the United Kingdom and European Economic Area. Where your data is transferred internationally, we ensure appropriate safeguards are in place, including:</p>
        <ul>
          <li>Standard Contractual Clauses (SCCs) approved by the UK Secretary of State or European Commission</li>
          <li>Transfers to countries with an adequacy decision from the UK or EU</li>
          <li>Data processing agreements with all third-party providers</li>
        </ul>
        <p className="mt-4">You can request details of the specific safeguards applied to international transfers of your data by contacting us.</p>
      </>
    ),
  },
  {
    id: "children",
    number: "12",
    title: "Age Requirement",
    content: (
      <p>Our Service is intended for users aged <strong>16 and over</strong>, in accordance with Article 8 of the UK GDPR. We do not knowingly collect personal data from anyone under the age of 16. If you believe we have inadvertently collected data from someone under 16, please contact us immediately at <a href="mailto:support@thedailymeds.com">support@thedailymeds.com</a>, and we will delete it promptly.</p>
    ),
  },
  {
    id: "third-party",
    number: "13",
    title: "Third-Party Links",
    content: (
      <p>Our Service may contain links to third-party websites or services. We are not responsible for the privacy practices of those third parties. We encourage you to read their privacy policies before providing any personal information to them.</p>
    ),
  },
  {
    id: "changes",
    number: "14",
    title: "Changes to This Policy",
    content: (
      <p>We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. We will notify you of significant changes via email or through a prominent notice on the Service. The &ldquo;Last Updated&rdquo; date at the top of this page indicates when this policy was last revised. Your continued use of the Service after changes are posted constitutes acceptance of the updated policy.</p>
    ),
  },
  {
    id: "contact",
    number: "15",
    title: "Contact Us",
    content: (
      <>
        <p className="mb-3">If you have any questions about this Privacy Policy, wish to exercise your data protection rights, or have concerns about how we handle your personal data, please contact us:</p>
        <p>
          <strong>Daily Meds FZ LLC</strong><br />
          Data Controller: <strong>Natalie Lauraine</strong><br />
          Email: <a href="mailto:support@thedailymeds.com">support@thedailymeds.com</a><br />
          Website: <a href="https://thedailymeds.com" target="_blank" rel="noopener noreferrer">thedailymeds.com</a>
        </p>
        <p className="mt-3">
          You also have the right to lodge a complaint with the UK Information Commissioner&rsquo;s Office (ICO):<br />
          <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noopener noreferrer">ico.org.uk/make-a-complaint</a>
        </p>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div style={{ backgroundColor: "#010101", color: "#ffffff", fontFamily: "var(--font-manrope)", minHeight: "100vh" }}>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4"
        style={{
          backgroundColor: "rgba(1,1,1,0.92)",
          backdropFilter: "blur(20px)",
          borderBottom: "0.5px solid rgba(255,255,255,0.06)",
        }}
      >
        <Logo href="/" size="md" />
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-lexend)" }}>
            Log in
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2 rounded-full text-sm font-bold uppercase transition-transform hover:scale-105"
            style={{ backgroundColor: "#ff41b3", color: "#fff", fontFamily: "var(--font-lexend)" }}
          >
            Start Free
          </Link>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section
        className="py-20 px-6 text-center"
        style={{ background: "linear-gradient(160deg, #080808 0%, #010101 100%)" }}
      >
        <div className="max-w-3xl mx-auto">
          <span
            className="text-xs uppercase tracking-widest px-4 py-1.5 rounded-full border inline-block mb-6"
            style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-lexend)" }}
          >
            Legal
          </span>
          <h1
            className="uppercase leading-none tracking-tight mb-4"
            style={{ fontFamily: "var(--font-nyata), var(--font-lexend)", fontWeight: 900, fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
          >
            Privacy Policy
          </h1>
          <p className="text-sm mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>
            Last Updated: June 2026
          </p>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
            Daily Meds FZ LLC &middot; Data Controller: Natalie Lauraine
          </p>
        </div>
      </section>

      {/* ── CONTENT ────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 pb-24">

        {/* Table of contents */}
        <nav
          className="mb-16 p-6 rounded-2xl"
          style={{ backgroundColor: "#0e0e0e", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <h2
            className="text-xs uppercase tracking-widest mb-4"
            style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-lexend)" }}
          >
            Contents
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-sm flex items-center gap-2 transition-colors hover:text-white group"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                <span
                  className="text-xs font-bold w-6 shrink-0 group-hover:text-[#aaee20] transition-colors"
                  style={{ color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-lexend)" }}
                >
                  {s.number}.
                </span>
                {s.title}
              </a>
            ))}
          </div>
        </nav>

        {/* Sections */}
        <div className="flex flex-col gap-12">
          {SECTIONS.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-24"
            >
              <div
                className="p-8 rounded-2xl"
                style={section.highlight ? {
                  backgroundColor: "rgba(170,238,32,0.03)",
                  border: "1px solid rgba(170,238,32,0.12)",
                } : {
                  backgroundColor: "#0e0e0e",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex items-start gap-4 mb-5">
                  <span
                    className="text-xs font-black px-2.5 py-1 rounded-lg shrink-0 mt-0.5"
                    style={{ backgroundColor: "rgba(170,238,32,0.1)", color: "#aaee20", fontFamily: "var(--font-lexend)" }}
                  >
                    {section.number}
                  </span>
                  <h2
                    className="text-xl uppercase tracking-tight"
                    style={{ fontFamily: "var(--font-nyata), var(--font-lexend)", fontWeight: 800 }}
                  >
                    {section.title}
                  </h2>
                </div>
                <div className="prose-section pl-10" style={{ color: "rgba(255,255,255,0.65)", lineHeight: "1.8" }}>
                  {section.content}
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* Bottom nav */}
        <div
          className="mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
            &copy; {new Date().getFullYear()} Daily Meds FZ LLC. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/terms" className="text-xs hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.35)" }}>
              Terms & Conditions
            </Link>
            <Link href="/" className="text-xs hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.35)" }}>
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .prose-section h3 {
          font-family: var(--font-lexend);
          font-weight: 700;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: rgba(255,255,255,0.5);
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .prose-section p { margin-bottom: 0.75rem; }
        .prose-section ul {
          list-style: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .prose-section ul li {
          padding-left: 1.25rem;
          position: relative;
        }
        .prose-section ul li::before {
          content: '\\2014';
          position: absolute;
          left: 0;
          color: rgba(170,238,32,0.5);
          font-size: 0.75rem;
        }
        .prose-section a {
          color: #aaee20;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .prose-section a:hover { color: #ffffff; }
        .prose-section strong { color: #ffffff; font-weight: 700; }
      `}</style>
    </div>
  );
}
