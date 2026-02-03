// Lightweight API helper scoped to Station Officer Inspections
// Uses native fetch and mirrors backend response shapes

const PRIMARY_BASE = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_STAFF_API_URL)
  ? `${process.env.REACT_APP_STAFF_API_URL}/api`
  : 'http://localhost:5000/api';
const FALLBACK_BASE = PRIMARY_BASE.includes('localhost')
  ? PRIMARY_BASE.replace('http://localhost', 'http://127.0.0.1')
  : PRIMARY_BASE;

async function parseJsonSafe(res) {
  try {
    return await res.json();
  } catch (_) {
    const text = await res.text();
    const start = Math.min(
      ...[text.indexOf('{'), text.indexOf('[')].filter((i) => i >= 0)
    );
    if (start >= 0) {
      return JSON.parse(text.slice(start));
    }
    throw new Error('Invalid JSON response');
  }
}

async function http(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  };

  let res = await fetch(`${PRIMARY_BASE}${path}`, opts).catch(() => null);
  if (!res || !res.ok) {
    res = await fetch(`${FALLBACK_BASE}${path}`, opts).catch(() => null);
  }
  if (!res) throw new Error('Network error contacting API');
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    const msg = data?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export async function listInspections(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const url = qs ? `/inspections?${qs}` : '/inspections';
  const data = await http('GET', url);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.inspections)) return data.inspections;
  if (Array.isArray(data.data)) return data.data;
  return [];
}

export async function getInspection(id) {
  const data = await http('GET', `/inspections/${id}`);
  return data.inspection || data.data;
}

export async function createInspection(payload) {
  const p = {
    // Map to both controller shapes
    itemId: payload.itemId,
    itemName: payload.itemName,
    category: payload.category,
    inspectorName: payload.inspectorName || payload.inspector,
    inspector: payload.inspector || payload.inspectorName,
    condition: payload.condition,
    notes: payload.notes || payload.comments || '',
    comments: payload.comments || payload.notes || '',
    nextInspectionDate: payload.nextInspectionDate,
    inspectionType: payload.inspectionType || 'Weekly',
    isMissing: payload.isMissing || false,
    date: payload.date || new Date().toISOString(),
    status: 'Active'
  };
  const data = await http('POST', '/inspections', p);
  return data.inspection || data.data;
}

export async function updateInspection(id, payload) {
  const p = {
    inspectorName: payload.inspectorName || payload.inspector,
    inspector: payload.inspector || payload.inspectorName,
    condition: payload.condition,
    notes: payload.notes || payload.comments,
    comments: payload.comments || payload.notes,
    nextInspectionDate: payload.nextInspectionDate,
    inspectionType: payload.inspectionType,
  };
  const data = await http('PUT', `/inspections/${id}` , p);
  return data.inspection || data.data;
}

export async function deleteInspection(id) {
  if (id) {
    await http('DELETE', `/inspections/${id}`);
  } else {
    // delete all
    await http('DELETE', `/inspections`);
  }
  return true;
}

export async function listItems(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const url = qs ? `/items?${qs}` : '/items';
  const data = await http('GET', url);
  return Array.isArray(data.items) ? data.items : (data.data || []);
}

export async function getItem(id) {
  const data = await http('GET', `/items/${id}`);
  return data.item || data.data;
}

export const CONDITIONS = ['Excellent','Good','Fair','Poor','Out of Service'];
export async function updateItem(id, patch) {
  const data = await http('PUT', `/items/${id}`, patch);
  return data.item || data.data;
}

export default {
  listInspections,
  getInspection,
  createInspection,
  updateInspection,
  deleteInspection,
  listItems,
  getItem,
  CONDITIONS
};


