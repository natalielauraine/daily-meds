import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8").split("\n")
    .filter(l => l && !l.startsWith("#"))
    .map(l => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const testimonials = [
  { quote: "A wonderful way to start the morning. Thank you.", name: "Vanya Morales" },
  { quote: "Thank you for one of the best morning meditations I have ever experienced. You have a gift.", name: "Jeff" },
  { quote: "This really hit home for me. I needed this today.", name: "AJG" },
  { quote: "Pure brilliant and magnificent.", name: "Gugu H." },
  { quote: "I must have been in the flow because I lost track of time. That was wonderful.", name: "Ann Elizabeth McCommas" },
  { quote: "Wow that's some truth telling I needed to hear. Thank you for this.", name: "Michelle" },
  { quote: "This was beautiful!! I love interactive meditations!", name: "Dominique Jeffries" },
  { quote: "Bookmarking! This was fantastic. Thank you.", name: "Michelle" },
  { quote: "This is my favorite morning talk. Thank you so very much.", name: "Sawondra Simpson" },
  { quote: "Insightful, inspiring, wise, loving words. Thank you.", name: "Antonio Gimeno Calvo" },
  { quote: "Beautiful. I loved this. So different to any other chakra meditation I've done — it actually made me think and reflect.", name: "Samantha Wain" },
  { quote: "Amazing way to start the day. Thank you.", name: "Dee" },
  { quote: "Good insight on letting go of relationships and focusing on yourself.", name: "Joanie" },
  { quote: "Wow thank you Natalie for allowing me to understand my own needs and how to communicate them clearly.", name: "Safa Al-Baz" },
  { quote: "One of the best morning meditations I have done. I feel revived and ready for the day ahead.", name: "Ellie Devine" },
  { quote: "Wow. This hit home a thousand-fold! What an amazing session.", name: "Lesley" },
  { quote: "Grateful for your encouraging words — they reached me in a positive and authentic way.", name: "Marie" },
  { quote: "This is profound. There is a real sacred element to silence and you articulated that beautifully.", name: "Kathy" },
  { quote: "That was the best words that could change one's mind from negative to positive.", name: "Starlight" },
  { quote: "Your soothing and well paced voice made it easy to listen to and absorb your guidance.", name: "Blu Jewel" },
];

const { data: admin } = await supabase.from("users").select("id").ilike("email", "%jason+admin%").single();
if (!admin) { console.error("No admin user found"); process.exit(1); }
console.log("Using admin user:", admin.id);

let inserted = 0;
for (const t of testimonials) {
  const initial = t.name.charAt(0).toUpperCase();
  const { error } = await supabase.from("reviews").insert({
    user_id: admin.id,
    rating: 5,
    review_text: t.quote,
    reviewer_name: t.name,
    reviewer_initials: initial,
    session_tag: null,
    status: "approved",
  });
  if (error) {
    console.log(`FAILED ${t.name}: ${error.message}`);
  } else {
    inserted++;
  }
}
console.log(`Inserted ${inserted}/${testimonials.length} testimonials`);
