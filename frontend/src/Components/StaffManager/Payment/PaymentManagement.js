import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentList from './PaymentList';
import PaymentForm from './PaymentForm';
import PaymentStats from './PaymentStats';
import PaymentDetails from './PaymentDetails';

const PaymentManagement = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    paymentType: ''
  });

  const navigate = useNavigate();

  // Fetch payments
  const fetchPayments = async () => {
    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      console.log('Fetching payments with query:', queryParams.toString());
      const response = await fetch(`http://localhost:5000/api/payments?${queryParams}`);
      
      if (!response.ok) {
        if (response.status === 500) {
          throw new Error('Server error: Please make sure MongoDB is running and the backend server is started');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Payment API response:', data);

      if (data.success) {
        // Handle both paginated and non-paginated responses
        const paymentsData = data.data?.payments || data.data || [];
        console.log('Setting payments:', paymentsData);
        setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      } else {
        console.error('API Error:', data.message);
        setError(data.message || 'Failed to fetch payments');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError(`Failed to fetch payments: ${error.message}`);
      setPayments([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Fetch payment statistics
  const fetchStats = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);

      const response = await fetch(`http://localhost:5000/api/payments/stats?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [filters]);

  const handleCreatePayment = () => {
    setSelectedPayment(null);
    setShowForm(true);
  };

  const handleEditPayment = (payment) => {
    setSelectedPayment(payment);
    setShowForm(true);
  };

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setShowDetails(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedPayment(null);
    fetchPayments();
    fetchStats();
    setSuccess(selectedPayment ? 'Payment updated successfully!' : 'Payment created successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDetailsClose = () => {
    setShowDetails(false);
    setSelectedPayment(null);
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handlePaymentAction = async (paymentId, action, data = {}) => {
    try {
      let url, method;
      
      if (action === 'delete') {
        url = `http://localhost:5000/api/payments/${paymentId}`;
        method = 'DELETE';
      } else {
        url = `http://localhost:5000/api/payments/${paymentId}/${action}`;
        method = 'PATCH';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: method !== 'DELETE' ? JSON.stringify(data) : undefined,
      });

      const result = await response.json();

      if (result.success) {
        fetchPayments();
        fetchStats();
        setSuccess(`Payment ${action} successful!`);
        setTimeout(() => setSuccess(''), 3000);
        return true;
      } else {
        setError(result.message);
        return false;
      }
    } catch (error) {
      console.error(`Error ${action} payment:`, error);
      setError(`Failed to ${action} payment`);
      return false;
    }
  };

  const tabs = [
    { id: 'list', label: 'Payment List', icon: '📋' },
    { id: 'stats', label: 'Statistics', icon: '📊' }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {activeTab === 'list' && (
        <div className="flex justify-between items-center mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Management</h1>
            <p className="text-gray-600">Manage staff payments, salaries, and financial records</p>
          </div>
          <div>
            <button 
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:-translate-y-0.5 hover:shadow-lg"
              onClick={handleCreatePayment}
            >
              <span className="text-lg">➕</span>
              Add Payment
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <span className="text-xl">⚠️</span>
          <span className="text-red-700 flex-1">{error}</span>
          <button 
            className="text-red-500 hover:text-red-700 font-bold"
            onClick={() => setError('')}
          >
            ✕
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
          <span className="text-xl">✅</span>
          <span className="text-green-700 flex-1">{success}</span>
          <button 
            className="text-green-500 hover:text-green-700 font-bold"
            onClick={() => setSuccess('')}
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex gap-2 mb-6 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === tab.id 
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {activeTab === 'list' && (
          <PaymentList
            payments={payments}
            loading={loading}
            onEdit={handleEditPayment}
            onView={handleViewPayment}
            onAction={handlePaymentAction}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        )}

        {activeTab === 'stats' && (
          <PaymentStats
            stats={stats}
            loading={loading}
            filters={filters}
            onFilterChange={handleFilterChange}
            payments={payments}
          />
        )}
      </div>

      {showForm && (
        <PaymentForm
          payment={selectedPayment}
          onClose={handleFormClose}
          onSave={handleFormClose}
        />
      )}

      {showDetails && (
        <PaymentDetails
          payment={selectedPayment}
          onClose={handleDetailsClose}
        />
      )}
    </div>
  );
};

export default PaymentManagement;
