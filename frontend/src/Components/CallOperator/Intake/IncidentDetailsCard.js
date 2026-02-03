import Card from "../userinterface/Card";
import ToggleTile from "../userinterface/ToggleTile";
import { NumberInput, SelectInput } from "../userinterface/Inputs";

const INCIDENT_TYPES = [
  { id: "building", label: "Building", icon: "🏠" },
  { id: "vehicle",  label: "Vehicle",  icon: "🚗" },
  { id: "forest",   label: "Forest",   icon: "🌲" },
  { id: "hazmat",   label: "HazMat",   icon: "☢️" },
];

const HAZARDS = [
  { id: "gas",  label: "Gas Cylinders", icon: "flame" },
  { id: "chem", label: "Chemicals",     icon: "🧪" },
  { id: "expl", label: "Explosives",    icon: "💣" },
];

const SCALES = ["Minor", "Moderate", "Major", "Catastrophic"];
const CROWDS = ["Small", "Medium", "Large"];

export default function IncidentDetailsCard({
  incidentType, hazards, trapped, injured, crowd, scale, onChange
}) {
  const toggleHazard = (id) => {
    const exists = hazards.includes(id);
    const next = exists ? hazards.filter(h => h !== id) : [...hazards, id];
    onChange("hazards", next);
  };

  return (
    <Card title="Incident Details">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="mb-2 block text-sm text-zinc-300">Incident Type</label>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {INCIDENT_TYPES.map((t) => (
              <ToggleTile
                key={t.id}
                active={incidentType === t.id}
                onClick={() => onChange("incidentType", t.id)}
                label={t.label}
                icon={t.icon}
              />
            ))}
          </div>
        </div>

        <div className="col-span-2">
          <label className="mb-2 block text-sm text-zinc-300">Possible Hazards</label>
          <div className="grid grid-cols-3 gap-2">
            {HAZARDS.map((h) => (
              <ToggleTile
                key={h.id}
                active={hazards.includes(h.id)}
                onClick={() => toggleHazard(h.id)}
                label={h.label}
                icon={h.icon}
              />
            ))}
          </div>
        </div>

        <NumberInput label="People Trapped" value={trapped} onChange={(v) => onChange("trapped", v)} />
        <NumberInput label="Injured" value={injured} onChange={(v) => onChange("injured", v)} />

        <SelectInput label="Crowd Size" value={crowd} onChange={(v) => onChange("crowd", v)} options={CROWDS} placeholder="Select" />
        <SelectInput label="Emergency Scale" value={scale} onChange={(v) => onChange("scale", v)} options={SCALES} placeholder="Select" />
      </div>
    </Card>
  );
}
