// Types and helpers for the Brand Crew feature.
// Brand Crews are verified partnerships with festivals, companies and wellness brands.

export type BrandCrew = {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  social_links: {
    instagram?: string;
    tiktok?: string;
    facebook?: string;
    twitter?: string;
  };
  invite_code: string;
  status: "pending" | "approved" | "rejected";
  is_verified: boolean;
  contact_email: string;
  brand_type: string | null;
  applied_by: string | null;
  created_at: string;
};

export type BrandCrewMember = {
  id: string;
  brand_crew_id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  joined_at: string;
};

// Brand type labels for the application form
export const BRAND_TYPES = [
  { value: "festival", label: "Festival" },
  { value: "wellness", label: "Wellness Brand" },
  { value: "company", label: "Company / Employer" },
  { value: "community", label: "Community Group" },
  { value: "other", label: "Other" },
];

// Generates a random 8-character invite code for brand crews
export function generateBrandCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// Formats a timestamp as "just now", "5m ago", "2h ago", "3d ago"
export function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
