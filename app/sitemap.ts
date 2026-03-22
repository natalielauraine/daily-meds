// Auto-generated sitemap — Next.js serves this at /sitemap.xml automatically.
// Lists all public pages so search engines can find and index them.

import { MetadataRoute } from "next";
import { MOCK_SESSIONS } from "../lib/sessions-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thedailymeds.com";
  const now = new Date();

  // Static public pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl,                        lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${baseUrl}/pricing`,           lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/live`,              lastModified: now, changeFrequency: "daily",   priority: 0.8 },
    { url: `${baseUrl}/affiliate`,         lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/about`,             lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/signup`,            lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/login`,             lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/testimonials`,      lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
  ];

  // Session pages — one URL per session
  const sessionPages: MetadataRoute.Sitemap = MOCK_SESSIONS.map((session) => ({
    url: `${baseUrl}/session/${session.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...sessionPages];
}
