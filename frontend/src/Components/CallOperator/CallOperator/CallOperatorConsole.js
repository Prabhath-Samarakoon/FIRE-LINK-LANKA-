import React, { useEffect, useRef, useState } from "react";
import { Flame, Clock } from "lucide-react";
import StatusPill from "../userinterface/StatusPill";
import Card from "../userinterface/Card";
import CallerCard from "../Intake/CallerCard";
import LocationCard from "../Intake/LocationCard";
import IncidentDetailsCard from "../Intake/IncidentDetailsCard";
import SafetyAdvicePanel from "../SA/SafetyAdvicePanel";
import CallControlsPanel from "../CallControls/CallControlsPanel";
import FooterActions from "../FooterActions/FooterActions";
import useCallTimer from "../Timer/useCallTimer";
import useAutosync from "../sync/useAutosync";
import useShortcuts from "../SC/useShortcuts";

const EMPTY = {
  callerName: "", callerPhone: "", notes: "",
  location: "", coordinates: "", incidentType: "",
  hazards: [], trapped: 0, injured: 0, crowd: "", scale: ""
};

export default function CallOperatorConsole() {
  const [incident, setIncident] = useState({ ...EMPTY });
  const [onCall, setOnCall] = useState(true);
  const [operatorStatus, setOperatorStatus] = useState("Available");
  const duration = useCallTimer(onCall);
  const [valid, setValid] = useState(false);
  const [autosyncMsg, touch] = useAutosync();

  const nameRef = useRef(null);
  const locationRef = useRef(null);

  useEffect(() => {
    setValid(Boolean(incident.location && incident.incidentType));
  }, [incident.location, incident.incidentType]);

  useEffect(() => { touch(); }, [incident, touch]);

  useShortcuts({
    onName: () => nameRef.current?.focus(),
    onLocation: () => locationRef.current?.focus(),
    onSubmit: () => handleSubmit()
  });

  function update(field, value) {
    setIncident(prev => ({ ...prev, [field]: value }));
  }

  function handleSubmit() {
    if (!valid) return;
    console.log("DISPATCH_PAYLOAD", { ...incident, submittedAt: new Date().toISOString() });
    alert("Incident submitted to Dispatch!");
  }

  function handleEscalate() { alert("⚠️ Escalated to Supervisor"); }
  function endCall() { setOnCall(false); setOperatorStatus("Wrap-up"); }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-red-600/90 grid place-items-center">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <h1 className="text-lg font-semibold">Fire Brigade – Call Operator</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <StatusPill status={operatorStatus} />
            <div className="rounded-lg bg-zinc-800 px-3 py-1 text-sm font-mono flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {duration}
            </div>
            {autosyncMsg && <div className="text-xs text-emerald-400 animate-pulse">{autosyncMsg}</div>}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-12">
        <section className="lg:col-span-3 space-y-4">
          <CallerCard
            refName={nameRef}
            callerName={incident.callerName}
            callerPhone={incident.callerPhone}
            onChange={(k, v) => update(k, v)}
            callId={Math.abs(hash(JSON.stringify(incident)) % 1000000)}
          />
          <Card title="Live Notes">
            <textarea
              className="h-56 w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 outline-none placeholder:text-zinc-500"
              placeholder="Type quick notes while caller speaks…"
              value={incident.notes}
              onChange={(e) => update("notes", e.target.value)}
            />
          </Card>
        </section>

        <section className="lg:col-span-6 space-y-4">
          <LocationCard
            refLocation={locationRef}
            location={incident.location}
            coordinates={incident.coordinates}
            onChange={(k, v) => update(k, v)}
          />
          <IncidentDetailsCard
            incidentType={incident.incidentType}
            hazards={incident.hazards}
            trapped={incident.trapped}
            injured={incident.injured}
            crowd={incident.crowd}
            scale={incident.scale}
            onChange={(k, v) => update(k, v)}
          />
        </section>

        <section className="lg:col-span-3 space-y-4">
          <SafetyAdvicePanel />
          <CallControlsPanel />
        </section>
      </main>

      <FooterActions
        valid={valid}
        locationFilled={!!incident.location}
        incidentTypeFilled={!!incident.incidentType}
        incident={incident}
        onEscalate={handleEscalate}
        onEndCall={endCall}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

function hash(str) {
  let h = 0, i, chr;
  if (!str) return h;
  for (i = 0; i < str.length; i++) { chr = str.charCodeAt(i); h = (h << 5) - h + chr; h |= 0; }
  return h;
}
