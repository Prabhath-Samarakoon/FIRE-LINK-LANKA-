import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { handleApiError } from '../../utils/notifications';

const SystemStatus = () => {
  const [status, setStatus] = useState({
    backend: 'checking',
    database: 'checking',
    endpoints: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    setLoading(true);
    const endpointStatus = [];

    try {
      // Check health endpoint
      const health = await apiService.healthCheck();
      setStatus(prev => ({
        ...prev,
        backend: 'online',
        database: health.database === 'Connected' ? 'online' : 'offline'
      }));

      // Check all major endpoints
      const endpoints = [
        { name: 'Users', test: () => apiService.getUsers() },
        { name: 'Incidents', test: () => apiService.getIncidents() },
        { name: 'Schedules', test: () => apiService.getSchedules() },
        { name: 'Categories', test: () => apiService.getCategories() },
        { name: 'Items', test: () => apiService.getItems() }
      ];

      for (const endpoint of endpoints) {
        try {
          await endpoint.test();
          endpointStatus.push({ name: endpoint.name, status: 'online' });
        } catch (error) {
          endpointStatus.push({ name: endpoint.name, status: 'offline', error: error.message });
        }
      }

      setStatus(prev => ({
        ...prev,
        endpoints: endpointStatus
      }));

    } catch (error) {
      setStatus(prev => ({
        ...prev,
        backend: 'offline',
        database: 'offline'
      }));
      handleApiError(error, 'System status check failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'offline': return 'text-red-600 bg-red-100';
      case 'checking': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return '✅';
      case 'offline': return '❌';
      case 'checking': return '⏳';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">System Status</h2>
        <button
          onClick={checkSystemStatus}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backend Status */}
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Backend Server</h3>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status.backend)}`}>
            <span className="mr-2">{getStatusIcon(status.backend)}</span>
            {status.backend === 'online' ? 'Online' : status.backend === 'offline' ? 'Offline' : 'Checking...'}
          </div>
        </div>

        {/* Database Status */}
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Database</h3>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status.database)}`}>
            <span className="mr-2">{getStatusIcon(status.database)}</span>
            {status.database === 'online' ? 'Connected' : status.database === 'offline' ? 'Disconnected' : 'Checking...'}
          </div>
        </div>
      </div>

      {/* API Endpoints Status */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">API Endpoints</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {status.endpoints.map((endpoint, index) => (
            <div key={index} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">{endpoint.name}</span>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(endpoint.status)}`}>
                  <span className="mr-1">{getStatusIcon(endpoint.status)}</span>
                  {endpoint.status}
                </div>
              </div>
              {endpoint.error && (
                <p className="text-xs text-red-600 mt-1 truncate" title={endpoint.error}>
                  {endpoint.error}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Overall Status */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="font-medium">Overall System Status:</span>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            status.backend === 'online' && status.database === 'online' 
              ? 'text-green-600 bg-green-100' 
              : 'text-red-600 bg-red-100'
          }`}>
            <span className="mr-2">
              {status.backend === 'online' && status.database === 'online' ? '✅' : '❌'}
            </span>
            {status.backend === 'online' && status.database === 'online' ? 'All Systems Operational' : 'System Issues Detected'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;
