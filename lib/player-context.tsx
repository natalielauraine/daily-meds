"use client";

// Global audio player state — lives in the app layout so it survives page navigation.
// Any component can read or control the player using the usePlayer() hook.
// The actual <audio> element is created here and never destroyed while the app is open.
// Saves playback position to Supabase every 10 seconds for the Continue Watching feature.

import { createContext, useContext, useRef, useState, useEffect, ReactNode } from "react";
import { createClient } from "./supabase-browser";

// The shape of a session loaded into the player
export type PlayerSession = {
  id: string;
  title: string;
  moodCategory: string;
  gradient: string;
  audioUrl: string;       // Empty string = no audio file yet (UI still works)
  duration: string;       // Display string e.g. "18 min"
};

// Everything the player exposes to the rest of the app
type PlayerContextType = {
  currentSession: PlayerSession | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  speed: number;
  // Actions
  playSession: (session: PlayerSession, startAt?: number) => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  skipBack: () => void;
  skipForward: () => void;
  setVolume: (vol: number) => void;
  setIsMuted: (muted: boolean) => void;
  setSpeed: (speed: number) => void;
  closePlayer: () => void;
};

const PlayerContext = createContext<PlayerContextType | null>(null);

// usePlayer — call this inside any component to access the player
export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
}

// PlayerProvider — wrap the app in this (done in layout.tsx)
export function PlayerProvider({ children }: { children: ReactNode }) {
  // The real audio element — created once on the client, never destroyed
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Refs to avoid stale closures in event handlers and intervals
  const currentSessionRef = useRef<PlayerSession | null>(null);
  const userIdRef = useRef<string | null>(null);

  // When the audio loads, seek to this position (used for resume from Continue Watching)
  const pendingSeekRef = useRef<number>(0);

  const [currentSession, setCurrentSession] = useState<PlayerSession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMutedState] = useState(false);
  const [speed, setSpeedState] = useState(1);

  // Keep the ref in sync with state so event handlers always have the latest session
  useEffect(() => {
    currentSessionRef.current = currentSession;
  }, [currentSession]);

  // Fetch the logged-in user's ID once on mount so we can save progress to Supabase
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      userIdRef.current = data.user?.id ?? null;
    });
  }, []);

  // Save progress to Supabase every 10 seconds while audio is playing
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(async () => {
      const audio = audioRef.current;
      const session = currentSessionRef.current;
      const userId = userIdRef.current;
      if (!audio || !session || !userId || !audio.duration) return;

      const supabase = createClient();
      await supabase.from("user_progress").upsert(
        {
          user_id: userId,
          session_id: session.id,
          position_seconds: Math.floor(audio.currentTime),
          duration_seconds: Math.floor(audio.duration),
          completed: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,session_id" }
      );
    }, 10000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Create the audio element client-side (can't do this on the server)
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    // Sync current time to state on every tick
    const onTime = () => setCurrentTime(audio.currentTime);

    // When metadata loads (duration is known), seek to any pending resume position
    const onMeta = () => {
      setDuration(audio.duration);
      if (pendingSeekRef.current > 0) {
        audio.currentTime = pendingSeekRef.current;
        setCurrentTime(pendingSeekRef.current);
        pendingSeekRef.current = 0;
      }
    };

    // When audio finishes, mark the session as completed in Supabase
    const onEnd = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      const session = currentSessionRef.current;
      const userId = userIdRef.current;
      if (userId && session) {
        const supabase = createClient();

        // Mark progress as completed (powers Continue Watching)
        supabase.from("user_progress").upsert(
          {
            user_id: userId,
            session_id: session.id,
            position_seconds: 0,
            duration_seconds: Math.floor(audio.duration) || 0,
            completed: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,session_id" }
        );

        // Record the completed session (powers monthly recap stats)
        supabase.from("user_sessions").insert({
          user_id:          userId,
          session_id:       session.id,
          duration_minutes: Math.round((audio.duration || 0) / 60),
          completed_at:     new Date().toISOString(),
        });
      }
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
      audio.pause();
    };
  }, []);

  // Load and play a session.
  // startAt: optional position in seconds to resume from (used by Continue Watching)
  function playSession(session: PlayerSession, startAt?: number) {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentSession?.id === session.id) {
      togglePlay();
      return;
    }

    // Store the resume position — we seek to it once loadedmetadata fires
    pendingSeekRef.current = startAt || 0;

    // New session — load and play
    audio.src = session.audioUrl || "";
    audio.playbackRate = speed;
    audio.volume = isMuted ? 0 : volume;

    if (session.audioUrl) {
      audio.play().catch(() => {
        // Browser may block autoplay — user will need to tap play manually
      });
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }

    setCurrentSession(session);
    setCurrentTime(0);
    setDuration(0);
  }

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio || !currentSession) return;

    if (isPlaying) {
      audio.pause();
    } else {
      if (audio.src) audio.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  }

  function seek(time: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }

  function skipBack() { seek(Math.max(0, currentTime - 15)); }
  function skipForward() { seek(Math.min(duration, currentTime + 15)); }

  function setVolume(vol: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = vol;
    setVolumeState(vol);
    if (vol > 0) setIsMutedState(false);
  }

  function setIsMuted(muted: boolean) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = muted ? 0 : volume;
    setIsMutedState(muted);
  }

  function setSpeed(s: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = s;
    setSpeedState(s);
  }

  function closePlayer() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.src = "";
    setCurrentSession(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }

  return (
    <PlayerContext.Provider value={{
      currentSession, isPlaying, currentTime, duration, volume, isMuted, speed,
      playSession, togglePlay, seek, skipBack, skipForward,
      setVolume, setIsMuted, setSpeed, closePlayer,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}
