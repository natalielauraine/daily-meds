"use client";

// WhoIsOnline — shows avatars of users currently meditating.
// Tap any avatar to open an emoji picker and send them an encouraging reaction.
// Only users who have opted in appear here (controlled via /profile settings).
// Updates in real time via Supabase presence channels.

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePresence } from "../../lib/presence-context";

// The six emojis users can send to someone who is meditating
const SEND_EMOJIS = ["🔥", "💜", "🙏", "⭐", "💪", "🧘"];

export default function WhoIsOnline() {
  const { onlineUsers, sendEmoji } = usePresence();

  // Which user's emoji picker is currently open (null = none)
  const [pickerForUser, setPickerForUser] = useState<string | null>(null);

  // Tracks which users have already been sent an emoji this session
  // Maps user_id → the emoji that was sent, so we can show it as confirmation
  const [sent, setSent] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  // Send an emoji to a user and close the picker
  async function handleSendEmoji(toUserId: string, emoji: string) {
    if (sending) return;
    setSending(true);
    await sendEmoji(toUserId, emoji);

    // Show the sent emoji as the avatar label briefly
    setSent((prev) => ({ ...prev, [toUserId]: emoji }));
    setPickerForUser(null);
    setSending(false);

    // Clear the confirmation after 2 seconds
    setTimeout(() => {
      setSent((prev) => {
        const next = { ...prev };
        delete next[toUserId];
        return next;
      });
    }, 2000);
  }

  // Empty state — nobody meditating right now
  if (onlineUsers.length === 0) {
    return (
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-[10px]"
        style={{ backgroundColor: "#1F1F1F", border: "0.5px solid rgba(255,255,255,0.08)" }}
      >
        <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
        <p className="text-xs text-white/40">
          No one meditating right now —{" "}
          <Link href="/library" className="text-white/60 hover:text-white transition-colors">
            start a session
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-[10px] p-4"
      style={{ backgroundColor: "#1F1F1F", border: "0.5px solid rgba(255,255,255,0.08)" }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
          <p className="text-xs text-white/60">
            <span className="text-white" style={{ fontWeight: 500 }}>
              {onlineUsers.length}
            </span>{" "}
            {onlineUsers.length === 1 ? "person" : "people"} meditating right now
          </p>
        </div>
        <p className="text-[10px] text-white/25">Tap to send a reaction</p>
      </div>

      {/* Avatar row — each one opens an emoji picker on tap */}
      <div className="flex flex-wrap gap-3">
        {onlineUsers.map((u) => (
          <div key={u.user_id} className="relative">
            {/* Avatar button */}
            <button
              onClick={() =>
                setPickerForUser(pickerForUser === u.user_id ? null : u.user_id)
              }
              className="flex flex-col items-center gap-1 group"
              aria-label={`Send ${u.display_name} an emoji`}
            >
              {/* Circle avatar */}
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-sm text-white relative shrink-0"
                style={{ background: "linear-gradient(135deg, #ff41b3, #adf225)", fontWeight: 500 }}
              >
                {u.avatar_url ? (
                  <Image
                    src={u.avatar_url}
                    alt={u.display_name}
                    width={40}
                    height={40}
                    className="w-full h-full rounded-full object-cover"
                    unoptimized
                  />
                ) : (
                  u.avatar_initial
                )}

                {/* Green online dot */}
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2"
                  style={{ borderColor: "#1F1F1F" }}
                />
              </div>

              {/* Name or sent emoji */}
              <p className="text-[10px] max-w-[52px] truncate" style={{
                color: sent[u.user_id] ? "#4ADE80" : "rgba(255,255,255,0.35)"
              }}>
                {sent[u.user_id] ? sent[u.user_id] : u.display_name.split(" ")[0]}
              </p>
            </button>

            {/* Emoji picker popover — appears above the avatar */}
            {pickerForUser === u.user_id && (
              <div
                className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-2 rounded-xl z-20 shadow-lg"
                style={{
                  backgroundColor: "#131313",
                  border: "0.5px solid rgba(255,255,255,0.18)",
                }}
              >
                {SEND_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleSendEmoji(u.user_id, emoji)}
                    disabled={sending}
                    className="text-xl hover:scale-125 active:scale-110 transition-transform disabled:opacity-50 leading-none px-0.5"
                    aria-label={`Send ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
                {/* Small caret */}
                <span
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
                  style={{ backgroundColor: "#131313", border: "0.5px solid rgba(255,255,255,0.18)" }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
