import Link from "next/link";
import Logo from "../components/Logo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions — Daily Meds",
  description: "Terms and Conditions for The Daily Meds platform, operated by I AM Sound Ltd.",
};

const SECTIONS = [
  {
    id: "agreement",
    number: "1",
    title: "Agreement to Terms",
    content: (
      <p>
        By accessing or using Daily Meds ("the Platform", "our Service"), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not access the Service. Daily Meds is operated by <strong>I AM Sound Ltd</strong>, Trading as Daily Meds and provides guided meditation content, wellness resources, and community features.
      </p>
    ),
  },
  {
    id: "account",
    number: "2",
    title: "Account Registration",
    content: (
      <>
        <p className="mb-4">To access certain features of the Platform, you must register for an account. You agree to:</p>
        <ul>
          <li>Provide accurate, current, and complete information during registration</li>
          <li>Maintain the security of your password and account</li>
          <li>Accept responsibility for all activities under your account</li>
          <li>Notify us immediately of any unauthorized access or security breach</li>
          <li>Be at least 13 years of age (or the age of majority in your jurisdiction)</li>
        </ul>
      </>
    ),
  },
  {
    id: "subscription",
    number: "3",
    title: "Subscription and Payment Terms",
    content: (
      <>
        <h3>3.1 Subscription Plans</h3>
        <p>Daily Meds offers various subscription tiers with different features and content access. Subscription fees are charged in advance on a recurring basis (monthly, annually, or as specified) and will automatically renew unless cancelled.</p>
        <h3>3.2 Payment Processing</h3>
        <p>All payments are processed securely through third-party payment processors. You authorize us to charge your payment method for all fees incurred. You are responsible for providing accurate payment information and updating it as needed.</p>
        <h3>3.3 Free Trial</h3>
        <p>We may offer a free trial period for new subscribers. You will be charged the subscription fee at the end of the trial period unless you cancel before the trial ends. You may only use one free trial per account.</p>
        <h3>3.4 Price Changes</h3>
        <p>We reserve the right to modify subscription fees. You will be notified of any price changes at least 30 days in advance. Continued use of the Service after the price change constitutes acceptance of the new pricing.</p>
      </>
    ),
  },
  {
    id: "affiliate",
    number: "4",
    title: "Affiliate Program and Payouts",
    content: (
      <>
        <h3>4.1 Affiliate Commission</h3>
        <p>All registered users are eligible to participate in our affiliate program and earn <strong>10% recurring commission</strong> on subscription payments made by users who sign up through their unique affiliate link.</p>
        <h3>4.2 Minimum Payout Threshold</h3>
        <p>The minimum payout amount is <strong>$20 per month</strong>. Commissions below this threshold will roll over to the following month until the $20 minimum is reached.</p>
        <p>This policy exists because banking and payment processing fees for smaller transfers often exceed the value of the transfer itself, making payouts under $20 economically impractical. International wire fees, payment processor charges, and currency conversion costs can significantly erode smaller amounts.</p>
        <p>This threshold also incentivises affiliates to grow their referral network — the more friends you bring to Daily Meds, the faster you reach your payout and receive your abundance for sharing peace with the world.</p>
        <h3>4.3 Payout Schedule</h3>
        <p>Payouts are processed monthly for affiliates who have reached the $20 minimum threshold. Payment methods and processing times may vary based on your location and preferred payment method.</p>
      </>
    ),
  },
  {
    id: "cancellation",
    number: "5",
    title: "Cancellation and Refunds",
    content: (
      <>
        <h3>5.1 Cancellation Policy</h3>
        <p>You may cancel your subscription at any time through your account settings. Cancellation will take effect at the end of your current billing period, and you will retain access to premium features until that date.</p>
        <h3>5.2 Refund Policy</h3>
        <p>Subscription fees are generally non-refundable. However, we may provide refunds on a case-by-case basis at our sole discretion. To request a refund, contact our support team within 14 days of your purchase by emailing <a href="mailto:joy@thedailymeds.com">joy@thedailymeds.com</a>.</p>
      </>
    ),
  },
  {
    id: "ip",
    number: "6",
    title: "Content and Intellectual Property",
    content: (
      <>
        <h3>6.1 Our Content</h3>
        <p className="mb-4">All meditation recordings, audio files, videos, text, graphics, logos, and other content provided on the Platform ("Content") are owned by or licensed to Daily Meds and are protected by copyright, trademark, and other intellectual property laws. You may not:</p>
        <ul>
          <li>Copy, modify, distribute, or reproduce our Content without permission</li>
          <li>Download or record meditation sessions for redistribution</li>
          <li>Use Content for commercial purposes</li>
          <li>Remove copyright notices or watermarks from Content</li>
          <li>Share your account credentials to allow unauthorized access to Content</li>
        </ul>
        <h3>6.2 User-Generated Content</h3>
        <p>You retain ownership of content you post in community features, but grant us a worldwide, non-exclusive, royalty-free license to use, display, and distribute such content in connection with the Service. You represent that you have all necessary rights to post your content.</p>
      </>
    ),
  },
  {
    id: "conduct",
    number: "7",
    title: "User Conduct and Community Guidelines",
    content: (
      <>
        <p className="mb-4">You agree not to use the Platform to:</p>
        <ul>
          <li>Violate any laws or regulations</li>
          <li>Post harmful, offensive, or inappropriate content</li>
          <li>Harass, bully, or threaten other users</li>
          <li>Spam or distribute unsolicited commercial messages</li>
          <li>Impersonate others or misrepresent your affiliation</li>
          <li>Attempt to hack, disrupt, or compromise the Platform's security</li>
          <li>Use automated systems or bots without authorization</li>
        </ul>
        <p className="mt-4">We reserve the right to suspend or terminate accounts that violate these guidelines.</p>
      </>
    ),
  },
  {
    id: "health",
    number: "8",
    title: "Health and Medical Disclaimer",
    highlight: true,
    content: (
      <>
        <p className="mb-4"><strong>IMPORTANT:</strong> Daily Meds provides meditation and wellness content for general informational and educational purposes only. Our content is not intended as a substitute for professional medical advice, diagnosis, or treatment.</p>
        <ul>
          <li>Always seek advice from qualified healthcare professionals for medical conditions</li>
          <li>Do not disregard or delay seeking medical advice based on information from the Platform</li>
          <li>Meditation may not be suitable for individuals with certain mental health conditions</li>
          <li>If you experience adverse effects, discontinue use and consult a healthcare provider</li>
        </ul>
        <p className="mt-4">We make no claims about specific health outcomes or benefits from using our Service unless backed up by our own scientific research with <a href="https://mulabs.tech/" target="_blank" rel="noopener noreferrer">Mu Labs</a> — our Mental Health partners.</p>
      </>
    ),
  },
  {
    id: "privacy",
    number: "9",
    title: "Privacy and Data Protection",
    content: (
      <p>Your privacy is important to us. Our <Link href="/privacy">Privacy Policy</Link> explains how we collect, use, and protect your personal information. By using the Platform, you consent to our data practices as described in the Privacy Policy.</p>
    ),
  },
  {
    id: "third-party",
    number: "10",
    title: "Third-Party Services and Links",
    content: (
      <p>The Platform may integrate with or link to third-party services (e.g., payment processors, social media). We are not responsible for the content, privacy practices, or terms of third-party services. Your use of third-party services is at your own risk.</p>
    ),
  },
  {
    id: "warranties",
    number: "11",
    title: "Disclaimer of Warranties",
    content: (
      <p className="uppercase text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
        The platform is provided "as is" and "as available" without warranties of any kind, express or implied. We disclaim all warranties including merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the service will be uninterrupted, secure, or error-free.
      </p>
    ),
  },
  {
    id: "liability",
    number: "12",
    title: "Limitation of Liability",
    content: (
      <p className="uppercase text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
        To the maximum extent permitted by law, Daily Meds and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including lost profits, data loss, or personal injury arising from your use of the platform. Our total liability shall not exceed the amount you paid to us in the 12 months preceding the claim.
      </p>
    ),
  },
  {
    id: "indemnification",
    number: "13",
    title: "Indemnification",
    content: (
      <p>You agree to indemnify and hold harmless Daily Meds, its affiliates, and their respective officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Platform, violation of these Terms, or infringement of third-party rights.</p>
    ),
  },
  {
    id: "dispute",
    number: "14",
    title: "Dispute Resolution and Governing Law",
    content: (
      <>
        <h3>14.1 Governing Law</h3>
        <p>These Terms shall be governed by and construed in accordance with the laws of the <strong>United Kingdom</strong>, without regard to conflict of law principles.</p>
        <h3>14.2 Dispute Resolution</h3>
        <p>Any disputes arising from these Terms or your use of the Platform shall be resolved through good-faith negotiation. If negotiation fails, disputes may be submitted to binding arbitration or the courts of the United Kingdom.</p>
      </>
    ),
  },
  {
    id: "modifications",
    number: "15",
    title: "Modifications to Terms",
    content: (
      <p>We reserve the right to modify these Terms at any time. We will notify you of material changes via email or through the Platform. Your continued use after modifications constitutes acceptance of the updated Terms. We recommend reviewing these Terms periodically.</p>
    ),
  },
  {
    id: "termination",
    number: "16",
    title: "Termination",
    content: (
      <p>We may suspend or terminate your access to the Platform at any time, with or without cause, including for violation of these Terms. Upon termination, your right to use the Service ceases immediately, and you must stop all use of our Content. Provisions that by their nature should survive termination shall remain in effect.</p>
    ),
  },
  {
    id: "accessibility",
    number: "17",
    title: "Accessibility",
    content: (
      <p>We strive to make our Platform accessible to all users. If you experience accessibility issues, please contact us so we can work to address them.</p>
    ),
  },
  {
    id: "severability",
    number: "18",
    title: "Severability",
    content: (
      <p>If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.</p>
    ),
  },
  {
    id: "contact",
    number: "19",
    title: "Contact Information",
    content: (
      <>
        <p className="mb-3">For questions about these Terms, please contact us:</p>
        <p><strong>Email:</strong> <a href="mailto:joy@dailymeds.com">joy@dailymeds.com</a></p>
      </>
    ),
  },
  {
    id: "entire",
    number: "20",
    title: "Entire Agreement",
    content: (
      <p>These Terms, together with our <Link href="/privacy">Privacy Policy</Link>, constitute the entire agreement between you and Daily Meds regarding the use of the Platform and supersede all prior agreements and understandings.</p>
    ),
  },
];

