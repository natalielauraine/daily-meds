"use client";

// Global audio player state — lives in the app layout so it survives page navigation.
// Any component can read or control the player using the usePlayer() hook.
// The actual <audio> element is created here and never destroyed while the app is open.

import { createContext, useContext, useRef, useState, useEffect, ReactNode } from "react";

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
  playSession: (session: PlayerSession) => void;
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

  const [currentSession, setCurrentSession] = useState<PlayerSession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMutedState] = useState(false);
  const [speed, setSpeedState] = useState(1);

  // Create the audio element client-side (can't do this on the server)
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    // Sync state whenever audio updates
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onEnd = () => { setIsPlaying(false); setCurrentTime(0); };

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

  // Load and play a session — if same session clicked again, just toggle play/pause
  function playSession(session: PlayerSession) {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentSession?.id === session.id) {
      togglePlay();
      return;
    }

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
