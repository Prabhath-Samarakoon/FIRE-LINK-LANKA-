import React, { useState, useEffect } from 'react';

const PaymentList = ({ payments, loading, onEdit, onAction, onView, filters, onFilterChange }) => {
  const [staffList, setStaffList] = useState([]);

  useEffect(() => {
    fetchStaffList();
  }, []);

  // Debug: Log payments data
  useEffect(() => {
    console.log('PaymentList received payments:', payments);
    console.log('PaymentList loading state:', loading);
  }, [payments, loading]);

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

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'bg-yellow-100 text-yellow-800', text: 'Pending', icon: '⏳' },
      approved: { class: 'bg-green-100 text-green-800', text: 'Approved', icon: '✅' },
      paid: { class: 'bg-blue-100 text-blue-800', text: 'Paid', icon: '💰' },
      cancelled: { class: 'bg-red-100 text-red-800', text: 'Cancelled', icon: '❌' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>
        <span>{config.icon}</span>
        {config.text}
      </span>
    );
  };

  const getPaymentTypeBadge = (type) => {
    const typeConfig = {
      salary: { class: 'bg-blue-100 text-blue-800', text: 'Salary', icon: '💼' },
      overtime: { class: 'bg-yellow-100 text-yellow-800', text: 'Overtime', icon: '⏰' },
      bonus: { class: 'bg-green-100 text-green-800', text: 'Bonus', icon: '🎁' },
      allowance: { class: 'bg-purple-100 text-purple-800', text: 'Allowance', icon: '💵' },
      deduction: { class: 'bg-red-100 text-red-800', text: 'Deduction', icon: '📉' },
      advance: { class: 'bg-cyan-100 text-cyan-800', text: 'Advance', icon: '🚀' }
    };
    
    const config = typeConfig[type] || { class: 'bg-gray-100 text-gray-800', text: type, icon: '💳' };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>
        <span>{config.icon}</span>
        {config.text}
      </span>
    );
  };

  const formatCurrency = (amount, currency = 'LKR') => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleAction = async (payment, action) => {
    let data = {};
    
    if (action === 'approve') {
      data = { approvedBy: 'current-user-id' }; // You might want to get this from auth context
    } else if (action === 'paid') {
      data = { transactionId: `TXN-${Date.now()}` };
    } else if (action === 'delete') {
      if (!window.confirm(`Are you sure you want to delete the payment for ${payment.staffName}?`)) {
        return;
      }
    }

    const success = await onAction(payment._id, action, data);
    if (success) {
      // Show success message or update UI
      console.log(`Payment ${action} successful`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="text-center text-gray-600">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filters.paymentType}
            onChange={(e) => onFilterChange({ paymentType: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="salary">Salary</option>
            <option value="overtime">Overtime</option>
            <option value="bonus">Bonus</option>
            <option value="allowance">Allowance</option>
            <option value="deduction">Deduction</option>
            <option value="advance">Advance</option>
          </select>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="grid grid-cols-6 gap-5 px-6 py-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700 text-sm">
          <div>Staff Member</div>
          <div>Type</div>
          <div>Amount</div>
          <div>Payment Date</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {!payments || payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <span className="text-4xl mb-4">📋</span>
              <p className="text-lg font-medium">No payments found</p>
              {!payments && <p className="text-sm text-gray-400 mt-2">Loading payments...</p>}
              {payments && payments.length === 0 && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md text-center">
                  <p className="text-blue-800 text-sm">
                    <strong>No payment records found.</strong> 
                    <br />
                    To add payments, click the "Add Payment" button above.
                    <br />
                    <em>Make sure MongoDB is running and the backend server is started.</em>
                  </p>
                </div>
              )}
            </div>
          ) : (
            payments.map((payment) => (
              <div key={payment._id} className="grid grid-cols-6 gap-5 px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col">
                  <div className="font-semibold text-gray-900">{payment.staffName}</div>
                  <div className="text-xs text-gray-500">ID: {payment.staffId}</div>
                </div>
                
                <div className="flex items-center">
                  {getPaymentTypeBadge(payment.paymentType)}
                </div>
                
                <div className="flex items-center">
                  <div className="font-semibold text-gray-900">{formatCurrency(payment.amount, payment.currency)}</div>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  {formatDate(payment.paymentDate)}
                </div>
                
                <div className="flex items-center">
                  {getStatusBadge(payment.status)}
                </div>
                
                <div className="flex items-center">
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                      onClick={() => onView && onView(payment)}
                    >
                      View
                    </button>
                    
                    <button
                      className="px-3 py-1 text-xs font-medium text-yellow-600 bg-yellow-50 hover:bg-yellow-100 rounded-md transition-colors"
                      onClick={() => onEdit(payment)}
                    >
                      Edit
                    </button>
                    
                    <button
                      className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                      onClick={() => handleAction(payment, 'delete')}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentList;
