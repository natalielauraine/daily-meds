import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8").split("\n")
    .filter(l => l && !l.startsWith("#"))
    .map(l => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; })
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

// 1. Find Jason's test user
const { data: users, error: userErr } = await supabase
  .from("users")
  .select("id, email, subscription_status")
  .ilike("email", "%jason%")
  .limit(5);

if (userErr) { console.error("User lookup failed:", userErr.message); process.exit(1); }
console.log("Users found:", users?.map(u => `${u.email} (${u.subscription_status})`));

if (!users?.length) { console.error("No jason user found"); process.exit(1); }
const userId = users[0].id;
console.log(`\nUsing user: ${users[0].email} (${userId})`);

// 2. Find a real session
const { data: sessions, error: sessErr } = await supabase
  .from("sessions")
  .select("id, title, mood_category, duration")
  .eq("status", "published")
  .limit(3);

if (sessErr) { console.error("Session lookup failed:", sessErr.message); process.exit(1); }
console.log("\nSessions found:", sessions?.map(s => `${s.title} [${s.mood_category}] (${s.id})`));

if (!sessions?.length) { console.error("No published sessions found"); process.exit(1); }
const session = sessions[0];
console.log(`\nUsing session: ${session.title} (${session.id})`);

// 3. Insert a test completed row
const { data: inserted, error: insertErr } = await supabase
  .from("user_progress")
  .upsert(
    {
      user_id: userId,
      session_id: session.id,
      position_seconds: 0,
      duration_seconds: session.duration || 300,
      completed: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,session_id" }
  )
  .select();

if (insertErr) {
  console.error("\nINSERT FAILED:", insertErr.message);
  console.error("Code:", insertErr.code);
  console.error("Details:", insertErr.details);
} else {
  console.log("\nINSERT SUCCESS:", inserted);
}

// 3b. Check for existing duplicates that would block constraint creation
const { data: dupes, error: dupeErr } = await supabase.rpc("exec_sql", {
  sql: `SELECT user_id, session_id, count(*) FROM user_progress GROUP BY user_id, session_id HAVING count(*) > 1 LIMIT 5`
}).maybeSingle();
if (dupeErr) {
  console.log("\nCouldn't check dupes via RPC (expected if exec_sql doesn't exist):", dupeErr.message);
} else {
  console.log("\nDuplicate check:", dupes);
}

// 3c. Check if constraint exists
const { data: constraints, error: conErr } = await supabase.rpc("exec_sql", {
  sql: `SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'user_progress' AND constraint_type = 'UNIQUE'`
}).maybeSingle();
if (conErr) {
  console.log("Constraint check via RPC failed (expected):", conErr.message);
} else {
  console.log("Existing unique constraints:", constraints);
}

// 3d. Try plain INSERT instead of upsert
const { error: plainErr } = await supabase
  .from("user_progress")
  .insert({
    user_id: userId,
    session_id: session.id,
    position_seconds: 0,
    duration_seconds: session.duration || 300,
    completed: true,
    updated_at: new Date().toISOString(),
  });
if (plainErr) {
  console.log("\nPlain INSERT failed:", plainErr.message);
} else {
  console.log("\nPlain INSERT succeeded!");
}

// 4. Read back to verify
const { data: readBack, error: readErr } = await supabase
  .from("user_progress")
  .select("*")
  .eq("user_id", userId)
  .limit(5);

if (readErr) {
  console.error("\nREAD FAILED:", readErr.message);
} else {
  console.log(`\nAll user_progress rows for this user (${readBack?.length}):`);
  readBack?.forEach(r => console.log(`  session=${r.session_id} completed=${r.completed} updated=${r.updated_at}`));
}