export default function TermsPage() {
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
            Terms & Conditions
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
            Last Updated: November 27, 2025 · Operated by I AM Sound Ltd, Trading as Daily Meds
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
                className={`p-8 rounded-2xl ${section.highlight ? "border" : ""}`}
                style={section.highlight ? {
                  backgroundColor: "rgba(255,65,179,0.05)",
                  border: "1px solid rgba(255,65,179,0.15)",
                } : {}}
              >
                <div className="flex items-start gap-4 mb-5">
                  <span
                    className="text-xs font-black px-2.5 py-1 rounded-lg shrink-0 mt-0.5"
                    style={{
                      backgroundColor: section.highlight ? "rgba(255,65,179,0.15)" : "rgba(170,238,32,0.1)",
                      color: section.highlight ? "#ff41b3" : "#aaee20",
                      fontFamily: "var(--font-lexend)",
                    }}
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

                <div
                  className="prose-section pl-10"
                  style={{ color: "rgba(255,255,255,0.65)", lineHeight: "1.8" }}
                >
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
            <Link href="/privacy" className="text-xs hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.35)" }}>
              Privacy Policy
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
        .prose-section p {
          margin-bottom: 0.75rem;
        }
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
        .prose-section a:hover {
          color: #ffffff;
        }
        .prose-section strong {
          color: #ffffff;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
