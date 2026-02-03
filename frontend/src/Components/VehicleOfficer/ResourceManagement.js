import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ResourceManagement.css';
import apiService from '../../services/api';
import orgLogoUrl from '../../assets/Logo.jpg';

const FUEL_THRESHOLD = 30; // percent

const parseFuelConsumptionLPer100Km = (value) => {
  if (!value || typeof value !== 'string') return null;
  const lower = value.toLowerCase().replace(/,/g, '.');
  const matchRange = lower.match(/([0-9]+(?:\.[0-9]+)?)\s*[-–]\s*([0-9]+(?:\.[0-9]+)?)/);
  if (matchRange) {
    const a = parseFloat(matchRange[1]);
    const b = parseFloat(matchRange[2]);
    if (isFinite(a) && isFinite(b)) return (a + b) / 2;
  }
  const matchSingle = lower.match(/([0-9]+(?:\.[0-9]+)?)/);
  if (matchSingle) {
    const n = parseFloat(matchSingle[1]);
    if (isFinite(n)) return n;
  }
  return null;
};

const getVehicleShowcaseImage = (vehicleType, vehicleName) => {
  const imageMap = {
    'Fire Truck': '/images/showcase/fire-engine-pumper.png',
    'Water Tanker': '/images/showcase/water-bowser.png',
    'Rescue Vehicle': '/images/showcase/rescue-tender.png',
    'Command Vehicle': '/images/showcase/fire-command-suv.png',
    'Ambulance': '/images/showcase/ambulance.png',
    'Police Car': '/images/showcase/fire-engine-pumper.png',
    'Ladder Truck': '/images/showcase/aerial-ladder-platform.png',
    'Hazmat Vehicle': '/images/showcase/hazmat-truck.png',
    'Medical Response Unit': '/images/showcase/fire-engine-pumper.png',
    'Search & Rescue Vehicle': '/images/showcase/wild-land-truck.png'
  };
  if (vehicleName && typeof vehicleName === 'string') {
    const lowerName = vehicleName.toLowerCase();
    if (lowerName.includes('foam')) return '/images/showcase/foam-tender.png';
    if (lowerName.includes('logistics') || lowerName.includes('support') || lowerName.includes('utility')) {
      return '/images/showcase/logistics-truck.png';
    }
    if (lowerName.includes('wildland') || lowerName.includes('wild') || lowerName.includes('brush')) {
      return '/images/showcase/wild-land-truck.png';
    }
  }
  if (vehicleType && typeof vehicleType === 'string') {
    const lowerType = vehicleType.toLowerCase();
    if (lowerType.includes('foam')) return '/images/showcase/foam-tender.png';
    if (lowerType.includes('logistics') || lowerType.includes('support') || lowerType.includes('utility')) {
      return '/images/showcase/logistics-truck.png';
    }
    if (lowerType.includes('wildland') || lowerType.includes('wild') || lowerType.includes('brush')) {
      return '/images/showcase/wild-land-truck.png';
    }
  }
  return imageMap[vehicleType] || '/images/showcase/fire-engine-pumper.png';
};

const getEffectiveTripKm = (vehicle) => {
  const tb = Number(vehicle?.tripB ?? 0);
  const ta = Number(vehicle?.tripA ?? 0);
  return tb > 0 ? tb : ta;
};

const estimateFuelPercentFromTrips = (vehicle, fallbackTank = 100) => {
  const tripKm = getEffectiveTripKm(vehicle);
  if (!tripKm || tripKm <= 0) return null;
  const lPer100 = parseFuelConsumptionLPer100Km(vehicle.fuelConsumption);
  const tankLiters = typeof vehicle.fuelCapacity === 'number' && vehicle.fuelCapacity > 0 ? vehicle.fuelCapacity : fallbackTank;
  if (!lPer100 || !tankLiters) return null;
  const litersUsed = (lPer100 / 100) * tripKm;
  return Math.max(0, 100 - (litersUsed / tankLiters) * 100);
};

