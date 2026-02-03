export default function StatusPill({ status }) {
  const color = status === "Available" ? "bg-emerald-600" : status === "Wrap-up" ? "bg-zinc-600" : "bg-sky-600";
  return (
    <span className={`inline-flex items-center gap-2 rounded-full ${color} px-3 py-1 text-xs font-semibold`}>
      <span className="h-2 w-2 animate-pulse rounded-full bg-white/90" />
      {status}
    </span>
  );
}
