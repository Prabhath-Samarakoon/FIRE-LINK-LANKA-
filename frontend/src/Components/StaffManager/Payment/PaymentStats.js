import React from 'react';

const PaymentStats = ({ stats, loading, filters, onFilterChange, payments }) => {
  const downloadPaymentDetails = () => {
    if (!payments || payments.length === 0) {
      alert('No payment data available to download');
      return;
    }

    // Calculate totals for footer
    const totalAmount = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const totalPayments = payments.length;
    const pendingCount = payments.filter(p => p.status === 'pending').length;
    const approvedCount = payments.filter(p => p.status === 'approved').length;
    const paidCount = payments.filter(p => p.status === 'paid').length;

    // Create HTML content for PDF
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Details Report</title>
        <style>
          @page {
            margin: 0.75in;
            @top-center {
              content: "FIRE BRIGADE MANAGEMENT SYSTEM";
              font-size: 10px;
              color: #666;
              font-weight: bold;
            }
            @bottom-center {
              content: "Page " counter(page) " of " counter(pages);
              font-size: 9px;
              color: #666;
            }
          }
          body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            line-height: 1.3;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .header {
            text-align: center;
            margin-bottom: 25px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 15px;
          }
          .header h1 {
            color: #2563eb;
            font-size: 20px;
            margin: 0 0 8px 0;
            font-weight: bold;
          }
          .header p {
            margin: 3px 0;
            color: #666;
            font-size: 10px;
          }
          .summary {
            background-color: #f8fafc;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 15px;
            border-left: 4px solid #2563eb;
          }
          .summary h3 {
            margin: 0 0 8px 0;
            color: #2563eb;
            font-size: 12px;
            font-weight: bold;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
          }
          .summary-item {
            text-align: center;
          }
          .summary-value {
            font-size: 14px;
            font-weight: bold;
            color: #1f2937;
          }
          .summary-label {
            font-size: 9px;
            color: #6b7280;
            margin-top: 3px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 9px;
          }
          th {
            background-color: #2563eb;
            color: white;
            padding: 8px 4px;
            text-align: left;
            font-weight: bold;
            font-size: 9px;
            border: 1px solid #1d4ed8;
          }
          td {
            padding: 6px 4px;
            border: 1px solid #e5e7eb;
            font-size: 8px;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .status-pending { color: #d97706; font-weight: bold; }
          .status-approved { color: #059669; font-weight: bold; }
          .status-paid { color: #2563eb; font-weight: bold; }
          .footer {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 8px;
          }
          .amount {
            text-align: right;
            font-weight: bold;
          }
          .page-break {
            page-break-before: always;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FIRE BRIGADE MANAGEMENT SYSTEM</h1>
          <p>Payment Details Report</p>
          <p>Generated on: ${currentDate} at ${currentTime}</p>
          <p>Total Records: ${totalPayments}</p>
        </div>

        <div class="summary">
          <h3>Summary</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-value">LKR ${totalAmount.toLocaleString()}</div>
              <div class="summary-label">Total Amount</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${totalPayments}</div>
              <div class="summary-label">Total Payments</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${pendingCount} / ${approvedCount} / ${paidCount}</div>
              <div class="summary-label">Pending / Approved / Paid</div>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Staff Member</th>
              <th>Payment Type</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Payment Date</th>
              <th>Status</th>
              <th>Payment Method</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            ${payments.map(payment => `
              <tr>
                <td>${payment.staffName || ''}</td>
                <td>${payment.paymentType || ''}</td>
                <td class="amount">${payment.amount || 0}</td>
                <td>${payment.currency || 'LKR'}</td>
                <td>${new Date(payment.paymentDate).toLocaleDateString()}</td>
                <td class="status-${payment.status || 'pending'}">${payment.status || 'pending'}</td>
                <td>${payment.paymentMethod || ''}</td>
                <td>${payment.description || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>This report was generated automatically by the Fire Brigade Management System</p>
          <p>For any queries, please contact the system administrator</p>
        </div>
      </body>
      </html>
    `;

    // Create a new window for PDF generation
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.print();
        // After printing, close the window
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      }, 500);
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="text-center text-gray-600">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <span className="text-4xl mb-4">📊</span>
        <p className="text-lg font-medium">No statistics available</p>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return `LKR ${amount.toLocaleString()}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      approved: '#10b981',
      paid: '#3b82f6',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getTypeColor = (type) => {
    const colors = {
      salary: '#3b82f6',
      overtime: '#f59e0b',
      bonus: '#10b981',
      allowance: '#8b5cf6',
      deduction: '#ef4444',
      advance: '#06b6d4'
    };
    return colors[type] || '#6b7280';
  };

  return (
    <div className="p-6">

      {/* Graphs and Statistics - Moved to Top */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Summary Cards */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Summary</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
              <div className="text-2xl font-bold">{formatCurrency(stats.summary.totalAmount)}</div>
              <div className="text-blue-100">Total Amount</div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
              <div className="text-2xl font-bold">{stats.summary.totalPayments}</div>
              <div className="text-green-100">Total Payments</div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
              <div className="text-2xl font-bold">{formatCurrency(stats.summary.averageAmount)}</div>
              <div className="text-purple-100">Average Amount</div>
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Payment Status</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <span className="font-medium text-gray-900">Pending</span>
              </div>
              <span className="text-2xl font-bold text-yellow-600">{stats.summary.pendingCount}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span className="font-medium text-gray-900">Approved</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{stats.summary.approvedCount}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <span className="font-medium text-gray-900">Paid</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">{stats.summary.paidCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Type Breakdown */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">Payment Types</h3>
        
        <div className="space-y-3">
          {stats.typeBreakdown.map((type, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: getTypeColor(type._id) }}
                  ></div>
                  <span className="font-medium text-gray-900 capitalize">
                    {type._id.charAt(0).toUpperCase() + type._id.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500">({type.count} payments)</span>
                </div>
                <span className="font-semibold text-gray-900">{formatCurrency(type.total)}</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full" 
                  style={{ 
                    width: `${(type.total / stats.summary.totalAmount) * 100}%`,
                    backgroundColor: getTypeColor(type._id)
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Download Button - Moved to Bottom */}
      <div className="flex justify-center">
        <button
          onClick={downloadPaymentDetails}
          className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition-all transform hover:-translate-y-0.5 hover:shadow-lg flex items-center gap-3 text-lg"
        >
          <span>📄</span>
          Download PDF Report
        </button>
      </div>
    </div>
  );
};

export default PaymentStats;
