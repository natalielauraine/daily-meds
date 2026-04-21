"use client";

// Global presence system for Daily Meds.
// Tracks which users are currently meditating using Supabase Realtime presence.
// Also handles incoming emoji reactions — other users can send encouraging emojis
// while you're meditating, and they appear as floating animations on your screen.
//
// Only users who have opted in (show_presence = true in community_settings)
// are visible to others. Privacy first.

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { createClient } from "./supabase-browser";
import type { User } from "@supabase/supabase-js";
import type { RealtimeChannel } from "@supabase/supabase-js";

// Shape of a user who is currently meditating
export interface OnlineUser {
  user_id: string;
  display_name: string;
  avatar_initial: string;
  avatar_url: string | null;
  started_at: string;
}

// An incoming emoji reaction (triggers the floating animation)
export interface IncomingEmoji {
  id: string;
  emoji: string;
  from_name: string;
}

interface PresenceContextValue {
  onlineUsers: OnlineUser[];           // other users currently meditating
  isTracking: boolean;                 // is the current user being tracked right now
  canTrack: boolean;                   // has the user opted in to presence visibility
  trackMeditating: () => Promise<void>; // call this when a session starts
  untrackMeditating: () => Promise<void>; // call this when a session ends
  sendEmoji: (toUserId: string, emoji: string) => Promise<void>; // send a reaction
  unseenCount: number;                 // number of unseen emoji reactions (for navbar badge)
  markAllSeen: () => Promise<void>;    // mark all reactions as seen
  incomingEmoji: IncomingEmoji | null; // the latest incoming emoji (cleared after display)
  clearIncomingEmoji: () => void;
}

const PresenceContext = createContext<PresenceContextValue>({
  onlineUsers: [],
  isTracking: false,
  canTrack: false,
  trackMeditating: async () => {},
  untrackMeditating: async () => {},
  sendEmoji: async () => {},
  unseenCount: 0,
  markAllSeen: async () => {},
  incomingEmoji: null,
  clearIncomingEmoji: () => {},
});

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [canTrack, setCanTrack] = useState(false);       // opted-in to presence
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [unseenCount, setUnseenCount] = useState(0);
  const [incomingEmoji, setIncomingEmoji] = useState<IncomingEmoji | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // On mount: load user, their presence preference, and their unseen emoji count
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setUser(data.user);

      // Check if user has opted in to presence (show_in_feed column)
      try {
        const { data: cs } = await supabase
          .from("community_settings")
          .select("show_in_feed")
          .eq("user_id", data.user.id)
          .maybeSingle();
        setCanTrack(cs?.show_in_feed ?? false);
      } catch {
        // Table or column doesn't exist yet
      }

      // Count unseen emoji reactions sent to this user
      try {
        const { count } = await supabase
          .from("emoji_reactions")
          .select("*", { count: "exact", head: true })
          .eq("to_user_id", data.user.id)
          .eq("seen", false);
        setUnseenCount(count ?? 0);
      } catch {
        // Table doesn't exist yet
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null);
        setUnseenCount(0);
        setIsTracking(false);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Subscribe to the shared presence channel to see who is meditating
  useEffect(() => {
    const channel = supabase.channel("meditation-presence", {
      config: { presence: { key: user?.id || "anon" } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        // Build a flat list of all online users from the presence state
        const state = channel.presenceState<OnlineUser>();
        const users: OnlineUser[] = [];
        Object.values(state).forEach((presences) => {
          presences.forEach((p) => users.push(p as OnlineUser));
        });
        // Never show the current user in their own list
        setOnlineUsers(users.filter((u) => u.user_id !== user?.id));
      })
      .subscribe();

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  // Subscribe to incoming emoji reactions via postgres_changes
  useEffect(() => {
    if (!user) return;

    const reactionChannel = supabase
      .channel(`emoji-reactions-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "emoji_reactions",
          filter: `to_user_id=eq.${user.id}`,
        },
        async (payload) => {
          const row = payload.new as { id: string; emoji: string; from_user_id: string };

          // Try to get the sender's display name
          const { data: sender } = await supabase
            .from("users")
            .select("name")
            .eq("id", row.from_user_id)
            .maybeSingle();

          setIncomingEmoji({
            id: row.id,
            emoji: row.emoji,
            from_name: sender?.name || "Someone",
          });
          setUnseenCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(reactionChannel); };
  }, [user?.id]);

  // Start tracking the current user as meditating in the presence channel.
  // Only works if the user has opted in (canTrack = true).
  const trackMeditating = useCallback(async () => {
    if (!user || !canTrack || !channelRef.current) return;

    const displayName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Anonymous";

    await channelRef.current.track({
      user_id: user.id,
      display_name: displayName,
      avatar_initial: displayName[0]?.toUpperCase() || "U",
      avatar_url: user.user_metadata?.avatar_url || null,
      started_at: new Date().toISOString(),
    });
    setIsTracking(true);
  }, [user, canTrack]);

  // Remove the current user from the presence channel
  const untrackMeditating = useCallback(async () => {
    if (!channelRef.current) return;
    await channelRef.current.untrack();
    setIsTracking(false);
  }, []);

  // Insert an emoji reaction row — the recipient's subscription will pick it up
  const sendEmoji = useCallback(async (toUserId: string, emoji: string) => {
    if (!user) return;
    await supabase.from("emoji_reactions").insert({
      from_user_id: user.id,
      to_user_id: toUserId,
      emoji,
      seen: false,
    });
  }, [user]);

  // Mark all unseen reactions as seen (call when user opens their notifications)
  const markAllSeen = useCallback(async () => {
    if (!user) return;
    await supabase
      .from("emoji_reactions")
      .update({ seen: true })
      .eq("to_user_id", user.id)
      .eq("seen", false);
    setUnseenCount(0);
  }, [user]);

  const clearIncomingEmoji = useCallback(() => {
    setIncomingEmoji(null);
  }, []);

  return (
    <PresenceContext.Provider
      value={{
        onlineUsers,
        isTracking,
        canTrack,
        trackMeditating,
        untrackMeditating,
        sendEmoji,
        unseenCount,
        markAllSeen,
        incomingEmoji,
        clearIncomingEmoji,
      }}
    >
      {children}
    </PresenceContext.Provider>
  );
}

// Hook — use this anywhere in the app to access presence state
export function usePresence() {
  return useContext(PresenceContext);
}
