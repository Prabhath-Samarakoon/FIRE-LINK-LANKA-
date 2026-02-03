import Card from "../userinterface/Card";
import { LabeledInput } from "../userinterface/Inputs";

export default function LocationCard({ refLocation, location, coordinates, onChange }) {
  return (
    <Card title="Location">
      <div className="space-y-3">
        <LabeledInput
          ref={refLocation}
          label="Address / Landmark"
          placeholder="House No., Street, Town"
          value={location}
          onChange={(v) => onChange("location", v)}
        />
        <LabeledInput
          label="Coordinates (optional)"
          placeholder="6.9271, 79.8612"
          value={coordinates}
          onChange={(v) => onChange("coordinates", v)}
        />
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
          <div className="mb-2 text-sm text-zinc-400">Map Preview</div>
          <div className="h-40 w-full rounded-lg bg-zinc-800 grid place-items-center text-zinc-400">
            🗺️ Map placeholder (integrate maps SDK)
          </div>
          <button
            className="mt-3 w-full rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold hover:bg-red-500"
            onClick={() => alert("Location pinned for dispatch")}
          >
            Mark Fire Location
          </button>
        </div>
      </div>
    </Card>
  );
}
