import React, { useState, useEffect } from 'react'
// Wrapped by StaffManagerLayout (Sidebar and Header provided there)
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
// Tailwind styles applied via className

const API_BASE = process.env.REACT_APP_STAFF_API_URL || 'http://localhost:5000'

async function robustGetCounts() {
  const url = `${API_BASE}/Users/count-by-position`;
  try {
    const { data } = await axios.get(url, { timeout: 10000 });
    return data;
  } catch (err) {
    if (API_BASE.includes('localhost')) {
      try {
        const fb = API_BASE.replace('localhost', '127.0.0.1');
        const { data } = await axios.get(`${fb}/Users/count-by-position`, { timeout: 10000 });
        return data;
      } catch (_) {}
    }
    await new Promise(r => setTimeout(r, 500));
    const { data } = await axios.get(url, { timeout: 10000 });
    return data;
  }
}

function Home() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weatherData, setWeatherData] = useState({
    temperature: 28,
    condition: 'Sunny',
    windSpeed: 12,
    humidity: 65
  });
  const [staffCount, setStaffCount] = useState(0);
  const [isLoadingStaff, setIsLoadingStaff] = useState(true);

  // Fetch staff count from database
  const fetchStaffCount = async () => {
    try {
      setIsLoadingStaff(true);
      const payload = await robustGetCounts();
      const normalized = payload?.data || payload;
      if (normalized && typeof normalized === 'object') {
        setStaffCount(normalized.total ?? 0);
      }
    } catch (error) {
      console.error('Error fetching staff count:', error);
      setStaffCount(0); // Fallback to 0 if error
    } finally {
      setIsLoadingStaff(false);
    }
  };

  // Update time every second and fetch staff count
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    // Fetch staff count on component mount
    fetchStaffCount();
    
    // Set up event listener for staff changes
    const handleStaffChange = () => {
      fetchStaffCount();
    };

    // Listen for custom events when staff is added or removed
    window.addEventListener('staffAdded', handleStaffChange);
    window.addEventListener('staffRemoved', handleStaffChange);

    return () => {
      clearInterval(timer);
      window.removeEventListener('staffAdded', handleStaffChange);
      window.removeEventListener('staffRemoved', handleStaffChange);
    };
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const quickActions = [
    {
      id: 1,
      title: "Add Staff",
      description: "Add new staff members to the system quickly and efficiently.",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
        </svg>
      ),
      onClick: () => navigate('/staff-manager/addstaff'),
      color: 'bg-blue-600'
    },
    {
      id: 2,
      title: "Staff Details",
      description: "View and manage all registered staff members and their information.",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
        </svg>
      ),
      onClick: () => navigate('/staff-manager/staffdetails'),
      color: 'bg-green-600'
    },
    {
      id: 3,
      title: "Training",
      description: "Manage training programs and track staff certifications.",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ),
      onClick: () => navigate('/staff-manager/training'),
      color: 'bg-purple-600'
    },
    {
      id: 4,
      title: "Schedules",
      description: "Create and manage work schedules for all staff members.",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
        </svg>
      ),
      onClick: () => navigate('/staff-manager/schedules'),
      color: 'bg-orange-600'
    },
    {
      id: 5,
      title: "Our Team",
      description: "View team statistics and staff breakdown by positions.",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H16c-.8 0-1.54.37-2.01.99L12 11l-1.99-2.01A2.5 2.5 0 0 0 8 8H5.46c-.8 0-1.54.37-2.01.99L1 15.5V22h2v-6h2.5l2.54-7.63A1.5 1.5 0 0 1 9.46 8H12c.8 0 1.54.37 2.01.99L16 11l1.99-2.01A2.5 2.5 0 0 1 20 8h2.5l-2.54 7.63A1.5 1.5 0 0 1 18.54 16H16v6h4z"/>
        </svg>
      ),
      onClick: () => navigate('/staff-manager/team'),
      color: 'bg-indigo-600'
    },
    {
      id: 6,
      title: "Payment Management",
      description: "Manage staff payments, salaries, and financial records.",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
      onClick: () => navigate('/staff-manager/payments'),
      color: 'bg-emerald-600'
    },
  ];

  const emergencyStats = [
    { label: "Total Staff", value: isLoadingStaff ? "..." : staffCount.toString(), color: "text-green-600", bgColor: "bg-green-50" },
    { label: "Response Time", value: "2.3min", color: "text-blue-600", bgColor: "bg-blue-50" },
    { label: "Equipment Ready", value: "98%", color: "text-purple-600", bgColor: "bg-purple-50" }
  ];

  const recentActivities = [
    { id: 1, type: "training", message: "Fire Safety Training completed by 15 staff members", time: "2 hours ago", icon: "🎓" },
    { id: 2, type: "schedule", message: "Night shift schedule updated for next week", time: "4 hours ago", icon: "📅" },
    { id: 3, type: "emergency", message: "Emergency drill completed successfully", time: "1 day ago", icon: "🚨" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header with Time and Weather */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">FireLink Lanka</h1>
              <p className="text-gray-600 mt-1">Professional Emergency Response Management & Team Coordination</p>
            </div>
            <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-4">
              {/* Current Time */}
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-mono font-bold text-gray-900">{formatTime(currentTime)}</div>
                <div className="text-sm text-gray-600">{formatDate(currentTime)}</div>
              </div>
              {/* Weather Info */}
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{weatherData.temperature}°C</div>
                <div className="text-sm text-blue-600">{weatherData.condition}</div>
                <div className="text-xs text-gray-500">Wind: {weatherData.windSpeed} km/h</div>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {emergencyStats.map((stat, index) => (
            <div key={index} className={`${stat.bgColor} rounded-xl p-6 border border-gray-200`}>
              <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
              <div className="text-sm font-medium text-gray-700">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={action.onClick}
                className="group rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className={`${action.color} mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg text-white`}>
                  <div className="h-6 w-6">{action.icon}</div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activities */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activities</h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl">{activity.icon}</div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">System Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">All Systems Operational</span>
                </div>
                <span className="text-sm text-green-600 font-medium">Online</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Emergency Response Ready</span>
                </div>
                <span className="text-sm text-blue-600 font-medium">Standby</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Training in Progress</span>
                </div>
                <span className="text-sm text-yellow-600 font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Inspirational Quote */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-8 text-center text-white">
          <blockquote className="text-lg italic mb-4">
            "Don't be lazy — you carry the responsibility of your whole country. People need you, your team depends on you, and every decision you make can save lives. Stay disciplined, stay strong, and lead with pride, because without you, the fire brigade cannot stand."
          </blockquote>
          <div className="flex items-center justify-center gap-3 text-sm text-red-100">
            <div className="h-px w-12 bg-red-300"></div>
            <span>Fire Brigade Command</span>
            <div className="h-px w-12 bg-red-300"></div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-4xl mb-2">🚒</div>
            <div className="text-2xl font-bold text-gray-900 mb-1">24/7</div>
            <div className="text-sm text-gray-600">Emergency Response</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-4xl mb-2">⚡</div>
            <div className="text-2xl font-bold text-gray-900 mb-1">2.3min</div>
            <div className="text-sm text-gray-600">Average Response Time</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-4xl mb-2">🛡️</div>
            <div className="text-2xl font-bold text-gray-900 mb-1">99.9%</div>
            <div className="text-sm text-gray-600">Safety Record</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
