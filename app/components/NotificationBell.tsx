"use client";

// NotificationBell — shows a bell icon in the navbar with an unread count badge.
// Clicking opens a dropdown of recent notifications.
// Uses Supabase Realtime so new notifications appear instantly without refresh.
// Marks all notifications as read when the dropdown is opened.

import { useState, useEffect, useRef } from "react";
import { createClient } from "../../lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

type Notification = {
  id: string;
  from_display_name: string | null;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
};

// Format a timestamp as "just now", "5m ago", "2h ago", etc.
function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60)    return "just now";
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function NotificationBell({ user }: { user: User }) {
  const supabase = createClient();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  // Count how many are unread for the badge
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Load notifications on mount and subscribe to new ones via Realtime
  useEffect(() => {
    loadNotifications();

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          // Prepend the new notification to the top of the list
          setNotifications((prev) => [payload.new as Notification, ...prev].slice(0, 20));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user.id]);

  // Fetch the 20 most recent notifications for this user
  async function loadNotifications() {
    const { data } = await supabase
      .from("notifications")
      .select("id, from_display_name, type, message, read, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setNotifications(data);
  }

  // Mark all unread notifications as read in Supabase and update local state
  async function markAllRead() {
    if (unreadCount === 0) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  // Close dropdown when clicking outside, and mark as read when opening
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      markAllRead();
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-white/[0.05]"
        aria-label="Notifications"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255,255,255,0.55)">
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5S10.5 3.17 10.5 4v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
        </svg>
        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white"
            style={{ backgroundColor: "#EC4899", fontWeight: 500 }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-11 w-80 rounded-[10px] z-50 overflow-hidden"
          style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.12)" }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}
          >
            <p className="text-xs text-white" style={{ fontWeight: 500 }}>Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[10px] text-white/30 hover:text-white/60 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="text-2xl mb-2">🔔</p>
                <p className="text-xs text-white/25">No notifications yet</p>
                <p className="text-[11px] text-white/15 mt-1">
                  You&apos;ll see reactions to your posts here
                </p>
              </div>
            ) : (
              notifications.map((n, i) => (
                <div
                  key={n.id}
                  className="px-4 py-3 flex items-start gap-3"
                  style={{
                    borderTop: i > 0 ? "0.5px solid rgba(255,255,255,0.04)" : "none",
                    backgroundColor: n.read ? "transparent" : "rgba(139,92,246,0.05)",
                    borderLeft: n.read ? "2px solid transparent" : "2px solid rgba(139,92,246,0.5)",
                  }}
                >
                  {/* Avatar initial */}
                  <div
                    className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs text-white mt-0.5"
                    style={{ background: "linear-gradient(135deg, #8B5CF6, #6366F1)", fontWeight: 500 }}
                  >
                    {n.from_display_name?.[0]?.toUpperCase() ?? "?"}
                  </div>

                  {/* Message + time */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/70 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">{timeAgo(n.created_at)}</p>
                  </div>

                  {/* Unread dot */}
                  {!n.read && (
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
