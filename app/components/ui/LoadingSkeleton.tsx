// Animated loading placeholder — shown while data is being fetched.
// Renders `count` stacked dark pulse blocks at the given pixel height.

type LoadingSkeletonProps = {
  height?: number;  // height in px, default 64
  count?: number;   // how many skeletons to stack, default 1
  className?: string;
};

export default function LoadingSkeleton({ height = 64, count = 1, className = "" }: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`rounded-[10px] animate-pulse ${className}`}
          style={{ height, backgroundColor: "#1F1F1F" }}
        />
      ))}
    </>
  );
}
