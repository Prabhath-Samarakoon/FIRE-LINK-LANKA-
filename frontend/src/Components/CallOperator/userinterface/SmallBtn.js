export default function SmallBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm hover:bg-zinc-900"
    >
      {children}
    </button>
  );
}
