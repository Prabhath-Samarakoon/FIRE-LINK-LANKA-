import Card from "../userinterface/Card";
import { LabeledInput } from "../userinterface/Inputs";

export default function CallerCard({ refName, callerName, callerPhone, onChange, callId }) {
  return (
    <Card title="Caller">
      <div className="space-y-3">
        <LabeledInput
          ref={refName}
          label="Caller Name"
          placeholder="e.g., Nuwan Perera"
          value={callerName}
          onChange={(v) => onChange("callerName", v)}
        />
        <LabeledInput
          label="Phone"
          placeholder="e.g., 07X-XXXXXXX"
          value={callerPhone}
          onChange={(v) => onChange("callerPhone", v)}
          inputMode="tel"
        />
        <div className="text-xs text-zinc-400">
          Call ID: <span className="font-mono">#{callId}</span>
        </div>
      </div>
    </Card>
  );
}
