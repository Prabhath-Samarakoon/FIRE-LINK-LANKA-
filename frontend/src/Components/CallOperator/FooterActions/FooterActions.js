import React from "react";
import { AlertTriangle, Download, AlertCircle, Square } from "lucide-react";
import { downloadCSV, downloadJSON, downloadPDF } from "../ReportD/report";

export default function FooterActions({
  valid, locationFilled, incidentTypeFilled, incident,
  onEscalate, onEndCall, onSubmit
}) {
  const [showDL, setShowDL] = React.useState(false);
  return (
    <footer className="sticky bottom-0 border-t border-zinc-800 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <div className="text-xs text-zinc-400">
          Required: <span className={locationFilled ? "text-emerald-400" : "text-red-500"}>Location</span>,{" "}
          <span className={incidentTypeFilled ? "text-emerald-400" : "text-red-500"}>Incident Type</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowDL(s => !s)}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm hover:bg-zinc-700 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Report
            </button>
            {showDL && (
              <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-zinc-800 bg-zinc-900/95 p-1 shadow-xl">
                <button className="w-full rounded-lg px-3 py-2 text-left hover:bg-zinc-800" onClick={() => { downloadPDF(incident); setShowDL(false); }}>PDF (.pdf)</button>
                <button className="w-full rounded-lg px-3 py-2 text-left hover:bg-zinc-800" onClick={() => { downloadCSV(incident); setShowDL(false); }}>CSV (.csv)</button>
                <button className="w-full rounded-lg px-3 py-2 text-left hover:bg-zinc-800" onClick={() => { downloadJSON(incident); setShowDL(false); }}>JSON (.json)</button>
              </div>
            )}
          </div>
          <button onClick={onEscalate} className="rounded-lg border border-amber-500/40 bg-amber-600/90 px-4 py-2 text-sm font-semibold hover:bg-amber-500 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Escalate
          </button>
          <button onClick={onEndCall} className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm hover:bg-zinc-700 flex items-center gap-2">
            <Square className="h-4 w-4" />
            End Call
          </button>
          <button
            onClick={onSubmit}
            disabled={!valid}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${valid ? "bg-red-600 hover:bg-red-500" : "bg-red-900/50 text-zinc-400 cursor-not-allowed"}`}
            title={valid ? "Alt+S" : "Fill required fields"}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Submit & Dispatch
          </button>
        </div>
      </div>
    </footer>
  );
}