const ResourceManagement = () => {
  const [resources, setResources] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [visibleCount, setVisibleCount] = useState(8);

  // single selection and refill state
  const [selectedId, setSelectedId] = useState(null);
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [refillForm, setRefillForm] = useState({ mode: 'Amount', pricePerLiter: '', amount: '' });
  const [orders, setOrders] = useState([]);
  const [editOrderId, setEditOrderId] = useState(null);
  const [removedIds, setRemovedIds] = useState(new Set());
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterMode, setFilterMode] = useState('All');
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [fuelOverrideByVehicleId, setFuelOverrideByVehicleId] = useState({});


  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { (async ()=>{ try { const res = await apiService.getRefillOrders(); setOrders(res?.orders || []); } catch {} })(); }, []);
  useEffect(() => { localStorage.setItem('refillOrders', JSON.stringify(orders)); }, [orders]);

  const fetchAll = async () => {
    setLoading(true); setError('');
    try {
      const [{ data }, vehicleRes] = await Promise.all([
        axios.get('http://localhost:5000/api/vehicle-officer/resource-management'),
        apiService.getVehicleOfficerVehicles()
      ]);
      setResources(data?.resourceManagement || []);
      setVehicles(vehicleRes?.vehicles || []);
    } catch (e) { setError('Failed to load resource data.'); } finally { setLoading(false); }
  };

  const resourceByVehicleId = new Map();
  for (const r of resources) { if (r.vehicleId) resourceByVehicleId.set(r.vehicleId.toString(), r); }

  const resourceByName = new Map();
  for (const r of resources) { if (r.vehicleName) resourceByName.set(r.vehicleName.toString(), r); }

  const lowFuelVehicles = vehicles.filter(v => {
    const rid = v.vehicleId ? v.vehicleId.toString() : '';
    const override = rid && fuelOverrideByVehicleId[rid];
    if (typeof override === 'number') {
      return Number(override) <= FUEL_THRESHOLD;
    }
    let rec = rid ? resourceByVehicleId.get(rid) : null;
    if (!rec && v.name) rec = resourceByName.get(v.name);
    const currentFuel = rec && typeof rec.currentFuelLevel === 'number' ? rec.currentFuelLevel : (estimateFuelPercentFromTrips(v) ?? v.fuelLevel ?? 100);
    return Number(currentFuel || 0) <= FUEL_THRESHOLD;
  });
  const filteredLowFuel = lowFuelVehicles.filter(v => !removedIds.has(v._id));
  const pagedLowFuelVehicles = filteredLowFuel.slice(0, visibleCount);

  const toggleSelect = (veh) => { setSelectedId(prev => (prev === veh._id ? null : veh._id)); };

  const openRefill = () => { setRefillForm({ mode: 'Amount', pricePerLiter: '', amount: '' }); setEditOrderId(null); setShowRefillModal(true); };
  const closeRefill = () => { setShowRefillModal(false); };

  const submitRefill = async (e) => {
    e.preventDefault();
    const v = lowFuelVehicles.find(x => x._id === selectedId);
    if (!v) return;
    const price = Number(refillForm.pricePerLiter || 0);
    let amount = 0; let liters = 0; let mode = refillForm.mode;
    if (mode === 'Amount') { amount = Number(refillForm.amount || 0); liters = price > 0 ? +(amount / price).toFixed(2) : 0; }
    else { const rec = v.vehicleId ? resourceByVehicleId.get(v.vehicleId.toString()) : null; const tank = (rec && rec.fuelCapacity) ? rec.fuelCapacity : (typeof v.fuelCapacity === 'number' && v.fuelCapacity > 0 ? v.fuelCapacity : 100); liters = tank; amount = +(tank * price).toFixed(2); }
    try {
      if (editOrderId) {
        const updated = await apiService.updateRefillOrder(editOrderId, { pricePerLiter: price, liters, amount, mode });
        setOrders(prev => prev.map(o => o.id === editOrderId ? updated.order : o));
      } else {
        const created = await apiService.createRefillOrder({ vehicleId: v.vehicleId || v._id, vehicleName: v.name || 'VEHICLE', pricePerLiter: price, liters, amount, mode, status: 'Pending' });
        setOrders(prev => [created.order, ...prev]);
      }
      setShowRefillModal(false);
    } catch {}
  };

  const editOrder = (order) => { setEditOrderId(order._id || order.id); setRefillForm({ mode: order.mode, pricePerLiter: String(order.pricePerLiter || order.price), amount: String(order.amount) }); setShowRefillModal(true); };
  const deleteOrder = async (id) => { if (!window.confirm('Delete this refill request?')) return; try { await apiService.deleteRefillOrder(id); setOrders(prev => prev.filter(o => (o._id||o.id) !== id)); } catch {} };
  const completeOrder = async (id) => {
    try {
      const res = await apiService.completeRefillOrder(id);
      setOrders(prev => prev.map(o => (o._id||o.id) === id ? res.order : o));
      setSelectedId(null);
      const ord = res.order || {};
      const match = vehicles.find(v => (v.vehicleId && ord.vehicleId && String(v.vehicleId) === String(ord.vehicleId)) || (v.name && ord.vehicleName && v.name === ord.vehicleName));
      if (match) setRemovedIds(prev => new Set(prev).add(match._id));
      if (ord.vehicleId) setFuelOverrideByVehicleId(prev => ({ ...prev, [String(ord.vehicleId)]: 100 }));
      // Broadcast to other pages - only for the specific refilled vehicle
      try { 
        window.dispatchEvent(new CustomEvent('resourceFuelUpdated', { 
          detail: { 
            vehicleId: ord.vehicleId, 
            vehicleName: (ord.vehicleName||'').toString(), 
            fuelLevel: 100,
            isRefill: true  // Mark as refill event
          } 
        })); 
      } catch {}
      try { 
        window.dispatchEvent(new CustomEvent('vehiclesUpdated', { 
          detail: { 
            vehicleId: ord.vehicleId, 
            vehicleName: ord.vehicleName 
          } 
        })); 
      } catch {}
      fetchAll();
    } catch {}
  };

  const filteredOrders = orders.filter(o => {
    const name = (o.vehicle?.name || o.vehicleName || '').toLowerCase();
    const q = query.toLowerCase();
    const statusOk = filterStatus === 'All' || (o.status === filterStatus);
    const modeOk = filterMode === 'All' || ((o.mode || 'Amount') === filterMode);
    const nameOk = !q || name.includes(q) || String(o._id||o.id||'').includes(q);
    return statusOk && modeOk && nameOk;
  });

  const orgName = 'FIRE LINK LANKA';
  const orgLogo = orgLogoUrl; // uses src/assets/Logo.jpg
  const brandColor = '#b91c1c';

  const fmt = (n) => Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const totalAmount = filteredOrders.reduce((sum, o) => sum + Number(o.amount ?? 0), 0);

  const buildReportHTML = () => {
    const rows = filteredOrders.map((o, idx) => `
      <tr class="row${(idx % 2) ? ' alt' : ''}">
        <td class="cell text">${o.vehicle?.name || o.vehicleName || ''}</td>
        <td class="cell text">${o.mode || 'Amount'}</td>
        <td class="cell num">${fmt(o.pricePerLiter ?? o.price)}</td>
        <td class="cell num">${fmt(o.liters)}</td>
        <td class="cell num">${fmt(o.amount)}</td>
        <td class="cell text">${o.status || 'Pending'}</td>
        <td class="cell text">${new Date(o.createdAt || Date.now()).toLocaleDateString()}</td>
      </tr>`).join('');

    const css = `
      *{box-sizing:border-box} body{font-family:Arial, Helvetica, sans-serif; color:#0f172a;}
      .container{width:860px; margin:0 auto; padding-top:140px; padding-bottom:90px}
      .header{position:fixed; top:0; left:0; right:0; text-align:center; padding:12px 0}
      .logo{height:58px; display:block; margin:4px auto}
      .org{font-size:24px; font-weight:900; letter-spacing:1px; margin-top:6px}
      .title{font-size:16px; font-weight:700; color:#334155}
      .divider{height:3px; width:220px; background:${brandColor}; margin:10px auto 0; border-radius:3px}
      .table{width:100%; border-collapse:separate; border-spacing:0 6px; margin-top:16px}
      .head th{background:#f3f4f6; color:#111827; padding:10px 12px; text-align:left; border-top:1px solid #e5e7eb; border-bottom:1px solid #e5e7eb}
      .row{background:#fff}
      .row.alt{background:#fbfbfb}
      .cell{padding:10px 12px; border-top:1px solid #e5e7eb; border-bottom:1px solid #e5e7eb}
      .num{text-align:right; font-variant-numeric: tabular-nums}
      .text{white-space:nowrap}
      .total{margin-top:18px; display:flex; justify-content:flex-end; align-items:baseline; gap:16px}
      .total .label{font-weight:800}
      .total .amount{font-weight:800; border-bottom:3px double #000; padding:0 6px}
      .footer{position:fixed; bottom:0; left:0; right:0; text-align:center; font-size:12px; padding:8px 0; color:#475569}
    `;

    const header = `
      <div class="header">
        <img src="${orgLogo}" class="logo" alt="logo" onerror="this.style.display='none'"/>
        <div class="org">${orgName}</div>
        <div class="title">Refill Orders</div>
        <div class="divider"></div>
      </div>`;

    const table = `
      <table class="table">
        <thead class="head">
          <tr>
            <th>Vehicle</th><th>Mode</th><th style="text-align:right">Price/L</th><th style="text-align:right">Liters</th><th style="text-align:right">Amount</th><th>Status</th><th>Date</th>
          </tr>
        </thead>
        <tbody>${rows || `<tr><td colspan=\"7\" class=\"cell\">No data</td></tr>`}</tbody>
      </table>`;

    const footer = `<div class="footer">Generated: ${new Date().toLocaleString()} — Report prepared by ${orgName}</div>`;

    return `
      <style>${css}</style>
      <div class="container">
        ${header}
        ${table}
        <div class="total"><span class="label">Total</span><span class="amount">${fmt(totalAmount)}</span></div>
        ${footer}
      </div>`;
  };

  const downloadExcel = () => {
    const header = ['Vehicle','Mode','Price/L','Liters','Amount','Status','Date'];
    const lines = filteredOrders.map(o => [
      (o.vehicle?.name || o.vehicleName || ''), (o.mode || 'Amount'),
      fmt(o.pricePerLiter ?? o.price), fmt(o.liters), fmt(o.amount), (o.status || 'Pending'), new Date(o.createdAt || Date.now()).toLocaleDateString()
    ].map(v => `"${String(v).replace(/"/g,'""')}"`).join(','));
    const totalLine = `"","","","","${fmt(totalAmount)}","Total",""`;
    const csv = [header.join(','), ...lines, '', totalLine].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = 'Refill_Orders.csv'; a.click(); URL.revokeObjectURL(url);
    setShowDownloadMenu(false);
  };

  const downloadWord = () => {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${orgName} - Refill Orders</title></head><body>${buildReportHTML()}</body></html>`;
    const blob = new Blob([html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = 'Refill_Orders.doc'; a.click(); URL.revokeObjectURL(url);
    setShowDownloadMenu(false);
  };

  const downloadPDF = () => {
    const win = window.open('', '_blank'); if (!win) return;
    const html = `<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>${orgName} - Refill Orders</title>
      <style>@media print { body { -webkit-print-color-adjust: exact; } }</style></head>
      <body>${buildReportHTML()}<script>window.onload=function(){window.print(); window.close();}</script></body></html>`;
    win.document.write(html); win.document.close(); setShowDownloadMenu(false);
  };

  return (
    <div className="resource-management">
      <div className="resource-header"><h1>⛽ Resource Management</h1><p>Vehicles needing attention are highlighted below</p></div>
      {error && (<div className="error-message"><p>{error}</p><button onClick={fetchAll} className="refresh-btn">🔄 Refresh</button></div>)}

      <div className="resource-content">
        <div className="resource-section">
          <div className="section-header"><h2>Low Resources</h2></div>
          {loading ? (<div className="loading">Loading...</div>) : (pagedLowFuelVehicles.length === 0 ? (
            <div className="no-data"><h3>All good!</h3><p>No vehicles are below thresholds.</p></div>
          ) : (
            <>
              <div className="vehicle-grid" style={{ marginBottom: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {pagedLowFuelVehicles.map(v => (
                  <div key={v._id} style={{ position: 'relative', background: '#fff', borderRadius: 8, padding: 12, boxShadow: '0 10px 20px rgba(0,0,0,0.2)', cursor: 'pointer', outline: selectedId===v._id ? '3px solid #22c55e' : 'none' }} onClick={() => toggleSelect(v)}>
                    <img src={getVehicleShowcaseImage(v.Vtype, v.name)} alt={v.name} style={{ width: 240, height: 120, objectFit: 'contain', display: 'block' }} onError={(e) => { e.target.src = '/images/showcase/fire-engine-pumper.png'; }} />
                    {selectedId===v._id && (<div style={{ position: 'absolute', top: 8, right: 8, background: '#16a34a', color: '#fff', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>✔</div>)}
                </div>
              ))}
              </div>
              {selectedId && (<div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 16px' }}><button className="add-btn" onClick={openRefill}>Send to Refill</button></div>)}
              {lowFuelVehicles.length > visibleCount && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
                  <button className="add-btn" onClick={() => setVisibleCount(c => c + 8)}>Show more</button>
                  <button className="cancel-btn" onClick={() => setVisibleCount(lowFuelVehicles.length)}>Show all</button>
                </div>
              )}
              {visibleCount > 8 && (<div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><button className="cancel-btn" onClick={() => setVisibleCount(8)}>Show less</button></div>)}
            </>
          ))}
        </div>

        {/* Refill Orders as a list/table */}
        {orders.length > 0 && (
          <div className="resource-section" style={{ marginTop: 16 }}>
            <div className="section-header" style={{ display:'flex', alignItems:'center', gap:12 }}>
              <h2 style={{ marginRight: 'auto' }}>Refill Requests</h2>
              <input placeholder="Search by order or vehicle" value={query} onChange={(e)=>setQuery(e.target.value)} style={{ padding:8, borderRadius:6, border:'1px solid #333', background:'#111', color:'#eee' }} />
              <select value={filterStatus} onChange={(e)=>setFilterStatus(e.target.value)} style={{ padding:8, borderRadius:6, border:'1px solid #333', background:'#111', color:'#eee' }}>
                <option>All</option>
                <option>Pending</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
              <select value={filterMode} onChange={(e)=>setFilterMode(e.target.value)} style={{ padding:8, borderRadius:6, border:'1px solid #333', background:'#111', color:'#eee' }}>
                <option>All</option>
                <option>Amount</option>
                <option>Full</option>
              </select>
              <div style={{ position:'relative' }}>
                <button className="add-btn" onClick={()=>setShowDownloadMenu(m=>!m)}>Download Report</button>
                {showDownloadMenu && (
                  <div style={{ position:'absolute', right:0, top:'110%', background:'#1e1e1e', border:'1px solid #333', borderRadius:8, padding:8, display:'flex', flexDirection:'column', gap:6, zIndex:10 }}>
                    <button className="edit-btn" onClick={downloadPDF}>PDF</button>
                    <button className="edit-btn" onClick={downloadWord}>Word</button>
                    <button className="edit-btn" onClick={downloadExcel}>Excel</button>
            </div>
          )}
        </div>
      </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left' }}>
                    <th style={{ padding: '8px 12px' }}>Order</th>
                    <th style={{ padding: '8px 12px' }}>Vehicle</th>
                    <th style={{ padding: '8px 12px' }}>Mode</th>
                    <th style={{ padding: '8px 12px' }}>Price/L</th>
                    <th style={{ padding: '8px 12px' }}>Liters</th>
                    <th style={{ padding: '8px 12px' }}>Amount</th>
                    <th style={{ padding: '8px 12px' }}>Status</th>
                    <th style={{ padding: '8px 12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(o => (
                    <tr key={(o._id||o.id||Math.random()).toString()} style={{ borderTop: '1px solid #333' }}>
                      <td style={{ padding: '8px 12px' }}>#{String(o._id||o.id||'').slice(-6)}</td>
                      <td style={{ padding: '8px 12px' }}>{o.vehicle?.name || o.vehicleName || 'VEHICLE'}</td>
                      <td style={{ padding: '8px 12px' }}>{o.mode || 'Amount'}</td>
                      <td style={{ padding: '8px 12px' }}>{Number(o.pricePerLiter ?? o.price ?? 0).toFixed(2)}</td>
                      <td style={{ padding: '8px 12px' }}>{Number(o.liters ?? 0).toFixed(2)}</td>
                      <td style={{ padding: '8px 12px' }}>{Number(o.amount ?? 0).toFixed(2)}</td>
                      <td style={{ padding: '8px 12px' }}>{o.status || 'Pending'}</td>
                      <td style={{ padding: '8px 12px', display: 'flex', gap: 8 }}>
                        <button className="edit-btn" onClick={() => editOrder(o)}>Edit</button>
                        <button className="delete-btn" onClick={() => deleteOrder(o._id||o.id)}>Delete</button>
                        {(o.status !== 'Completed') && (<button className="add-btn" onClick={() => completeOrder(o._id||o.id)}>Complete</button>)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
                </div>
              )}
              </div>
              
      {/* Refill Modal */}
      {showRefillModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header"><h3>{editOrderId ? 'Update Refill' : 'Send to Refill'}</h3><button onClick={closeRefill}>✖</button></div>
            <form className="form" onSubmit={submitRefill}>
              <div className="form-row">
                <div className="form-group">
                  <label>Mode</label>
                  <select value={refillForm.mode} onChange={(e)=>setRefillForm(f=>({...f, mode:e.target.value}))}>
                    <option>Amount</option>
                    <option>Full</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Price per Liter</label>
                  <input type="number" min="0" step="0.01" value={refillForm.pricePerLiter} onChange={(e)=>setRefillForm(f=>({...f, pricePerLiter:e.target.value}))} required />
                </div>
                {refillForm.mode === 'Amount' && (
                <div className="form-group">
                    <label>Amount</label>
                    <input type="number" min="0" step="0.01" value={refillForm.amount} onChange={(e)=>setRefillForm(f=>({...f, amount:e.target.value}))} required />
                </div>
                )}
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-btn">{editOrderId ? 'Update' : 'Create'}</button>
                <button type="button" className="cancel-btn" onClick={closeRefill}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceManagement;


