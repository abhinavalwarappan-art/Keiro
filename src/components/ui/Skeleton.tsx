export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-[#edfaf4] rounded-lg ${className}`} />
}
