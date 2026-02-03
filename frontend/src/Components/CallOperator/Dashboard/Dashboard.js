import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Flame, 
  Truck, 
  CheckCircle, 
  Lock, 
  AlertTriangle,
  Activity,
  RefreshCw
} from 'lucide-react';
// Tailwind styles applied via className

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:5000/incidents';

  useEffect(() => {
    fetchStats();
    fetchRecentIncidents();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      if (!response.ok) throw new Error('Failed to fetch statistics');
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentIncidents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}?limit=10&sort=-createdAt`);
      if (!response.ok) throw new Error('Failed to fetch recent incidents');
      
      const data = await response.json();
      const incidents = data.incidents || [];
      
      // Remove duplicates and get unique incidents
      const uniqueIncidents = incidents.filter((incident, index, self) => 
        index === self.findIndex(i => 
          i.address === incident.address && 
          i.incidentType === incident.incidentType &&
          i.status === incident.status
        )
      );
      
      // Sort by priority (Emergency > High > Medium > Low) then by date
      const priorityOrder = { 'Emergency': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
      const sortedIncidents = uniqueIncidents.sort((a, b) => {
        const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      // Take only the 5 most important/recent incidents
      setRecentIncidents(sortedIncidents.slice(0, 5));
    } catch (err) {
      console.error('Error fetching recent incidents:', err);
    }
  };

  // Function to refresh data (can be called when new incidents are added)
  const refreshData = () => {
    fetchStats();
    fetchRecentIncidents();
  };

  // Auto-refresh every 30 seconds to show new incidents
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRecentIncidents();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="flex h-96 items-center justify-center text-zinc-500">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="flex h-96 items-center justify-center text-red-600">Error: {error}</div>;
  }

  if (!stats) {
    return <div className="flex h-96 items-center justify-center text-red-600">No data available</div>;
  }

  const { overall, byType, byPriority } = stats;

  // Helper function to format time ago
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const incidentDate = new Date(dateString);
    const diffInMinutes = Math.floor((now - incidentDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  // Helper function to get activity icon and color based on status
  const getActivityIcon = (status) => {
    switch (status) {
      case 'Active':
        return <AlertTriangle className="h-6 w-6 text-red-600" />;
      case 'Dispatched':
        return <Truck className="h-6 w-6 text-blue-600" />;
      case 'Resolved':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      default:
        return <Activity className="h-6 w-6 text-gray-600" />;
    }
  };

  // Helper function to get activity message based on status
  const getActivityMessage = (incident) => {
    switch (incident.status) {
      case 'Active':
        return 'New incident reported';
      case 'Dispatched':
        return 'Unit dispatched';
      case 'Resolved':
        return 'Incident resolved';
      default:
        return 'Incident updated';
    }
  };

  // Helper function to get important details for display
  const getImportantDetails = (incident) => {
    const details = [];
    
    // Add priority if it's high or emergency
    if (incident.priority === 'Emergency' || incident.priority === 'High') {
      details.push(`Priority: ${incident.priority}`);
    }
    
    // Add people affected if any
    if (incident.peopleTrapped > 0) {
      details.push(`${incident.peopleTrapped} trapped`);
    }
    if (incident.injured > 0) {
      details.push(`${incident.injured} injured`);
    }
    
    // Add hazards if any
    if (incident.hazards && incident.hazards.length > 0) {
      details.push(`Hazards: ${incident.hazards.join(', ')}`);
    }
    
    return details.length > 0 ? details.join(' • ') : null;
  };

  return (
    <div className="mx-auto max-w-[1400px] p-6">
      <div className="mb-12 text-center">
        <h1 className="bg-gradient-to-br from-blue-500 to-blue-700 bg-clip-text text-3xl font-bold text-transparent">Fire Brigade Dashboard</h1>
        <p className="text-zinc-400">Real-time incident overview and statistics</p>
      </div>

      {/* Overall Statistics */}
      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div className="relative flex items-center gap-4 overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10">
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="text-3xl font-bold text-gray-900">{overall.total}</div>
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Total Incidents</div>
          </div>
        </div>

        <div className="relative flex items-center gap-4 overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10">
            <Flame className="h-8 w-8 text-orange-600" />
          </div>
          <div className="flex-1">
            <div className="text-3xl font-bold text-gray-900">{overall.active}</div>
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Active</div>
          </div>
        </div>

        <div className="relative flex items-center gap-4 overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10">
            <Truck className="h-8 w-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="text-3xl font-bold text-gray-900">{overall.dispatched}</div>
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Dispatched</div>
          </div>
        </div>

        <div className="relative flex items-center gap-4 overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div className="flex-1">
            <div className="text-3xl font-bold text-gray-900">{overall.resolved}</div>
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Resolved</div>
          </div>
        </div>

        <div className="relative flex items-center gap-4 overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10">
            <Lock className="h-8 w-8 text-gray-600" />
          </div>
          <div className="flex-1">
            <div className="text-3xl font-bold text-gray-900">{overall.closed}</div>
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Closed</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-semibold text-gray-900">Incidents by Type</h3>
          <div className="flex flex-col gap-3">
            {byType.map((type) => (
              <div key={type._id} className="flex items-center gap-3">
                <div className="min-w-[100px] text-sm font-medium text-gray-600">{type._id}</div>
                <div className="relative h-5 flex-1 overflow-hidden rounded-full bg-gray-200">
                  <div 
                    className="h-full rounded-full" 
                    style={{ 
                      width: `${(type.count / Math.max(...byType.map(t => t.count))) * 100}%`,
                      backgroundColor: getTypeColor(type._id)
                    }}
                  />
                </div>
                <div className="min-w-[40px] text-right text-sm font-semibold text-gray-900">{type.count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-semibold text-gray-900">Incidents by Priority</h3>
          <div className="flex flex-col gap-3">
            {byPriority.map((priority) => (
              <div key={priority._id} className="flex items-center gap-3">
                <div className="min-w-[100px] text-sm font-medium text-gray-600">{priority._id}</div>
                <div className="relative h-5 flex-1 overflow-hidden rounded-full bg-gray-200">
                  <div 
                    className="h-full rounded-full" 
                    style={{ 
                      width: `${(priority.count / Math.max(...byPriority.map(p => p.count))) * 100}%`,
                      backgroundColor: getPriorityColor(priority._id)
                    }}
                  />
                </div>
                <div className="min-w-[40px] text-right text-sm font-semibold text-gray-900">{priority.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Recent Activity */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <button
            onClick={refreshData}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {recentIncidents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No recent incidents</p>
            </div>
          ) : (
            recentIncidents.map((incident) => {
              const importantDetails = getImportantDetails(incident);
              const isHighPriority = incident.priority === 'Emergency' || incident.priority === 'High';
              return (
                <div 
                  key={incident._id} 
                  className={`flex items-start gap-3 rounded-lg border p-3 ${
                    isHighPriority 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    isHighPriority ? 'bg-red-500/10' : 'bg-blue-500/10'
                  }`}>
                    {getActivityIcon(incident.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold text-gray-900">
                        {getActivityMessage(incident)}
                      </div>
                      {isHighPriority && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                          {incident.priority}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600">
                      {incident.incidentType} incident at {incident.address || 'Unknown location'}
                    </div>
                    {importantDetails && (
                      <div className="text-xs text-red-600 font-medium mt-1">
                        {importantDetails}
                      </div>
                    )}
                    <div className="text-xs italic text-gray-500">
                      {getTimeAgo(incident.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

// Helper functions for colors
const getTypeColor = (type) => {
  const colors = {
    'Building': '#ef4444',
    'Vehicle': '#f59e0b',
    'Forest': '#10b981',
    'HazMat': '#8b5cf6'
  };
  return colors[type] || '#6b7280';
};

const getPriorityColor = (priority) => {
  const colors = {
    'Low': '#10b981',
    'Medium': '#f59e0b',
    'High': '#ef4444',
    'Emergency': '#7c2d12'
  };
  return colors[priority] || '#6b7280';
};

export default Dashboard;
