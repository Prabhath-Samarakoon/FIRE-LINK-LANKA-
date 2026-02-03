import { useEffect } from "react";

export default function useShortcuts({ onName, onLocation, onSubmit }) {
  useEffect(() => {
    function onKey(e) {
      const k = e.key.toLowerCase();
      if (e.altKey && k === "n") { e.preventDefault(); onName?.(); }
      if (e.altKey && k === "l") { e.preventDefault(); onLocation?.(); }
      if (e.altKey && k === "s") { e.preventDefault(); onSubmit?.(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onName, onLocation, onSubmit]);
}
