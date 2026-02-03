import React from 'react';

const PaymentDetails = ({ payment, onClose }) => {
  if (!payment) return null;

  const formatCurrency = (amount, currency = 'LKR') => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.class}`}>
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
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.class}`}>
        <span>{config.icon}</span>
        {config.text}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
          <button 
            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors font-medium" 
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{payment.staffName}</h3>
                <p className="text-gray-600">ID: {payment.staffId}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(payment.amount, payment.currency)}</div>
                <div className="flex items-center gap-2 mt-2">
                  {getStatusBadge(payment.status)}
                  {getPaymentTypeBadge(payment.paymentType)}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Payment Information</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Payment Date</label>
                  <p className="text-gray-900">{formatDate(payment.paymentDate)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Payment Method</label>
                  <p className="text-gray-900 capitalize">{payment.paymentMethod?.replace('_', ' ')}</p>
                </div>
                
                {payment.payPeriod?.startDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Pay Period</label>
                    <p className="text-gray-900">
                      {formatDate(payment.payPeriod.startDate)} - {formatDate(payment.payPeriod.endDate)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Bank Details</h4>
              
              <div className="space-y-3">
                {payment.bankDetails?.accountNumber && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Account Number</label>
                    <p className="text-gray-900">{payment.bankDetails.accountNumber}</p>
                  </div>
                )}
                
                {payment.bankDetails?.bankName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Bank Name</label>
                    <p className="text-gray-900">{payment.bankDetails.bankName}</p>
                  </div>
                )}
                
                {payment.bankDetails?.branchName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Branch Name</label>
                    <p className="text-gray-900">{payment.bankDetails.branchName}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description and Notes */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Additional Information</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Description</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{payment.description || 'No description provided'}</p>
            </div>
            
            {payment.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Notes</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{payment.notes}</p>
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Record Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Created:</span>
                <span className="ml-2 text-gray-900">{formatDate(payment.createdAt)}</span>
              </div>
              <div>
                <span className="text-gray-600">Last Updated:</span>
                <span className="ml-2 text-gray-900">{formatDate(payment.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PaymentDetails;
