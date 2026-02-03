import React, { useState, useEffect } from 'react';

const PaymentForm = ({ payment, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    staffId: '',
    paymentType: 'salary',
    amount: '',
    currency: 'LKR',
    paymentDate: new Date().toISOString().split('T')[0],
    payPeriod: {
      startDate: '',
      endDate: ''
    },
    paymentMethod: 'bank_transfer',
    bankDetails: {
      accountNumber: '',
      bankName: '',
      branchName: ''
    },
    description: '',
    notes: '',
    email: '' // Simple email field
  });

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStaffList();
    if (payment) {
      setFormData({
        staffId: payment.staffId || '',
        paymentType: payment.paymentType || 'salary',
        amount: payment.amount || '',
        currency: payment.currency || 'LKR',
        paymentDate: payment.paymentDate ? new Date(payment.paymentDate).toISOString().split('T')[0] : '',
        payPeriod: {
          startDate: payment.payPeriod?.startDate ? new Date(payment.payPeriod.startDate).toISOString().split('T')[0] : '',
          endDate: payment.payPeriod?.endDate ? new Date(payment.payPeriod.endDate).toISOString().split('T')[0] : ''
        },
        paymentMethod: payment.paymentMethod || 'bank_transfer',
        bankDetails: {
          accountNumber: payment.bankDetails?.accountNumber || '',
          bankName: payment.bankDetails?.bankName || '',
          branchName: payment.bankDetails?.branchName || ''
        },
        description: payment.description || '',
        notes: payment.notes || '',
        email: payment.email || ''
      });
    }
  }, [payment]);

  const fetchStaffList = async () => {
    try {
      const response = await fetch('http://localhost:5000/Users');
      const data = await response.json();
      if (data.success || data.data) {
        setStaffList(data.data || data.Users || []);
      }
    } catch (error) {
      console.error('Error fetching staff list:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('payPeriod.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        payPeriod: {
          ...prev.payPeriod,
          [field]: value
        }
      }));
    } else if (name.startsWith('bankDetails.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Find the selected staff member's name
      const selectedStaff = staffList.find(staff => staff._id === formData.staffId);
      const staffName = selectedStaff ? selectedStaff.name : '';

      // Prepare the data to send
      const submitData = {
        ...formData,
        staffName: staffName
      };

      const url = payment 
        ? `http://localhost:5000/api/payments/${payment._id}`
        : 'http://localhost:5000/api/payments';
      
      const method = payment ? 'PUT' : 'POST';

      console.log('Submitting payment data:', submitData);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();
      console.log('Payment API response:', data);

      if (data.success) {
        onSave();
      } else {
        setError(data.message || 'Failed to save payment');
      }
    } catch (error) {
      console.error('Error saving payment:', error);
      setError('Failed to save payment');
    } finally {
      setLoading(false);
    }
  };

  const paymentTypes = [
    { value: 'salary', label: 'Salary', icon: '💼' },
    { value: 'overtime', label: 'Overtime', icon: '⏰' },
    { value: 'bonus', label: 'Bonus', icon: '🎁' },
    { value: 'allowance', label: 'Allowance', icon: '💵' },
    { value: 'deduction', label: 'Deduction', icon: '📉' },
    { value: 'advance', label: 'Advance', icon: '🚀' }
  ];

  const paymentMethods = [
    { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
    { value: 'cash', label: 'Cash', icon: '💵' },
    { value: 'cheque', label: 'Cheque', icon: '📄' },
    { value: 'digital_wallet', label: 'Digital Wallet', icon: '📱' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{payment ? 'Edit Payment' : 'Add New Payment'}</h2>
          <button 
            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors font-medium" 
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
            <span className="text-xl">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="staffId" className="block text-sm font-semibold text-gray-700">Staff Member *</label>
              <select
                id="staffId"
                name="staffId"
                value={formData.staffId}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              >
                <option value="">Select Staff Member</option>
                {staffList.map(staff => (
                  <option key={staff._id} value={staff._id}>
                    {staff.name} - {staff.position || 'No Position'}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="paymentType" className="block text-sm font-semibold text-gray-700">Payment Type *</label>
              <select
                id="paymentType"
                name="paymentType"
                value={formData.paymentType}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              >
                {paymentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="amount" className="block text-sm font-semibold text-gray-700">Amount *</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                placeholder="Enter amount"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="currency" className="block text-sm font-semibold text-gray-700">Currency</label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              >
                <option value="LKR">LKR (Sri Lankan Rupee)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="EUR">EUR (Euro)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="paymentDate" className="block text-sm font-semibold text-gray-700">Payment Date *</label>
              <input
                type="date"
                id="paymentDate"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="paymentMethod" className="block text-sm font-semibold text-gray-700">Payment Method</label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              >
                {paymentMethods.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.icon} {method.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="payPeriod.startDate" className="block text-sm font-semibold text-gray-700">Pay Period Start</label>
              <input
                type="date"
                id="payPeriod.startDate"
                name="payPeriod.startDate"
                value={formData.payPeriod.startDate}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="payPeriod.endDate" className="block text-sm font-semibold text-gray-700">Pay Period End</label>
              <input
                type="date"
                id="payPeriod.endDate"
                name="payPeriod.endDate"
                value={formData.payPeriod.endDate}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              />
            </div>
          </div>

          {formData.paymentMethod === 'bank_transfer' && (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="bankDetails.accountNumber" className="block text-sm font-semibold text-gray-700">Account Number</label>
                  <input
                    type="text"
                    id="bankDetails.accountNumber"
                    name="bankDetails.accountNumber"
                    value={formData.bankDetails.accountNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="Enter account number"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="bankDetails.bankName" className="block text-sm font-semibold text-gray-700">Bank Name</label>
                  <input
                    type="text"
                    id="bankDetails.bankName"
                    name="bankDetails.bankName"
                    value={formData.bankDetails.bankName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="Enter bank name"
                  />
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <label htmlFor="bankDetails.branchName" className="block text-sm font-semibold text-gray-700">Branch Name</label>
                <input
                  type="text"
                  id="bankDetails.branchName"
                  name="bankDetails.branchName"
                  value={formData.bankDetails.branchName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  placeholder="Enter branch name"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 resize-vertical min-h-[100px]"
              placeholder="Enter payment description"
              rows="3"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className="block text-sm font-semibold text-gray-700">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 resize-vertical min-h-[80px]"
              placeholder="Additional notes (optional)"
              rows="2"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
              📧 Send Email To
            </label>
            <textarea
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 resize-vertical min-h-[60px]"
              placeholder="Enter email address to send payment notification (optional)"
              rows="2"
            />
            <p className="text-sm text-gray-500">
              Enter an email address to send payment details to. Leave empty if no email notification needed.
            </p>
          </div>

          <div className="flex gap-4 justify-end pt-6 border-t border-gray-200">
            <button
              type="button"
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={loading}
            >
              {loading ? 'Saving...' : (payment ? 'Update Payment' : 'Create Payment')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;
