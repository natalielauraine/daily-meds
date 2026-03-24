// Success or error status banner shown at the top of forms and pages.
// Green for success, red for error. Includes a matching icon.

type BannerProps = {
  type: "success" | "error";
  message: string;
};

export default function Banner({ type, message }: BannerProps) {
  const isSuccess = type === "success";

  const bg     = isSuccess ? "rgba(16,185,129,0.1)"  : "rgba(244,63,94,0.1)";
  const border = isSuccess ? "rgba(16,185,129,0.3)"  : "rgba(244,63,94,0.3)";
  const text   = isSuccess ? "text-green-300"         : "text-red-300";

  return (
    <div
      className={`flex items-center gap-2 px-4 py-3 rounded-[10px] mb-5 text-sm ${text}`}
      style={{ backgroundColor: bg, border: `0.5px solid ${border}` }}
    >
      {isSuccess ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
      )}
      {message}
    </div>
  );
}
