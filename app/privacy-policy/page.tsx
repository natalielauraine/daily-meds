import Link from "next/link";
import Logo from "../components/Logo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Daily Meds",
  description: "How Daily Meds collects, uses, and protects your personal data. GDPR & CCPA compliant.",
};

const SECTIONS = [
  {
    id: "introduction",
    number: "1",
    title: "Introduction",
    content: (
      <p>
        Welcome to Daily Meds. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, share, and protect your information when you use our meditation platform and related services ("Service"). This policy applies to all users worldwide and complies with <strong>GDPR</strong>, <strong>CCPA</strong>, and other applicable privacy laws.
      </p>
    ),
  },
  {
    id: "information-we-collect",
    number: "2",
    title: "Information We Collect",
    content: (
      <>
        <h3>2.1 Information You Provide</h3>
        <ul>
          <li><strong>Account Information:</strong> Name, email address, password, profile photo</li>
          <li><strong>Payment Information:</strong> Credit card details, billing address (processed securely by third-party payment processors)</li>
          <li><strong>Profile Data:</strong> Meditation preferences, goals, bio, and other optional profile details</li>
          <li><strong>Community Content:</strong> Posts, comments, reactions, and messages you share in community features</li>
          <li><strong>Communications:</strong> Messages you send to our support team or through in-app messaging</li>
        </ul>
        <h3>2.2 Information Collected Automatically</h3>
        <ul>
          <li><strong>Usage Data:</strong> Meditation sessions completed, duration, frequency, feature usage, and progress tracking</li>
          <li><strong>Device Information:</strong> Device type, operating system, browser type, IP address, device identifiers</li>
          <li><strong>Log Data:</strong> Access times, pages viewed, clickstream data, errors encountered</li>
          <li><strong>Cookies and Tracking:</strong> Cookies, web beacons, and similar technologies (see Section 7)</li>
          <li><strong>Location Data:</strong> Approximate location based on IP address (we do not collect precise GPS location)</li>
        </ul>
        <h3>2.3 Information from Third Parties</h3>
        <ul>
          <li><strong>Social Media:</strong> If you connect via social login, we receive basic profile information</li>
          <li><strong>Analytics Providers:</strong> Usage statistics and performance metrics</li>
          <li><strong>Payment Processors:</strong> Transaction confirmation and payment status</li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use",
    number: "3",
    title: "How We Use Your Information",
    content: (
      <>
        <p className="mb-4">We use your information for the following purposes:</p>
        <h3>3.1 Service Delivery</h3>
        <ul>
          <li>Provide access to meditation content and features</li>
          <li>Personalise your experience and recommend content</li>
          <li>Track your progress and maintain meditation history</li>
          <li>Enable community features and social interactions</li>
          <li>Process payments and manage subscriptions</li>
        </ul>
        <h3>3.2 Communication</h3>
        <ul>
          <li>Send service-related notifications and updates</li>
          <li>Respond to your inquiries and support requests</li>
          <li>Send newsletters and promotional content (with your consent)</li>
          <li>Notify you about challenges, group activities, and achievements</li>
        </ul>
        <h3>3.3 Improvement and Analytics</h3>
        <ul>
          <li>Analyse usage patterns to improve our Service</li>
          <li>Develop new features and content</li>
          <li>Conduct research and statistical analysis</li>
          <li>Test and optimise performance</li>
        </ul>
        <h3>3.4 Safety and Compliance</h3>
        <ul>
          <li>Prevent fraud, abuse, and security threats</li>
          <li>Enforce our Terms and Conditions</li>
          <li>Comply with legal obligations</li>
          <li>Protect user safety and platform integrity</li>
        </ul>
      </>
    ),
  },
  {
    id: "legal-basis",
    number: "4",
    title: "Legal Basis for Processing (GDPR)",
    content: (
      <>
        <p className="mb-4">For users in the European Economic Area (EEA), we process your data based on:</p>
        <ul>
          <li><strong>Contractual Necessity:</strong> To provide our Service and fulfil our contract with you</li>
          <li><strong>Legitimate Interests:</strong> To improve our Service, ensure security, and conduct analytics</li>
          <li><strong>Consent:</strong> For marketing communications and optional features (you can withdraw consent anytime)</li>
          <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
        </ul>
      </>
    ),
  },
  {
    id: "sharing",
    number: "5",
    title: "How We Share Your Information",
    content: (
      <>
        <p className="mb-4">We <strong>do not sell your personal data</strong>. We may share your information with:</p>
        <h3>5.1 Service Providers</h3>
        <p className="mb-3">Third-party vendors who help us operate our Service, including:</p>
        <ul>
          <li>Cloud hosting and storage providers</li>
          <li>Payment processors (Stripe, etc.)</li>
          <li>Email and communication services</li>
          <li>Analytics and performance monitoring tools</li>
          <li>Customer support platforms</li>
        </ul>
        <h3>5.2 Other Users</h3>
        <p>Information you choose to share publicly (profile information, community posts, group interactions) will be visible to other users according to your privacy settings.</p>
        <h3>5.3 Legal Requirements</h3>
        <p>We may disclose information when required by law, court order, or government request, or to protect our rights, property, or safety.</p>
        <h3>5.4 Business Transfers</h3>
        <p>If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. You will have the option to not transfer your data at this point, prior to the sale of Daily Meds.</p>
      </>
    ),
  },
  {
    id: "retention",
    number: "6",
    title: "Data Retention",
    content: (
      <>
        <p className="mb-4">We retain your personal data for as long as necessary to provide our Service and fulfil the purposes described in this policy. Specifically:</p>
        <ul>
          <li>Account data is retained while your account is active</li>
          <li>Meditation history and progress data is retained to provide continuity</li>
          <li>Payment records are retained as required by law (typically 7 years)</li>
          <li>After account deletion, we retain minimal data for legal compliance and fraud prevention</li>
        </ul>
        <p className="mt-4">You can request deletion of your data at any time (see Section 9).</p>
      </>
    ),
  },
  {
    id: "cookies",
    number: "7",
    title: "Cookies and Tracking Technologies",
    content: (
      <>
        <p className="mb-4">We use cookies and similar technologies to enhance your experience. Types of cookies we use:</p>
        <ul>
          <li><strong>Essential Cookies:</strong> Required for basic functionality (authentication, security)</li>
          <li><strong>Performance Cookies:</strong> Help us understand how users interact with the Service</li>
          <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
          <li><strong>Analytics Cookies:</strong> Collect usage data to improve our Service</li>
          <li><strong>Advertising Cookies:</strong> Used for targeted marketing (only with your consent)</li>
        </ul>
        <p className="mt-4">You can control cookies through your browser settings. However, disabling cookies may affect functionality.</p>
      </>
    ),
  },
  {
    id: "security",
    number: "8",
    title: "Data Security",
    content: (
      <>
        <p className="mb-4">We implement industry-standard security measures to protect your data, including:</p>
        <ul>
          <li>Encryption in transit (HTTPS/TLS) and at rest</li>
          <li>Secure authentication and password hashing</li>
          <li>Regular security audits and vulnerability assessments</li>
          <li>Access controls and employee training</li>
          <li>Secure payment processing through PCI-compliant providers</li>
        </ul>
        <p className="mt-4">While we strive to protect your data, no security system is impenetrable. You are responsible for maintaining the confidentiality of your account credentials.</p>
      </>
    ),
  },
  {
    id: "rights",
    number: "9",
    title: "Your Privacy Rights",
    content: (
      <>
        <p className="mb-4">Depending on your location, you may have the following rights:</p>
        <h3>9.1 All Users</h3>
        <ul>
          <li><strong>Access:</strong> Request a copy of your personal data</li>
          <li><strong>Correction:</strong> Update or correct inaccurate information</li>
          <li><strong>Deletion:</strong> Request deletion of your account and data</li>
          <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
        </ul>
        <h3>9.2 GDPR Rights (EEA Users)</h3>
        <ul>
          <li><strong>Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
          <li><strong>Restriction:</strong> Limit how we process your data</li>
          <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
          <li><strong>Withdraw Consent:</strong> Withdraw consent for processing at any time</li>
          <li><strong>Lodge a Complaint:</strong> File a complaint with your local data protection authority</li>
        </ul>
        <h3>9.3 CCPA Rights (California Residents)</h3>
        <ul>
          <li>Right to know what personal information is collected</li>
          <li>Right to know if personal information is sold or disclosed</li>
          <li>Right to opt-out of the sale of personal information (we do not sell data)</li>
          <li>Right to deletion of personal information</li>
          <li>Right to non-discrimination for exercising privacy rights</li>
        </ul>
        <p className="mt-4">To exercise your rights, contact us at <a href="mailto:joy@dailymeds.com">joy@dailymeds.com</a>. We will respond within 30 days (or as required by law).</p>
      </>
    ),
  },
  {
    id: "international",
    number: "10",
    title: "International Data Transfers",
    content: (
      <>
        <p className="mb-4">Your information may be transferred to and processed in countries outside your country of residence, including countries that may not have the same data protection laws. We ensure appropriate safeguards are in place, including:</p>
        <ul>
          <li>Standard Contractual Clauses approved by the European Commission</li>
          <li>Data processing agreements with third-party providers</li>
          <li>Compliance with applicable data transfer regulations</li>
        </ul>
      </>
    ),
  },
  {
    id: "children",
    number: "11",
    title: "Children's Privacy",
    content: (
      <p>Our Service is not directed to children under 13 (or the age of majority in your jurisdiction). We do not knowingly collect personal information from children. If you believe we have collected data from a child, please contact us immediately, and we will delete it.</p>
    ),
  },
  {
    id: "third-party",
    number: "12",
    title: "Third-Party Links and Services",
    content: (
      <p>Our Service may contain links to third-party websites, apps, or services (e.g., Spotify, Apple Music, social media). We are not responsible for their privacy practices. We encourage you to review their privacy policies before providing any personal information.</p>
    ),
  },
  {
    id: "changes",
    number: "13",
    title: "Changes to This Privacy Policy",
    content: (
      <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or through a prominent notice on the Service. Your continued use after changes constitutes acceptance of the updated policy. We recommend reviewing this policy periodically.</p>
    ),
  },
  {
    id: "dnt",
    number: "14",
    title: "Do Not Track",
    content: (
      <p>Some browsers have a "Do Not Track" feature. We currently do not respond to Do Not Track signals, as there is no industry standard for interpreting them.</p>
    ),
  },
  {
    id: "dpo",
    number: "15",
    title: "Data Protection Officer",
    content: (
      <p>For GDPR-related inquiries, you may contact our Data Protection Officer at <a href="mailto:joy@dailymeds.com">joy@dailymeds.com</a>.</p>
    ),
  },
  {
    id: "contact",
    number: "16",
    title: "Contact Us",
    content: (
      <>
        <p className="mb-2">If you have questions about this Privacy Policy or how we handle your data, please contact us:</p>
        <p><strong>Email:</strong> <a href="mailto:joy@dailymeds.com">joy@dailymeds.com</a></p>
      </>
    ),
  },
  {
    id: "consent",
    number: "17",
    title: "Consent",
    content: (
      <p>By using Daily Meds, you consent to the collection, use, and sharing of your information as described in this Privacy Policy. If you do not agree, please do not use our Service.</p>
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
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.35)" }}>
            Last Updated: November 27, 2025
          </p>
          <Link
            href="/privacy"
            className="inline-flex items-center gap-2 text-sm transition-colors hover:text-white"
            style={{ color: "#ff41b3", fontFamily: "var(--font-lexend)" }}
          >
            🤍 Read our Privacy Promise instead →
          </Link>
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
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <div className="p-8 rounded-2xl" style={{ backgroundColor: "#0e0e0e", border: "1px solid rgba(255,255,255,0.06)" }}>
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
            © {new Date().getFullYear()} I AM Sound Ltd, Trading as Daily Meds. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/terms" className="text-xs hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.35)" }}>
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="text-xs hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.35)" }}>
              Privacy Promise
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
          content: '—';
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
