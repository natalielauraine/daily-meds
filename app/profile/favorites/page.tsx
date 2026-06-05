"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../lib/supabase-browser";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { LibraryCard, type LibrarySession } from "../../components/LibraryCard";
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";
import EmptyState from "../../components/ui/EmptyState";

export default function FavoritesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<LibrarySession[]>([]);
  const [isPaidMember, setIsPaidMember] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const [{ data: downloads }, { data: profile }] = await Promise.all([
        supabase
          .from("downloads")
          .select("session_id, sessions(id, title, description, duration, type, mood_category, media_type, is_free, is_coming_soon, gradient, thumbnail)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("users")
          .select("subscription_status")
          .eq("id", user.id)
          .single(),
      ]);

      if (profile?.subscription_status && profile.subscription_status !== "free") {
        setIsPaidMember(true);
      }

      if (downloads) {
        const sessions = downloads
          .map((d: any) => d.sessions)
          .filter(Boolean) as LibrarySession[];
        setFavorites(sessions);
      }

      setLoading(false);
    }
    load();
  }, []);

  async function removeFavorite(sessionId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("downloads").delete().eq("user_id", user.id).eq("session_id", sessionId);
    setFavorites((prev) => prev.filter((s) => s.id !== sessionId));
  }

  return (
    <>
      <Navbar />
      <main
        className="min-h-screen pt-24 pb-32 px-6"
        style={{ backgroundColor: "#131313" }}
      >
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link
                href="/profile"
                className="text-xs uppercase tracking-widest mb-2 inline-flex items-center gap-1.5 transition-colors hover:text-white"
                style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-space-grotesk)", fontWeight: 700 }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                </svg>
                Profile
              </Link>
              <h1
                className="text-3xl md:text-4xl uppercase tracking-tight"
                style={{ fontFamily: "var(--font-plus-jakarta)", fontWeight: 800, color: "#e2e2e2" }}
              >
                Favorite Rituals
              </h1>
              <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                {favorites.length} {favorites.length === 1 ? "session" : "sessions"} saved
              </p>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <LoadingSkeleton height={200} count={4} className="mb-4" />
          ) : favorites.length === 0 ? (
            <EmptyState
              message="No favorites yet — tap the heart icon on any session to save it here"
              action="Browse library"
              onClick={() => router.push("/library")}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {favorites.map((session) => (
                <div key={session.id} className="relative group/fav">
                  <LibraryCard session={session} isPaidMember={isPaidMember} />
                  {/* Remove button */}
                  <button
                    onClick={() => removeFavorite(session.id)}
                    className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover/fav:opacity-100 transition-opacity"
                    style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
                    title="Remove from favorites"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#ff5555">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
