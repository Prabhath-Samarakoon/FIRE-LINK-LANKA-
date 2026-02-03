import React from "react";

export const LabeledInput = React.forwardRef(function LabeledInput(
  { label, value, onChange, placeholder, inputMode },
  ref
) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-zinc-300">{label}</span>
      <input
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 outline-none placeholder:text-zinc-500 focus:border-zinc-600"
      />
    </label>
  );
});

export function NumberInput({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-zinc-300">{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value || "0", 10))}
        className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 outline-none focus:border-zinc-600"
      />
    </label>
  );
}

export function SelectInput({ label, value, onChange, options, placeholder = "Select" }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-zinc-300">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 outline-none focus:border-zinc-600"
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
