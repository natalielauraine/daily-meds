"use client";

import { usePathname } from "next/navigation";
import MiniPlayer from "./MiniPlayer";
import PlayerSpacer from "./PlayerSpacer";

const CHROMELESS_PATHS = ["/early-access"];

export default function AppChrome() {
  const pathname = usePathname();
  if (CHROMELESS_PATHS.includes(pathname)) return null;
  return (
    <>
      <PlayerSpacer />
      <MiniPlayer />
    </>
  );
}
