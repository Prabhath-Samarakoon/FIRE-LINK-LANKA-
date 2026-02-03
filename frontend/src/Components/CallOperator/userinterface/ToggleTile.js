export default function ToggleTile({ active, onClick, label, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${
        active
          ? "border-red-500 bg-red-600/20 text-red-200"
          : "border-zinc-800 bg-zinc-900/50 text-zinc-200 hover:border-zinc-700"
      }`}
    >
      <span className="text-lg" aria-hidden>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
