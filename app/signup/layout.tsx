// Server component — exports metadata for the signup page.
// noindex: true keeps auth pages out of Google search results.
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your Daily Meds account and start meditating.",
  robots: { index: false, follow: false },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
