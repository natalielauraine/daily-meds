// Shared session data — used by the session page (client) and the session layout (server).
// Replace these mock sessions with real Supabase queries once content is uploaded.

export type SessionMediaType = "audio" | "video";

export interface SessionData {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: string;
  moodCategory: string;
  gradient: string;
  glowColor: string;
  isFree: boolean;
  mediaType: SessionMediaType;
  audioUrl: string;
  vimeoId: string;
}

export const MOCK_SESSIONS: SessionData[] = [
  {
    id: "1",
    title: "Hungover & Overwhelmed",
    description: "A gentle reset for when your body and mind are paying the price. No spiritual waffle — just calm. This session guides you through slow breathing and a body scan to ease that tight, anxious morning-after feeling.",
    duration: "18 min",
    type: "Guided Meditation",
    moodCategory: "Hungover",
    gradient: "linear-gradient(135deg, #6B21E8 0%, #8B3CF7 25%, #6366F1 60%, #3B82F6 80%, #22D3EE 100%)",
    glowColor: "#6B21E8",
    isFree: true,
    mediaType: "audio",
    audioUrl: "",
    vimeoId: "",
  },
  {
    id: "2",
    title: "Come Down Slowly",
    description: "When the night is over but your nervous system hasn't got the memo. This session uses grounding techniques to bring you back to earth gently — no rush, no pressure.",
    duration: "22 min",
    type: "Breathwork",
    moodCategory: "On A Comedown",
    gradient: "linear-gradient(135deg, #10B981 0%, #22C55E 35%, #84CC16 70%, #D9F100 100%)",
    glowColor: "#10B981",
    isFree: false,
    mediaType: "audio",
    audioUrl: "",
    vimeoId: "",
  },
  {
    id: "3",
    title: "3am Brain",
    description: "Your mind is racing and sleep feels impossible. This session quiets the mental noise with slow breathing and a progressive body relaxation that actually works.",
    duration: "14 min",
    type: "Sleep Audio",
    moodCategory: "Can't Sleep",
    gradient: "linear-gradient(135deg, #8B3CF7 0%, #6366F1 100%)",
    glowColor: "#8B3CF7",
    isFree: true,
    mediaType: "audio",
    audioUrl: "",
    vimeoId: "",
  },
  {
    id: "4",
    title: "Anxiety First Aid",
    description: "For when anxiety hits out of nowhere and you need something that actually helps right now. Box breathing plus a quick grounding exercise to bring you back into your body.",
    duration: "8 min",
    type: "Breathwork",
    moodCategory: "Anxious",
    gradient: "linear-gradient(135deg, #F43F5E 0%, #F97316 100%)",
    glowColor: "#F43F5E",
    isFree: true,
    mediaType: "audio",
    audioUrl: "",
    vimeoId: "",
  },
  {
    id: "5",
    title: "The Morning After",
    description: "You went hard last night. That's fine. This is your gentle re-entry into the world. Start slow, breathe through it, feel human again.",
    duration: "12 min",
    type: "Guided Meditation",
    moodCategory: "After The Sesh",
    gradient: "linear-gradient(135deg, #F43F5E 0%, #EC4899 20%, #D946EF 35%, #F97316 65%, #EAB308 85%, #FACC15 100%)",
    glowColor: "#F43F5E",
    isFree: false,
    mediaType: "audio",
    audioUrl: "",
    vimeoId: "",
  },
];
