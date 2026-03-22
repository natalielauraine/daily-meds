// Shared Resend client — import this wherever you need to send email.
// Resend is used for all transactional emails in Daily Meds.
// Subscriptions/payments use Stripe; this is purely for email delivery.

import { Resend } from "resend";

// Single shared instance — avoids creating a new client on every request
export const resend = new Resend(process.env.RESEND_API_KEY);

// The "from" address shown in the user's inbox
// Must be a domain you've verified in the Resend dashboard
export const FROM_EMAIL = process.env.NEXT_PUBLIC_FROM_EMAIL || "hello@thedailymeds.com";

// Natalie's name — shown as the sender name alongside the from address
export const FROM_NAME = "Natalie at Daily Meds";
