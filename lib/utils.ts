// cn — merges Tailwind class names safely, resolving conflicts.
// Used by shadcn UI components throughout the app.

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
