import React, { useEffect, useState, useContext } from 'react';
import { listInspections, createInspection, deleteInspection, listItems, updateItem } from './inspectionsApi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileText, Download } from 'lucide-react';
import EmergencyBanner from './src/Components/EmergencyBanner.jsx';
import { AppContext } from './src/context/AppContext.jsx';

export default function Inspections() {
  const { emergencyMode, setEmergencyMode } = useContext(AppContext);
  const [inspections, setInspections] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inspectionType, setInspectionType] = useState('weekly');
  const [missingItems, setMissingItems] = useState([]);
  const [openCard, setOpenCard] = useState(null); // 'cr' | 'na' | 'mi' | null
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Form state
  const [formData, setFormData] = useState({
    itemId: '',
    itemName: '',
    condition: 'Good',
    inspectorName: '',
    comments: '',
    isMissing: false
  });

  const handleMainMenuClick = () => {
    window.location.href = '/';
  };

  const fetchInspections = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listInspections();
      const list = Array.isArray(data) ? data : [];
      setInspections(list);
      // Calculate missing items on fresh payload
      const missing = list.filter(inspection => inspection.isMissing || inspection.condition === 'Missing');
      setMissingItems(missing);
    } catch (e) {
      console.error('Failed to load inspections', e);
      setError('Failed to load inspections. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const data = await listItems();
      const all = Array.isArray(data) ? data : [];
      setItems(all);
    } catch (e) {
      console.error('Failed to load items', e);
    }
  };

  useEffect(() => {
    fetchInspections();
    fetchItems();
  }, []);

  // Refresh items when user switches between Weekly and New Item tabs
  useEffect(() => {
    fetchItems();
  }, [inspectionType]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'itemId') {
      const chosen = items.find(i => i._id === value);
      setFormData(prev => ({
        ...prev,
        itemId: value,
        itemName: chosen ? chosen.name : ''
      }));
    } else if (name === 'isMissing') {
      const isMissing = type === 'checkbox' ? checked : value === 'true';
      setFormData(prev => ({
        ...prev,
        isMissing,
        condition: inspectionType === 'weekly' && isMissing ? 'Missing' : prev.condition
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const now = new Date();
      const next = new Date(now);
      next.setDate(now.getDate() + 7);
      const inspectionData = {
        itemId: formData.itemId,
        itemName: formData.itemName,
        condition: formData.condition,
        inspectorName: formData.inspectorName,
        notes: formData.comments,
        inspectionType: inspectionType === 'weekly' ? 'Weekly' : 'New Item',
        date: now.toISOString(),
        nextInspectionDate: next.toISOString(),
        isMissing: formData.isMissing,
        status: 'Active'
      };

      const saved = await createInspection(inspectionData);
      // Update inventory item accordingly
      if (inspectionType === 'new-item') {
        if (formData.itemId) {
          await updateItem(formData.itemId, {
            condition: formData.condition,
            lastInspection: now.toISOString(),
            nextInspection: next.toISOString()
          });
          // Optimistically update local list so it disappears from Pending list immediately
          setItems(prev => prev.map(i => i._id === formData.itemId ? {
            ...i,
            condition: formData.condition,
            lastInspection: now.toISOString(),
            nextInspection: next.toISOString()
          } : i));
          // Reflect in inspections state immediately
          setInspections(prev => [{
            _id: saved?._id,
            itemName: formData.itemName,
            inspectionType: 'New Item',
            condition: formData.condition,
            inspectorName: formData.inspectorName,
            inspectionDate: now.toISOString(),
            isMissing: false
          }, ...prev]);
        }
      } else if (inspectionType === 'weekly') {
        if (formData.itemId) {
          const newCondition = formData.isMissing ? 'Missing' : formData.condition;
          await updateItem(formData.itemId, {
            condition: newCondition,
            lastInspection: now.toISOString(),
            nextInspection: next.toISOString()
          });
          setItems(prev => prev.map(i => i._id === formData.itemId ? {
            ...i,
            condition: newCondition,
            lastInspection: now.toISOString(),
            nextInspection: next.toISOString()
          } : i));
          setInspections(prev => [{
            _id: saved?._id,
            itemName: formData.itemName,
            inspectionType: 'Weekly',
            condition: newCondition,
            inspectorName: formData.inspectorName,
            inspectionDate: now.toISOString(),
            isMissing: formData.isMissing
          }, ...prev]);
          if (formData.isMissing) {
            setMissingItems(prev => [...prev, {
              _id: saved?._id,
              itemName: formData.itemName,
              condition: 'Missing',
              inspectorName: formData.inspectorName,
              inspectionDate: now.toISOString(),
              isMissing: true
            }]);
          }
        }
      }
      setFormData({
        itemId: '',
        itemName: '',
        condition: 'Good',
        inspectorName: '',
        comments: '',
        isMissing: false
      });
      fetchInspections();
      fetchItems();
      alert('Inspection saved successfully!');
    } catch (e) {
      alert('Failed to save inspection: ' + e.message);
    }
  };

  const resetForm = () => {
    setFormData({
      itemName: '',
      condition: 'Good',
      inspectorName: '',
      comments: '',
      isMissing: false
    });
  };

  const conditionStyles = (cond) => {
    switch (cond) {
      case 'Pending Inspection': return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'Good': return 'bg-green-50 text-green-700 border-green-200';
      case 'Fair': return 'bg-yellow-50 text-yellow-800 border-yellow-300';
      case 'Poor': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Out of Service': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return '—';
    }
  };

  // PDF Generation Function
  const generateInspectionPDF = (selectedDate) => {
    const doc = new jsPDF();

    // Get inspections for the selected date
    const selectedDateStr = new Date(selectedDate).toDateString();
    const todaysInspections = inspections.filter(inspection => {
      const inspectionDate = new Date(inspection.inspectionDate || inspection.date);
      return inspectionDate.toDateString() === selectedDateStr;
    });

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Fire Brigade Inspection Report', 20, 30);

    // Date and station info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Report Date: ${selectedDate}`, 20, 45);
    doc.text(`Station: FireLink Lanka`, 20, 55);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 65);

    // Summary statistics
    const confirmedReadiness = todaysInspections.filter(i => i.condition === 'Good' || i.condition === 'Fair').length;
    const needsAttention = todaysInspections.filter(i => i.condition === 'Poor').length;
    const missingCount = todaysInspections.filter(i => i.isMissing || i.condition === 'Missing').length;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 20, 85);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`• Confirmed Readiness: ${confirmedReadiness} items`, 20, 95);
    doc.text(`• Needs Attention: ${needsAttention} items`, 20, 105);
    doc.text(`• Missing Items: ${missingCount} items`, 20, 115);
    doc.text(`• Total Inspections: ${todaysInspections.length} items`, 20, 125);

    // Check if there are no inspections for the selected date
    if (todaysInspections.length === 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('No inspections found for the selected date.', 20, 150);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Please select a different date or check if inspections have been recorded.', 20, 160);
    } else {
      // Table data
      const tableData = todaysInspections.map(inspection => [
        inspection.itemName || 'N/A',
        inspection.inspectionType || 'Weekly',
        inspection.condition || 'N/A',
        inspection.inspectorName || 'N/A',
        formatDate(inspection.inspectionDate || inspection.date),
        inspection.notes || inspection.comments || 'No notes'
      ]);

      // Add table
      autoTable(doc, {
        startY: 140,
        head: [['Item Name', 'Type', 'Condition', 'Inspector', 'Date', 'Notes']],
        body: tableData,
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [220, 38, 38], // Fire brigade red
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 20 },
          2: { cellWidth: 25 },
          3: { cellWidth: 30 },
          4: { cellWidth: 25 },
          5: { cellWidth: 50 },
        },
      });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Page ${i} of ${pageCount}`, 20, doc.internal.pageSize.height - 10);
      doc.text('FireLink Lanka', doc.internal.pageSize.width - 80, doc.internal.pageSize.height - 10);
    }

    // Save the PDF
    const fileName = `Inspection_Report_${selectedDate.replace(/-/g, '_')}.pdf`;
    doc.save(fileName);

    // Show success message
    alert(`PDF report generated successfully!\n\nFile: ${fileName}\nDate: ${selectedDate}\nInspections: ${todaysInspections.length}`);
  };

  // Calculate summary statistics
  const confirmedReadiness = inspections.filter(i => i.condition === 'Good' || i.condition === 'Fair').length;
  const needsAttention = inspections.filter(i => i.condition === 'Poor').length;
  const missingCount = inspections.filter(i => i.isMissing || i.condition === 'Missing').length;

  const crRows = inspections.filter(i => i.condition === 'Good' || i.condition === 'Fair');
  const naRows = inspections.filter(i => i.condition === 'Poor');
  const miRows = inspections.filter(i => i.isMissing || i.condition === 'Missing');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Emergency Banner - Only show in emergency mode */}
      {emergencyMode && <EmergencyBanner message="EMERGENCY MODE ACTIVE - INSPECTIONS ON HIGH ALERT" />}

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-6 max-w-[1400px] mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Inspection Management</h2>
            <p className="text-gray-600 mt-1">Weekly, After Repair, and New In Service inspections</p>
          </div>
          <div className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm font-semibold">
            {inspections.length} Total Inspections
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Select Inspection Type */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Inspection Type</h3>
            <div className="flex gap-4">
              <button
                onClick={() => setInspectionType('weekly')}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${inspectionType === 'weekly'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Weekly Inspection
              </button>
              <button
                onClick={() => setInspectionType('new-item')}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${inspectionType === 'new-item'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                New Item Inspection
              </button>
            </div>
          </div>

          {/* Weekly Inspection Form */}
          {inspectionType === 'weekly' && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Weekly Inspection</h3>
                  <p className="text-sm text-gray-600">Inspect items currently in service</p>
                </div>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
                    <select
                      name="itemId"
                      value={formData.itemId}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">No items due today</option>
                      {items.filter(i => i.condition !== 'Pending Inspection').map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name} ({item.categorySlug}){item.nextInspection ? `  –  ${formatDate(item.nextInspection)}` : ''}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Items reappear here on their Next Inspection date</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Condition *</label>
                    <select
                      name="condition"
                      value={formData.condition}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      disabled={inspectionType === 'weekly' && formData.isMissing}
                      required
                    >
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                      <option value="Missing">Missing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Inspection Type *</label>
                    <input
                      type="text"
                      value="Weekly"
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Inspector Name *</label>
                    <input
                      type="text"
                      name="inspectorName"
                      value={formData.inspectorName}
                      onChange={handleFormChange}
                      placeholder="Enter inspector name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Item Missing Checkbox */}
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isMissing"
                      checked={formData.isMissing}
                      onChange={handleFormChange}
                      className="mr-3"
                    />
                    <span className="text-red-800 font-medium">Item Missing</span>
                  </label>
                </div>

                {/* Comments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                  <textarea
                    name="comments"
                    value={formData.comments}
                    onChange={handleFormChange}
                    rows={4}
                    placeholder="Enter comments or notes about the inspection"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Generate Inspection Checklist */}
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                        <FileText className="h-3 w-3 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Generate Inspection Checklist</h4>
                        <p className="text-sm text-gray-600">Download a printable PDF checklist for inspections</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => generateInspectionPDF(selectedDate)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download PDF
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                  >
                    Save Inspection
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md"
                  >
                    Reset Form
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* New Item Inspection Form */}
          {inspectionType === 'new-item' && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">🆕</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">New Item Inspection</h3>
                  <p className="text-sm text-gray-600">Inspect new items pending approval</p>
                </div>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
                    <select
                      name="itemId"
                      value={formData.itemId}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select new item for inspection</option>
                      {items.filter(i => i.condition === 'Pending Inspection').map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name} ({item.categorySlug})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Select a new item that needs inspection</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Condition *</label>
                    <select
                      name="condition"
                      value={formData.condition}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Inspection Type *</label>
                    <input
                      type="text"
                      value="New Item"
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Inspector Name *</label>
                    <input
                      type="text"
                      name="inspectorName"
                      value={formData.inspectorName}
                      onChange={handleFormChange}
                      placeholder="Enter inspector name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                  <textarea
                    name="comments"
                    value={formData.comments}
                    onChange={handleFormChange}
                    rows={4}
                    placeholder="Enter comments or notes about the inspection"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                  >
                    Save Inspection
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md"
                  >
                    Reset Form
                  </button>
                </div>
              </form>
            </div>
          )}



          {/* Inspection Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button onClick={() => setOpenCard(openCard === 'cr' ? null : 'cr')} className={`${confirmedReadiness > 0 ? 'bg-blue-600' : 'bg-gray-500'} text-white rounded-lg p-6 text-left w-full`}>
              <h4 className="text-lg font-semibold mb-2">Confirmed Readiness</h4>
              <p className="text-3xl font-bold">{confirmedReadiness}</p>
            </button>
            <button onClick={() => setOpenCard(openCard === 'na' ? null : 'na')} className={`${needsAttention > 0 ? 'bg-orange-500' : 'bg-gray-500'} text-white rounded-lg p-6 text-left w-full`}>
              <h4 className="text-lg font-semibold mb-2">Needs Attention</h4>
              <p className="text-3xl font-bold">{needsAttention}</p>
            </button>
            <button onClick={() => setOpenCard(openCard === 'mi' ? null : 'mi')} className={`${missingCount > 0 ? 'bg-red-500' : 'bg-gray-500'} text-white rounded-lg p-6 text-left w-full`}>
              <h4 className="text-lg font-semibold mb-2">Missing Items</h4>
              <p className="text-3xl font-bold">{missingCount}</p>
            </button>
          </div>

          {openCard === 'cr' && (
            <div className="mt-4 bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-3 border-b font-semibold">Items with condition Good or Fair</div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inspection Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inspector</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Checked</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {crRows.map((r, idx) => (
                      <tr key={r._id || idx} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-gray-900">{r.itemName}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{r.inspectionType || 'Weekly'}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${conditionStyles(r.condition)}`}>{r.condition}</span>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-500">{r.notes || r.comments || '—'}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{r.inspectorName || r.inspector || '—'}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{formatDate(r.inspectionDate || r.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {openCard === 'na' && (
            <div className="mt-4 bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-3 border-b font-semibold">Items with condition Poor</div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inspection Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inspector</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Checked</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {naRows.map((r, idx) => (
                      <tr key={r._id || idx} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-gray-900">{r.itemName}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{r.inspectionType || 'Weekly'}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${conditionStyles(r.condition)}`}>{r.condition}</span>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-500">{r.notes || r.comments || '—'}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{r.inspectorName || r.inspector || '—'}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{formatDate(r.inspectionDate || r.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {openCard === 'mi' && (
            <div className="mt-4 bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-3 border-b font-semibold">Items marked Missing</div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inspection Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inspector</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Checked</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {miRows.map((r, idx) => (
                      <tr key={r._id || idx} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-gray-900">{r.itemName}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{r.inspectionType || 'Weekly'}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${conditionStyles(r.condition)}`}>{r.condition}</span>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-500">{r.notes || r.comments || '—'}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{r.inspectorName || r.inspector || '—'}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{formatDate(r.inspectionDate || r.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent Inspections section removed as requested */}
        </div>

        {/* Emergency Mode Bottom Buttons */}
        {emergencyMode && (
          <div className="bg-white border-t-2 border-red-500 shadow-lg p-2">
            <div className="flex justify-between items-center">
              {/* Exit Emergency Mode Button - Left */}
              <button
                onClick={() => {
                  setEmergencyMode(false);
                  window.location.href = '/station-officer';
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2 text-sm"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                </svg>
                <span>EXIT EMERGENCY</span>
              </button>

              {/* Emergency Status Indicator */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-600 font-bold text-sm">EMERGENCY ACTIVE</span>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </div>

              {/* Spacer for right side */}
              <div className="w-32"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
