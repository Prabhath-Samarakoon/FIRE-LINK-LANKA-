import { jsPDF } from "jspdf";

export function buildReport(incident) {
  const timestamp = new Date().toISOString();
  return {
    timestamp,
    caller: { name: incident.callerName || "", phone: incident.callerPhone || "" },
    location: { address: incident.location || "", coordinates: incident.coordinates || "" },
    incident: {
      type: incident.incidentType || "",
      hazards: incident.hazards || [],
      trapped: incident.trapped ?? 0,
      injured: incident.injured ?? 0,
      crowd: incident.crowd || "",
      scale: incident.scale || "",
    },
    notes: incident.notes || "",
  };
}

export function toCSV(reportObj) {
  const flat = {
    timestamp: reportObj.timestamp,
    caller_name: reportObj.caller.name,
    caller_phone: reportObj.caller.phone,
    location_address: reportObj.location.address,
    location_coordinates: reportObj.location.coordinates,
    incident_type: reportObj.incident.type,
    hazards: (reportObj.incident.hazards || []).join(";"),
    trapped: reportObj.incident.trapped,
    injured: reportObj.incident.injured,
    crowd: reportObj.incident.crowd,
    scale: reportObj.incident.scale,
    notes: (reportObj.notes || "").replace(/\n/g, " "),
  };
  const headers = Object.keys(flat);
  const values = headers.map(k => String(flat[k] ?? ""));
  return headers.join(",") + "\n" + values.map(v => `"${v.replace(/"/g, '""')}"`).join(",");
}

export function downloadBlob(content, mime, filename) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

export function downloadJSON(incident) {
  const report = buildReport(incident);
  downloadBlob(JSON.stringify(report, null, 2), "application/json", `incident_report_${Date.now()}.json`);
}

export function downloadCSV(incident) {
  const report = buildReport(incident);
  downloadBlob(toCSV(report), "text/csv", `incident_report_${Date.now()}.csv`);
}

export function downloadPDF(incident) {
  const report = buildReport(incident);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  let y = margin;

  doc.setFont("helvetica", "bold"); doc.setFontSize(16);
  doc.text("Fire Brigade – Incident Report", margin, y); y += 22;
  doc.setFontSize(10); doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date(report.timestamp).toLocaleString()}`, margin, y); y += 24;

  const section = (title) => { doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.text(title, margin, y); y += 16; doc.setFont("helvetica", "normal"); doc.setFontSize(11); };
  const line = (label, value) => { const text = `${label}: ${value || "-"}`; const split = doc.splitTextToSize(text, 520); split.forEach(t => { doc.text(t, margin, y); y += 16; }); };

  section("Caller");
  line("Name", report.caller.name);
  line("Phone", report.caller.phone);

  section("Location");
  line("Address", report.location.address);
  line("Coordinates", report.location.coordinates);

  section("Incident");
  line("Type", report.incident.type);
  line("Hazards", (report.incident.hazards || []).join(", "));
  line("People Trapped", report.incident.trapped);
  line("Injured", report.incident.injured);
  line("Crowd Size", report.incident.crowd);
  line("Scale", report.incident.scale);

  section("Notes");
  const notes = report.notes || "";
  const splitNotes = doc.splitTextToSize(notes, 520);
  splitNotes.forEach(t => { doc.text(t, margin, y); y += 16; });

  doc.save(`incident_report_${Date.now()}.pdf`);
}
