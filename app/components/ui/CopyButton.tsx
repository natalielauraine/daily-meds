// One-click copy button. Copies the given value to clipboard and briefly
// shows "Copied!" as feedback before returning to the default label.

"use client";

import { useState } from "react";

type CopyButtonProps = {
  value: string;
  label?: string;
};

export default function CopyButton({ value, label = "Copy" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  // Copy to clipboard and show "Copied!" for 2 seconds
  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className="px-3 py-1.5 rounded-md text-xs transition-colors"
      style={{
        backgroundColor: copied ? "rgba(173,242,37,0.15)" : "rgba(255,65,179,0.15)",
        border: `0.5px solid ${copied ? "rgba(173,242,37,0.3)" : "rgba(255,65,179,0.3)"}`,
        color: copied ? "#6ee7b7" : "#c4b5fd",
      }}
    >
      {copied ? "Copied!" : label}
    </button>
  );
}
