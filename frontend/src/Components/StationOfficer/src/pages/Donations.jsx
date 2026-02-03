import React, { useState, useEffect } from 'react';
import stationOfficerApi from '../services/stationOfficerApi';

function Donations({ onNavigate }) {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    donorName: '',
    email: '',
    paymentMethod: 'Cash',
    amount: '',
    date: new Date().toISOString().slice(0,10),
    sendEmail: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const load = async () => {
    try {
      setLoading(true);
      const response = await stationOfficerApi.getAllDonations();
      if (response.success) {
        setDonations(response.donations || []);
      } else {
        throw new Error(response.message || 'Failed to load donations');
      }
      setError('');
    } catch (e) {
      setError('Failed to load donations');
      console.error('Error loading donations:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleMainMenuClick = () => {
    if (onNavigate) {
      onNavigate('home');
    } else {
      window.location.href = '/';
    }
  };

  const handleOpen = () => { setEditingId(null); setForm({ donorName: '', email: '', paymentMethod: 'Cash', amount: '', date: new Date().toISOString().slice(0,10), sendEmail: '' }); setOpen(true); };
  const handleClose = () => { setOpen(false); setEditingId(null); };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    const donorName = (form.donorName || '').trim().replace(/\s+/g, ' ');
    const email = (form.email || '').trim().toLowerCase();
    const amount = form.amount === '' ? '' : Number(form.amount);
    const paymentMethod = (form.paymentMethod || '').trim();
    const date = form.date;
    if (!donorName || donorName.length < 2) errs.donorName = 'Donor name must be at least 2 characters';
    if (!email || !/^\S+@\S+\.[\S]+$/.test(email)) errs.email = 'Enter a valid email';
    if (amount === '' || !Number.isFinite(amount) || amount < 0) errs.amount = 'Enter a valid amount';
    if (!paymentMethod) errs.paymentMethod = 'Select a payment method';
    if (!date) errs.date = 'Choose a date';
    return { errs, values: { donorName, email, amount, paymentMethod, date } };
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setFieldErrors({});
      const { errs, values } = validate();
      if (Object.keys(errs).length) {
        setFieldErrors(errs);
        return;
      }
      const payload = {
        donorName: values.donorName,
        email: values.email,
        paymentMethod: values.paymentMethod,
        amount: values.amount,
        date: new Date(values.date),
        sendEmail: form.sendEmail
      };
      console.log('📤 Sending donation payload:', payload);
      const response = editingId
        ? await stationOfficerApi.updateDonation(editingId, payload)
        : await stationOfficerApi.createDonation(payload);
      if (!response?.success) throw new Error(response?.message || 'Failed to save donation');
      setForm({ donorName: '', email: '', paymentMethod: 'Cash', amount: '', date: new Date().toISOString().slice(0,10), sendEmail: '' });
      setOpen(false);
      await load();
    } catch (e) {
      const msg = e?.response?.data?.message || e.message;
      setError('Failed to save donation: ' + msg);
    }
  };

  const onDelete = async (row) => {
    if (!window.confirm('Delete this donation?')) return;
    try {
      const response = await stationOfficerApi.deleteDonation(row._id);
      if (response.success) {
        await load();
      } else {
        throw new Error(response.message || 'Failed to delete donation');
      }
    } catch (e) {
      setError('Failed to delete donation: ' + e.message);
      console.error('Error deleting donation:', e);
    }
  };

  const onClear = () => {
    if (!window.confirm('Clear all donations from view? (This will not delete from database)')) return;
    try {
      setDonations([]);
      setError('');
    } catch (e) {
      setError('Failed to clear donations view: ' + e.message);
      console.error('Error clearing donations view:', e);
    }
  };

  const exportPdf = async () => {
    try {
      // Lazy import pdf-lib; requires `npm i pdf-lib`
      const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const title = 'Donation Form';
      page.drawText(title, { x: 50, y: 800, size: 18, font, color: rgb(0,0,0) });

      const labels = ['Donor Name', 'Email', 'Payment Method', 'Amount', 'Date'];
      let y = 760;
      labels.forEach((label) => {
        page.drawText(label + ':', { x: 50, y, size: 12, font });
        // simple line to indicate fillable area (actual AcroForm requires more setup; this keeps it simple)
        page.drawLine({ start: { x: 160, y: y-2 }, end: { x: 545, y: y-2 }, thickness: 0.5, color: rgb(0.7,0.7,0.7) });
        y -= 40;
      });

      const uri = URL.createObjectURL(new Blob([await pdfDoc.save()], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = uri;
      a.download = 'donation-form.pdf';
      a.click();
      URL.revokeObjectURL(uri);
    } catch (e) {
      alert('PDF export requires pdf-lib. Please run: npm i pdf-lib');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Section Bar under navbar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Donations</h1>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex justify-center">
          <button onClick={handleOpen} className="px-6 py-3 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white shadow">
            Add Donation
          </button>
        </div>
        {error && <div className="mt-4 bg-red-50 border border-red-200 text-red-800 rounded p-3 text-sm">{error}</div>}

        {/* Actions above table */}
        <div className="flex items-center justify-between mt-8 mb-3">
          <h3 className="text-lg font-semibold text-gray-900">All Donations</h3>
          <div className="flex gap-2">
            <button onClick={load} className="px-4 py-2 rounded-md border bg-white hover:bg-gray-50 text-gray-700 shadow">Refresh</button>
            <button onClick={exportPdf} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow">Export PDF</button>
          </div>
        </div>

        <div className="overflow-x-auto bg-white border rounded-xl shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Donor Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Donation Date</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td className="px-6 py-4" colSpan="5">Loading...</td></tr>
              ) : donations.length === 0 ? (
                <tr><td className="px-6 py-4 text-gray-500" colSpan="5">No donations</td></tr>
              ) : donations.map(d => (
                <tr key={d._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{d.donorName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{d.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{d.paymentMethod}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{`Rs. ${Number(d.amount).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{d.date ? new Date(d.date).toISOString().slice(0,10) : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                        onClick={() => { setEditingId(d._id); setForm({ donorName: d.donorName || '', email: d.email || '', paymentMethod: d.paymentMethod || 'Cash', amount: d.amount || '', date: d.date ? new Date(d.date).toISOString().slice(0,10) : new Date().toISOString().slice(0,10) }); setOpen(true); }}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                        onClick={async ()=>{ if (!window.confirm('Delete this donation?')) return; try { const resp = await stationOfficerApi.deleteDonation(d._id); if (!resp?.success) throw new Error(resp?.message || 'Failed'); await load(); } catch (e) { alert('Delete failed: ' + e.message); } }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleClose}>
          <div className="bg-white border rounded-xl shadow-xl w-full max-w-lg mx-4" onClick={(e)=>e.stopPropagation()}>
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editingId ? 'Edit Donation' : 'Add Donation'}</h2>
              <button onClick={handleClose} className="px-2 py-1 text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 p-6">
              <div>
                <input name="donorName" value={form.donorName} onChange={onChange} required placeholder="Donor Name" className="border rounded-md px-3 py-2 w-full" />
                {fieldErrors.donorName && <div className="mt-1 text-sm text-red-600">{fieldErrors.donorName}</div>}
              </div>
              <div>
                <input type="email" name="email" value={form.email} onChange={onChange} required placeholder="Email Address" className="border rounded-md px-3 py-2 w-full" />
                {fieldErrors.email && <div className="mt-1 text-sm text-red-600">{fieldErrors.email}</div>}
              </div>
              <select name="paymentMethod" value={form.paymentMethod} onChange={onChange} className="border rounded-md px-3 py-2">
                <option>Cash</option>
                <option>Card</option>
                <option>Bank Transfer</option>
                <option>Cheque</option>
              </select>
              {fieldErrors.paymentMethod && <div className="mt-1 text-sm text-red-600">{fieldErrors.paymentMethod}</div>}
              <div>
                <input type="number" name="amount" min="0" step="0.01" value={form.amount} onChange={onChange} required placeholder="Amount" className="border rounded-md px-3 py-2 w-full" />
                {fieldErrors.amount && <div className="mt-1 text-sm text-red-600">{fieldErrors.amount}</div>}
              </div>
              <input type="date" name="date" value={form.date} onChange={(e)=>{
                const today = new Date().toISOString().slice(0,10);
                // Prevent selecting future dates
                if (e.target.value > today) {
                  e.target.value = today;
                }
                onChange(e);
              }} required max={new Date().toISOString().slice(0,10)} className="border rounded-md px-3 py-2" />
              {fieldErrors.date && <div className="-mt-2 text-sm text-red-600">{fieldErrors.date}</div>}
              
              <div className="space-y-2">
                <label htmlFor="sendEmail" className="block text-sm font-semibold text-gray-700">
                  📧 Send Email Receipt To
                </label>
                <input
                  type="email"
                  name="sendEmail"
                  value={form.sendEmail}
                  onChange={onChange}
                  placeholder="Enter email address to send donation receipt (optional)"
                  className="border rounded-md px-3 py-2 w-full"
                />
                <p className="text-sm text-gray-500">
                  Enter an email address to send donation receipt to. Leave empty if no email notification needed.
                </p>
              </div>
              
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={handleClose} className="px-4 py-2 rounded-md border">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-md">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Donations;