// Group meditation room helpers.
// Stores active rooms in localStorage for now — will move to Supabase realtime later.
// Each room has a Daily.co room name, a timer duration, and a list of joined friends.

const STORAGE_KEY = "dailymeds_rooms";

export type MeditationRoom = {
  id: string;
  name: string;           // Display name e.g. "Sunday Reset"
  dailyRoomName: string;  // Daily.co room name used in the URL
  dailyRoomUrl: string;   // Full Daily.co URL
  duration: number;       // Timer in minutes
  gradient: string;       // Card gradient
  createdAt: string;      // ISO date string
  createdBy: string;      // Display name of creator
};

export const ROOM_DURATIONS = [5, 10, 15, 20, 30];

export const ROOM_GRADIENTS = [
  "linear-gradient(135deg, #6B21E8 0%, #8B3CF7 25%, #6366F1 60%, #3B82F6 80%, #22D3EE 100%)",
  "linear-gradient(135deg, #10B981 0%, #22C55E 35%, #84CC16 70%, #D9F100 100%)",
  "linear-gradient(135deg, #F43F5E 0%, #EC4899 20%, #D946EF 35%, #F97316 65%, #EAB308 85%, #FACC15 100%)",
  "linear-gradient(135deg, #8B3CF7 0%, #6366F1 100%)",
];

// Get all active rooms
export function getRooms(): MeditationRoom[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

// Save all rooms
function saveRooms(rooms: MeditationRoom[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
}

// Save a newly created room (called after Daily.co room is created via the API)
export function addRoom(room: MeditationRoom) {
  const all = getRooms();
  all.unshift(room); // newest first
  saveRooms(all);
}

// Remove a room (when the creator ends it)
export function removeRoom(id: string) {
  saveRooms(getRooms().filter((r) => r.id !== id));
}
