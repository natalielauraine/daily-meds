// Dashed-border empty placeholder shown when a list has no items.
// Accepts an optional action label and either href (link) or onClick (button).

import Link from "next/link";

type EmptyStateProps = {
  message: string;
  action?: string;
  href?: string;
  onClick?: () => void;
};

export default function EmptyState({ message, action, href, onClick }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 rounded-[10px] text-center"
      style={{ border: "0.5px dashed rgba(255,255,255,0.08)" }}
    >
      <p className="text-sm text-white/25 mb-2">{message}</p>
      {action && href && (
        <Link href={href} className="text-xs text-pink-400 hover:text-pink-300 transition-colors">
          {action}
        </Link>
      )}
      {action && onClick && (
        <button
          onClick={onClick}
          className="text-xs text-white/40 hover:text-white/70 transition-colors mt-1"
        >
          {action}
        </button>
      )}
    </div>
  );
}
