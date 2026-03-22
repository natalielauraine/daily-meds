"use client";

// Group meditation rooms page.
// Users can create a room (picks a name, duration, gradient) or join an existing one.
// Each room creates a Daily.co session so everyone shares audio/video.
// The shared timer starts when you enter the room.

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  getRooms,
  addRoom,
  removeRoom,
  ROOM_DURATIONS,
  ROOM_GRADIENTS,
  type MeditationRoom,
} from "../../lib/rooms";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<MeditationRoom[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // New room form state
  const [form, setForm] = useState({
    name: "",
    createdBy: "",
    duration: 10,
    gradient: ROOM_GRADIENTS[0],
  });

  useEffect(() => {
    setRooms(getRooms());
  }, []);

  function refresh() {
    setRooms(getRooms());
  }

  // Create a Daily.co room then save it locally
  async function handleCreate() {
    if (!form.name.trim() || !form.createdBy.trim()) {
      setError("Room name and your name are required.");
      return;
    }
    setError("");
    setCreating(true);

    try {
      const res = await fetch("/api/daily/create-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.name }),
      });
      const data = await res.json();

      if (!res.ok) {
        const msg = typeof data.error === "string" ? data.error : JSON.stringify(data.error);
        setError(msg ?? "Could not create room.");
        return;
      }

      const room: MeditationRoom = {
        id: Date.now().toString(),
        name: form.name.trim(),
        dailyRoomName: data.name,
        dailyRoomUrl: data.url,
        duration: form.duration,
        gradient: form.gradient,
        createdAt: new Date().toISOString(),
        createdBy: form.createdBy.trim(),
      };

      addRoom(room);
      setShowForm(false);
      setForm({ name: "", createdBy: "", duration: 10, gradient: ROOM_GRADIENTS[0] });
      refresh();
    } catch {
      setError("Network error — could not create room.");
    } finally {
      setCreating(false);
    }
  }

  function handleDelete(id: string) {
    removeRoom(id);
    refresh();
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#0D0D1A" }}>
      <Navbar />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-10 pb-24">

        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors mb-8">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Back
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl text-white" style={{ fontWeight: 500 }}>Meditation Rooms</h1>
            <p className="text-sm text-white/40 mt-1">Meditate together with friends in real time</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white transition-opacity hover:opacity-80 shrink-0"
            style={{ backgroundColor: "#8B5CF6", fontWeight: 500 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            New Room
          </button>
        </div>

        {/* How it works pill */}
        <p className="text-xs text-white/25 mb-8">
          Create a room, share the link with friends, and meditate together with a shared countdown timer.
        </p>

        {/* Error */}
        {error && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-[10px] mb-5"
            style={{ backgroundColor: "rgba(244,63,94,0.1)", border: "0.5px solid rgba(244,63,94,0.3)" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#F43F5E" className="shrink-0">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* ── CREATE ROOM FORM ──────────────────────────────────── */}
        {showForm && (
          <div
            className="p-5 rounded-[10px] mb-6"
            style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.1)" }}
          >
            <h2 className="text-white text-base mb-5" style={{ fontWeight: 500 }}>Create a room</h2>

            <div className="flex flex-col gap-4">
              {/* Room name */}
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Room name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Sunday Reset with the girls"
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none placeholder:text-white/20"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.12)" }}
                />
              </div>

              {/* Your name */}
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Your name</label>
                <input
                  type="text"
                  value={form.createdBy}
                  onChange={(e) => setForm({ ...form, createdBy: e.target.value })}
                  placeholder="e.g. Natalie"
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none placeholder:text-white/20"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.12)" }}
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-xs text-white/40 mb-2">Session length</label>
                <div className="flex gap-2 flex-wrap">
                  {ROOM_DURATIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setForm({ ...form, duration: d })}
                      className="px-4 py-2 rounded-full text-sm transition-colors"
                      style={{
                        backgroundColor: form.duration === d ? "#8B5CF6" : "rgba(255,255,255,0.06)",
                        color: form.duration === d ? "white" : "rgba(255,255,255,0.45)",
                        border: form.duration === d ? "none" : "0.5px solid rgba(255,255,255,0.1)",
                        fontWeight: form.duration === d ? 500 : 400,
                      }}
                    >
                      {d} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Gradient */}
              <div>
                <label className="block text-xs text-white/40 mb-2">Colour</label>
                <div className="flex gap-2">
                  {ROOM_GRADIENTS.map((g) => (
                    <button
                      key={g}
                      onClick={() => setForm({ ...form, gradient: g })}
                      className="w-10 h-10 rounded-full transition-transform hover:scale-110"
                      style={{
                        background: g,
                        outline: form.gradient === g ? "2.5px solid white" : "none",
                        outlineOffset: "2px",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={handleCreate}
                disabled={creating}
                className="flex-1 py-2.5 rounded-lg text-sm text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ backgroundColor: "#8B5CF6", fontWeight: 500 }}
              >
                {creating ? "Creating room…" : "Create Room"}
              </button>
              <button
                onClick={() => { setShowForm(false); setError(""); }}
                className="px-4 py-2.5 rounded-lg text-sm text-white/40 hover:text-white/70 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── ROOMS LIST ────────────────────────────────────────── */}
        {rooms.length === 0 && !showForm ? (
          <div
            className="flex flex-col items-center justify-center py-16 rounded-[10px] text-center"
            style={{ border: "0.5px dashed rgba(255,255,255,0.1)" }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
              style={{ background: "linear-gradient(135deg, #6B21E8, #22D3EE)" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white" opacity={0.9}>
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
            </div>
            <p className="text-sm text-white/30 mb-1">No rooms open right now</p>
            <p className="text-xs text-white/20">Create one and invite your friends</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} onDelete={() => handleDelete(room.id)} />
            ))}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}

// ── ROOM CARD ─────────────────────────────────────────────────────────────────

function RoomCard({ room, onDelete }: { room: MeditationRoom; onDelete: () => void }) {
  return (
    <div
      className="rounded-[10px] overflow-hidden"
      style={{ backgroundColor: "#1A1A2E", border: "0.5px solid rgba(255,255,255,0.08)" }}
    >
      {/* Gradient top stripe */}
      <div className="h-1 w-full" style={{ background: room.gradient }} />

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center"
            style={{ background: room.gradient }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" opacity={0.9}>
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-white text-base truncate" style={{ fontWeight: 500 }}>{room.name}</p>
            <p className="text-xs text-white/35 mt-0.5">
              {room.duration} min · Started by {room.createdBy}
            </p>
          </div>

          {/* Delete */}
          <button
            onClick={onDelete}
            className="text-white/20 hover:text-red-400 transition-colors p-1 shrink-0"
            aria-label="Close room"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
        </div>

        {/* Join button */}
        <Link
          href={`/rooms/${room.dailyRoomName}?duration=${room.duration}&name=${encodeURIComponent(room.name)}&gradient=${encodeURIComponent(room.gradient)}`}
          className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-[10px] text-sm text-white transition-opacity hover:opacity-80"
          style={{ background: room.gradient, fontWeight: 500 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
          </svg>
          Join Room
        </Link>
      </div>
    </div>
  );
}
