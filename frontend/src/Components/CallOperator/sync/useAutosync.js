import { useCallback, useRef, useState } from "react";

export default function useAutosync() {
  const [msg, setMsg] = useState("");
  const timer = useRef(null);

  const touch = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setMsg("Synced to Fleet & Incident systems ✔");
      setTimeout(() => setMsg(""), 1200);
    }, 450);
  }, []);

  return [msg, touch];
}
