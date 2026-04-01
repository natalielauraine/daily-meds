"use client";

// Renders an invisible spacer at the bottom of the page when the mini player is visible.
// This stops the footer and last page content from being hidden behind the fixed player bar.

import { usePlayer } from "../../lib/player-context";

export default function PlayerSpacer() {
  const { currentSession } = usePlayer();
  if (!currentSession) return null;
  return <div style={{ height: 64 }} aria-hidden="true" />;
}
