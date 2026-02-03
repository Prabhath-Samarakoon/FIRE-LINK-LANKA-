export default function StatusPill({ status }) {
  const color = status === "Available" ? "bg-emerald-600" : status === "Wrap-up" ? "bg-neutral-500" : "bg-sky-600";
  return (
    <span className={`inline-flex items-center gap-2 rounded-full ${color} px-3 py-1 text-xs font-semibold text-white`}>
      <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
      {status}
    </span>
  );
}


