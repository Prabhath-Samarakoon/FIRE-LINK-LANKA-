import React, { useState, useEffect } from 'react';
import stationOfficerApi from '../services/stationOfficerApi';
import './Reports.css';

function Reports({ onNavigate }) {
  const [openCard, setOpenCard] = useState(null); // 'donations' | 'inspections' | 'inventory' | null
  const [donations, setDonations] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (openCard === 'donations') {
          const r = await stationOfficerApi.getAllDonations();
          setDonations(r.donations || r.data || []);
        } else if (openCard === 'inspections') {
          const r = await stationOfficerApi.getAllInspections();
          setInspections(r.inspections || r.data || []);
        } else if (openCard === 'inventory') {
          const r = await stationOfficerApi.getAllItems();
          setItems(r.items || r.data || []);
        }
      } catch (e) {
        // swallow errors in this quick view
      } finally {
        setLoading(false);
      }
    };
    if (openCard) load();
  }, [openCard]);

  // Preload data for all cards on initial mount so stats render immediately
  useEffect(() => {
    let mounted = true;
    const preload = async () => {
      try {
        setLoading(true);
        const [donationsResp, inspectionsResp, itemsResp] = await Promise.all([
          stationOfficerApi.getAllDonations().catch(() => ({ data: [] })),
          stationOfficerApi.getAllInspections().catch(() => ({ data: [] })),
          stationOfficerApi.getAllItems().catch(() => ({ data: [] }))
        ]);
        if (!mounted) return;
        setDonations(donationsResp.donations || donationsResp.data || []);
        setInspections(inspectionsResp.inspections || inspectionsResp.data || []);
        setItems(itemsResp.items || itemsResp.data || []);
      } catch (e) {
        // ignore; individual card loads will still work
      } finally {
        if (mounted) setLoading(false);
      }
    };
    preload();
    return () => { mounted = false; };
  }, []);
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoadingReports(true);
      const data = await stationOfficerApi.getAllReports();
      // Ensure we have an array and handle different response formats
      const reports = Array.isArray(data) ? data : (data.reports || []);
      setReports(reports);
    } catch (err) {
      setError('Failed to load reports data');
      console.error('Error loading reports:', err);
      // Set empty array as fallback
      setReports([]);
    } finally {
      setLoadingReports(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleDeleteReport = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await stationOfficerApi.deleteReport(reportId);
        setReports(reports.filter(report => report._id !== reportId));
      } catch (err) {
        console.error('Error deleting report:', err);
        alert('Failed to delete report');
      }
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'inspection': return '#3b82f6';
      case 'incident': return '#ef4444';
      case 'maintenance': return '#f59e0b';
      case 'inventory': return '#10b981';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loadingReports) {
    return (
      <div className="reports-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading reports data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={loadReports} className="retry-button">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      {/* Page Header */}
      <div className="page-header-section">
        <div className="page-header-container">
          <div className="page-header-content">
            <div className="page-title-section">
              <h1 className="page-title">Reports</h1>
            </div>
            <div className="search-button-section"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="reports-main">
        <div className="reports-container">
          {/* Report Cards */}
          <div className="report-cards-section">
            <div className="report-cards-grid">
              {/* Donations Report Card */}
              <div className={`report-card donations-card ${openCard==='donations' ? 'ring-2 ring-emerald-400 scale-[1.01]' : ''}`} onClick={()=>setOpenCard(openCard==='donations'?null:'donations')} style={{cursor:'pointer'}}>
                <div className="report-card-header">
                  <h3 className="report-card-title">Donations Report</h3>
                </div>
                <p className="report-card-description">
                  Generate a comprehensive report of all donations with financial summaries and donor details.
                </p>
                <div className="report-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Donations:</span>
                    <span className="stat-value">{donations.length}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Amount:</span>
                    <span className="stat-value">{`Rs. ${donations.reduce((sum,d)=>sum + (Number(d.amount)||0),0).toLocaleString('en-LK',{minimumFractionDigits:2,maximumFractionDigits:2})}`}</span>
                  </div>
                </div>
                <button className="download-btn donations-btn" onClick={async (e)=>{
                  e.stopPropagation();
                  try {
                    const donationsResp = await stationOfficerApi.getAllDonations();
                    const list = (donationsResp.donations || donationsResp.data || []).map(d => ({
                      donor: d.donorName || d.name || '-',
                      email: d.email || '-',
                      method: d.paymentMethod || d.method || '-',
                      amount: Number(d.amount) || 0,
                      date: d.date ? new Date(d.date).toISOString().slice(0,10) : '-'
                    }));

                    const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
                    const pdfDoc = await PDFDocument.create();
                    let page = pdfDoc.addPage([595.28, 841.89]);
                    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
                    let y = 800;
                    page.drawText('Donations Report', { x: 50, y, size: 18, font });
                    y -= 30;
                    const headers = ['Donor','Email','Method','Amount','Date'];
                    const colX = [50, 190, 320, 410, 480];
                    headers.forEach((h,i)=> page.drawText(h, { x: colX[i], y, size: 11, font }));
                    y -= 15;
                    page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 0.5, color: rgb(0,0,0) });
                    y -= 12;
                    const formatAmount = (n) => `Rs. ${n.toLocaleString('en-LK',{ minimumFractionDigits:2, maximumFractionDigits:2 })}`;
                    for (const row of list) {
                      if (y < 60) {
                        y = 800;
                        const p = pdfDoc.addPage([595.28, 841.89]);
                        p.drawText('Donations Report (cont.)', { x: 50, y, size: 12, font });
                        y -= 24;
                        ['Donor','Email','Method','Amount','Date'].forEach((h,i)=> p.drawText(h, { x: colX[i], y, size: 11, font }));
                        y -= 15;
                        p.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 0.5, color: rgb(0,0,0) });
                        y -= 12;
                        page = p;
                      }
                      page.drawText(String(row.donor || '-'), { x: 50, y, size: 10, font });
                      page.drawText(String(row.email || '-'), { x: 190, y, size: 10, font });
                      page.drawText(String(row.method || '-'), { x: 320, y, size: 10, font });
                      page.drawText(formatAmount(row.amount || 0), { x: 410, y, size: 10, font });
                      page.drawText(String(row.date || '-'), { x: 480, y, size: 10, font });
                      y -= 14;
                    }
                    const uri = URL.createObjectURL(new Blob([await pdfDoc.save()], { type: 'application/pdf' }));
                    const a = document.createElement('a');
                    a.href = uri;
                    a.download = 'donations-report.pdf';
                    a.click();
                    URL.revokeObjectURL(uri);
                  } catch (e) {
                    alert('Failed to generate donations report. ' + e.message);
                  }
                }}>
                  📄 Download Donations PDF
                </button>
                {openCard==='donations' && (
                  <div className="mt-3">
                    {loading ? (
                      <div className="text-sm text-gray-500">Loading...</div>
                    ) : (
                      <div className="overflow-x-auto bg-white border rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Donor</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Email</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Method</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Amount</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Date</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200 text-sm">
                            {donations.slice(0,5).map(d => (
                              <tr key={d._id}>
                                <td className="px-4 py-2 whitespace-nowrap">{d.donorName}</td>
                                <td className="px-4 py-2 whitespace-nowrap">{d.email}</td>
                                <td className="px-4 py-2 whitespace-nowrap">{d.paymentMethod}</td>
                                <td className="px-4 py-2 whitespace-nowrap">{`Rs. ${Number(d.amount).toLocaleString('en-LK', {minimumFractionDigits:2, maximumFractionDigits:2})}`}</td>
                                <td className="px-4 py-2 whitespace-nowrap">{d.date ? new Date(d.date).toISOString().slice(0,10) : '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {donations.length > 5 && <div className="px-4 py-2 text-xs text-gray-500">Showing first 5 records</div>}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Inspections Report Card */}
              <div className={`report-card inspections-card ${openCard==='inspections' ? 'ring-2 ring-amber-400 scale-[1.01]' : ''}`} onClick={()=>setOpenCard(openCard==='inspections'?null:'inspections')} style={{cursor:'pointer'}}>
                <div className="report-card-header">
                  <h3 className="report-card-title">Inspections Report</h3>
                </div>
                <p className="report-card-description">
                  Generate a detailed report of equipment inspections with condition analysis and inspector details.
                </p>
                <div className="report-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Inspections:</span>
                    <span className="stat-value">{inspections.length}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Different Conditions:</span>
                    <span className="stat-value">{Array.from(new Set(inspections.map(r => r.condition))).length}</span>
                  </div>
                </div>
                <button className="download-btn inspections-btn" onClick={async (e)=>{
                  e.stopPropagation();
                  try {
                    const inspResp = await stationOfficerApi.getAllInspections();
                    const list = (inspResp.inspections || inspResp.data || []).map(r => ({
                      item: r.itemName || r.item || '-',
                      condition: r.condition || '-',
                      inspector: r.inspectorName || r.inspector || '-',
                      date: r.inspectionDate ? new Date(r.inspectionDate).toISOString().slice(0,10) : '-'
                    }));

                    const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
                    const pdfDoc = await PDFDocument.create();
                    let page = pdfDoc.addPage([595.28, 841.89]);
                    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
                    let y = 800;
                    page.drawText('Inspections Report', { x: 50, y, size: 18, font });
                    y -= 30;
                    const headers = ['Item','Condition','Inspector','Date'];
                    const colX = [50, 260, 400, 500];
                    headers.forEach((h,i)=> page.drawText(h, { x: colX[i], y, size: 11, font }));
                    y -= 15;
                    page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 0.5, color: rgb(0,0,0) });
                    y -= 12;
                    for (const row of list) {
                      if (y < 60) {
                        y = 800;
                        const p = pdfDoc.addPage([595.28, 841.89]);
                        p.drawText('Inspections Report (cont.)', { x: 50, y, size: 12, font });
                        y -= 24;
                        ['Item','Condition','Inspector','Date'].forEach((h,i)=> p.drawText(h, { x: colX[i], y, size: 11, font }));
                        y -= 15;
                        p.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 0.5, color: rgb(0,0,0) });
                        y -= 12;
                        page = p;
                      }
                      page.drawText(String(row.item || '-'), { x: 50, y, size: 10, font });
                      page.drawText(String(row.condition || '-'), { x: 260, y, size: 10, font });
                      page.drawText(String(row.inspector || '-'), { x: 400, y, size: 10, font });
                      page.drawText(String(row.date || '-'), { x: 500, y, size: 10, font });
                      y -= 14;
                    }
                    const uri = URL.createObjectURL(new Blob([await pdfDoc.save()], { type: 'application/pdf' }));
                    const a = document.createElement('a');
                    a.href = uri;
                    a.download = 'inspections-report.pdf';
                    a.click();
                    URL.revokeObjectURL(uri);
                  } catch (e) {
                    alert('Failed to generate inspections report. ' + e.message);
                  }
                }}>
                  📄 Download Inspections PDF
                </button>
                {openCard==='inspections' && (
                  <div className="mt-3">
                    {loading ? (
                      <div className="text-sm text-gray-500">Loading...</div>
                    ) : (
                      <div className="overflow-x-auto bg-white border rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Item</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Condition</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Inspector</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Date</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200 text-sm">
                            {inspections.slice(0,5).map(r => (
                              <tr key={r._id}>
                                <td className="px-4 py-2 whitespace-nowrap">{r.itemName}</td>
                                <td className="px-4 py-2 whitespace-nowrap">{r.condition}</td>
                                <td className="px-4 py-2 whitespace-nowrap">{r.inspectorName || '-'}</td>
                                <td className="px-4 py-2 whitespace-nowrap">{r.inspectionDate ? new Date(r.inspectionDate).toISOString().slice(0,10) : '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {inspections.length > 5 && <div className="px-4 py-2 text-xs text-gray-500">Showing first 5 records</div>}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Inventory Report Card */}
              <div className={`report-card inventory-card ${openCard==='inventory' ? 'ring-2 ring-blue-400 scale-[1.01]' : ''}`} onClick={()=>setOpenCard(openCard==='inventory'?null:'inventory')} style={{cursor:'pointer'}}>
                <div className="report-card-header">
                  <h3 className="report-card-title">Inventory Report</h3>
                </div>
                <p className="report-card-description">
                  Generate a complete inventory report with category breakdowns and item details.
                </p>
                <div className="report-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Items:</span>
                    <span className="stat-value">{items.length}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Categories:</span>
                    <span className="stat-value">{Array.from(new Set(items.map(it => it.category?.name || it.categoryName || it.categorySlug || it.category))).length}</span>
                  </div>
                </div>
                <button className="download-btn inventory-btn" onClick={async (e)=>{
                  e.stopPropagation();
                  try {
                    const itemsResp = await stationOfficerApi.getAllItems();
                    const items = itemsResp.items || itemsResp.data || [];
                    const list = items.map(it => ({
                      name: it.name,
                      itemID: it.itemID || it.serialNumber || (it._id ? `ID-${String(it._id).slice(-6).toUpperCase()}` : ''),
                      condition: it.condition,
                      added: it.createdAt ? new Date(it.createdAt).toISOString().slice(0,10) : (it.updatedAt ? new Date(it.updatedAt).toISOString().slice(0,10) : '-')
                    }));

                    const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
                    const pdfDoc = await PDFDocument.create();
                    const page = pdfDoc.addPage([595.28, 841.89]);
                    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
                    let y = 800;
                    page.drawText('Inventory Items Report', { x: 50, y, size: 18, font });
                    y -= 30;
                    const headers = ['Item Name','Item ID','Condition','Added'];
                    const colX = [50, 250, 380, 470];
                    headers.forEach((h,i)=> page.drawText(h, { x: colX[i], y, size: 11, font }));
                    y -= 15;
                    page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 0.5, color: rgb(0,0,0) });
                    y -= 12;
                    list.forEach(row => {
                      if (y < 60) {
                        y = 800;
                        const p = pdfDoc.addPage([595.28, 841.89]);
                        p.drawText('Inventory Items Report (cont.)', { x: 50, y, size: 12, font });
                        y -= 24;
                        p.drawText('Item Name', { x: 50, y, size: 11, font });
                        p.drawText('Item ID', { x: 250, y, size: 11, font });
                        p.drawText('Condition', { x: 380, y, size: 11, font });
                        p.drawText('Added', { x: 470, y, size: 11, font });
                        y -= 15;
                        p.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 0.5, color: rgb(0,0,0) });
                        y -= 12;
                        page = p; // switch current page variable
                      }
                      page.drawText(String(row.name || '-'), { x: 50, y, size: 10, font });
                      page.drawText(String(row.itemID || '-'), { x: 250, y, size: 10, font });
                      page.drawText(String(row.condition || '-'), { x: 380, y, size: 10, font });
                      page.drawText(String(row.added || '-'), { x: 470, y, size: 10, font });
                      y -= 14;
                    });
                    const uri = URL.createObjectURL(new Blob([await pdfDoc.save()], { type: 'application/pdf' }));
                    const a = document.createElement('a');
                    a.href = uri;
                    a.download = 'inventory-report.pdf';
                    a.click();
                    URL.revokeObjectURL(uri);
                  } catch (e) {
                    alert('Failed to generate inventory report. ' + e.message);
                  }
                }}>
                  📄 Download Inventory PDF
                </button>
                {openCard==='inventory' && (
                  <div className="mt-3">
                    {loading ? (
                      <div className="text-sm text-gray-500">Loading...</div>
                    ) : (
                      <div className="overflow-x-auto bg-white border rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Item Name</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Item ID</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Condition</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Added</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200 text-sm">
                            {items.slice(0,5).map(it => (
                              <tr key={it._id}>
                                <td className="px-4 py-2 whitespace-nowrap">{it.name}</td>
                                <td className="px-4 py-2 whitespace-nowrap">{it.itemID || it.serialNumber || (it._id?`ID-${String(it._id).slice(-6).toUpperCase()}`:'')}</td>
                                <td className="px-4 py-2 whitespace-nowrap">{it.condition}</td>
                                <td className="px-4 py-2 whitespace-nowrap">{it.createdAt ? new Date(it.createdAt).toISOString().slice(0,10) : (it.updatedAt ? new Date(it.updatedAt).toISOString().slice(0,10) : '-')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {items.length > 5 && <div className="px-4 py-2 text-xs text-gray-500">Showing first 5 records</div>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Data Summary Section removed as requested */}
        </div>
      </main>
    </div>
  );
}

export default Reports;