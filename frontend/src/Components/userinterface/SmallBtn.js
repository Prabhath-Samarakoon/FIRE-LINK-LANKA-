export default function SmallBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm hover:bg-neutral-50"
    >
      {children}
    </button>
  );
}


