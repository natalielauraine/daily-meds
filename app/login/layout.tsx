// Server component — exports metadata for the login page.
// noindex: true keeps auth pages out of Google search results.
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your Daily Meds account.",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
