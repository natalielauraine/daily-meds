"use client";

// ReferralTracker — invisible component that runs on the homepage.
// If the URL has a ?ref=CODE parameter, it fires a click to the tracking API
// and saves the code to localStorage so we can attribute signups later.
// Renders nothing visible — just handles the tracking logic silently.

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function ReferralTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams?.get("ref");
    if (!ref) return;

    // Save the referral code to localStorage so it persists through the signup flow
    localStorage.setItem("referral_code", ref);

    // Tell the server to increment the click count for this affiliate
    fetch("/api/affiliate/track-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referralCode: ref }),
    }).catch(() => {
      // Silently ignore errors — tracking failure should never break the page
    });
  }, [searchParams]);

  // This component renders nothing
  return null;
}
