import Card from "../userinterface/Card";
import SmallBtn from "../userinterface/SmallBtn";

export default function CallControlsPanel() {
  return (
    <Card title="Call Controls">
      <div className="grid grid-cols-3 gap-2">
        <SmallBtn onClick={() => alert("Muted")}>Mute</SmallBtn>
        <SmallBtn onClick={() => alert("On Hold")}>Hold</SmallBtn>
        <SmallBtn onClick={() => alert("Transferred to Dispatcher")}>Transfer</SmallBtn>
      </div>
    </Card>
  );
}
