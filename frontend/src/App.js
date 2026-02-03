import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Truck, AlertTriangle, ClipboardList, BarChart3, Home as HomeIcon } from 'lucide-react';
import './App.css';
import { AuthProvider } from './Context/AuthContext';
import ProtectedRoute from './Components/ProtectedRoute';
import Login from './Components/Login/Login';
import MainHome from './Components/MainHome/MainHome';
import Home from './Components/CallOperator/Home/Home';
import EmergencyModeFlow from './Components/CallOperator/EmergencyModeFlow';
import IncidentManagement from './Components/CallOperator/IncidentManagement/IncidentManagement';
import Dashboard from './Components/CallOperator/Dashboard/Dashboard';
import StaffManager from './Components/StaffManager/StaffManager';
import StationOfficer from './Components/StationOfficer/StationOfficer';
import StationOfficerLayout from './Components/StationOfficer/StationOfficerLayout';
import Inventory from './Components/StationOfficer/Inventory';
import InventoryCategoryPage from './Components/StationOfficer/InventoryCategoryPage';
import Reports from './Components/StationOfficer/src/pages/Reports.jsx';
import Inspections from './Components/StationOfficer/Inspections';
import Donations from './Components/StationOfficer/src/pages/Donations.jsx';
import Assignments from './Components/StationOfficer/src/pages/Assignments.jsx';
import { AppProvider } from './Components/StationOfficer/src/context/AppContext.jsx';
import VehicleOfficerDashboard from './Components/VehicleOfficer/Dashboard';
import VehicleManagement from './Components/VehicleOfficer/VehicleManagement';
import MapPage from './Components/VehicleOfficer/MapPage';
import EmergencyManagement from './Components/VehicleOfficer/EmergencyManagement';
import MaintenanceManagement from './Components/VehicleOfficer/MaintenanceManagement';
import ResourceManagement from './Components/VehicleOfficer/ResourceManagement';
import AddVehicle from './Components/VehicleOfficer/AddVehicle';
import UpdateVehicle from './Components/VehicleOfficer/UpdateVehicle';
import VehicleCard from './Components/VehicleOfficer/VehicleCard';
import VehicleCardGrid from './Components/VehicleOfficer/VehicleCardGrid';
import VehicleShowcase from './Components/VehicleOfficer/VehicleShowcase';
import VehicleOfficerLayout from './Components/VehicleOfficer/VehicleOfficerLayout';
import EmergencyMode from './Components/VehicleOfficer/EmergencyMode';

// Navigation component for Call Operator subsystem
const CallOperatorNavigation = () => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <nav className="sticky top-0 z-40 border-b border-slate-600/50 bg-gradient-to-br from-slate-800 to-slate-700">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-8 py-4">
        <div className="flex items-center gap-3">
          <Truck className="h-8 w-8 text-blue-400" />
          <span className="bg-gradient-to-br from-blue-500 to-blue-700 bg-clip-text text-xl font-bold text-transparent">Call Operator Console</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/call-operator/emergency"
            className={`${isActive('/call-operator/emergency') ? 'border-red-400 text-red-100' : 'text-red-300'} flex items-center gap-2 rounded-lg border border-transparent px-6 py-3 font-medium transition-colors hover:text-red-100 bg-red-900/20 hover:bg-red-900/40`}
          >
            <AlertTriangle className="h-5 w-5" />
            Activate Emergency Mode
          </Link>
          <Link
            to="/call-operator/incidents"
            className={`${isActive('/call-operator/incidents') ? 'border-slate-400 text-slate-100' : 'text-slate-300'} flex items-center gap-2 rounded-lg border border-transparent px-6 py-3 font-medium transition-colors hover:text-slate-100`}
          >
            <ClipboardList className="h-5 w-5" />
            Incidents
          </Link>
          <Link
            to="/call-operator/dashboard"
            className={`${isActive('/call-operator/dashboard') ? 'border-slate-400 text-slate-100' : 'text-slate-300'} flex items-center gap-2 rounded-lg border border-transparent px-6 py-3 font-medium transition-colors hover:text-slate-100`}
          >
            <BarChart3 className="h-5 w-5" />
            Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 rounded-lg border border-slate-500/50 px-4 py-2 text-slate-100 hover:bg-slate-700/50">
            <HomeIcon className="h-5 w-5" />
            Main Menu
          </Link>
          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <span className="relative inline-flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </span>
            Online
          </div>
        </div>
      </div>
    </nav>
  );
};

// Call Operator Layout Component
const CallOperatorLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <CallOperatorNavigation />
      <main className="min-h-[calc(100vh-60px)] space-y-4 bg-white p-4 text-slate-900">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppProvider>
        <Routes>
          {/* Login Page */}
          <Route path="/login" element={<Login />} />
          
          {/* Main Home Page */}
          <Route path="/" element={<MainHome />} />
        
        {/* Call Operator Subsystem */}
        <Route path="/call-operator" element={
          <ProtectedRoute requiredRole="call-operator">
            <CallOperatorLayout>
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
                    <Truck className="h-10 w-10 text-blue-600" />
                    Fire Brigade Call Operator
                  </h1>
                  <p className="text-xl text-gray-600 mb-8">Select an interface from the navigation above</p>
                  
                  {/* Emergency Mode Button - Prominent */}
                  <div className="mb-8">
                    <Link
                      to="/call-operator/emergency"
                      className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-2xl text-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl animate-pulse"
                    >
                      <AlertTriangle className="h-6 w-6" />
                      Activate Emergency Mode
                      <span className="text-lg">→</span>
                    </Link>
                  </div>

                </div>
              </div>
            </CallOperatorLayout>
          </ProtectedRoute>
        } />
        <Route path="/call-operator/emergency" element={
          <ProtectedRoute requiredRole="call-operator">
            <EmergencyModeFlow />
          </ProtectedRoute>
        } />
        <Route path="/call-operator/incidents" element={
          <ProtectedRoute requiredRole="call-operator">
            <CallOperatorLayout>
              <IncidentManagement />
            </CallOperatorLayout>
          </ProtectedRoute>
        } />
        <Route path="/call-operator/dashboard" element={
          <ProtectedRoute requiredRole="call-operator">
            <CallOperatorLayout>
              <Dashboard />
            </CallOperatorLayout>
          </ProtectedRoute>
        } />
        
        {/* Staff Manager Subsystem */}
        <Route path="/staff-manager/*" element={
          <ProtectedRoute requiredRole="staff-manager">
            <StaffManager />
          </ProtectedRoute>
        } />
        
        {/* Station Officer Subsystem */}
        <Route path="/station-officer" element={
          <ProtectedRoute requiredRole="station-officer">
            <StationOfficerLayout />
          </ProtectedRoute>
        }>
          <Route index element={<StationOfficer />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="inventory/:slug" element={<InventoryCategoryPage />} />
          <Route path="reports" element={<Reports />} />
          <Route path="inspections" element={<Inspections />} />
          <Route path="donations" element={<Donations />} />
          <Route path="assignments" element={<Assignments />} />
        </Route>

        {/* Direct Inspections route (for links that use /inspections) */}
        <Route path="/inspections" element={
          <ProtectedRoute requiredRole="station-officer">
            <Inspections />
          </ProtectedRoute>
        } />
        
        {/* Direct Vehicle Officer routes (for direct access) */}
        <Route path="/maintenance-management" element={
          <ProtectedRoute requiredRole="vehicle-officer">
            <MaintenanceManagement />
          </ProtectedRoute>
        } />
        <Route path="/resource-management" element={
          <ProtectedRoute requiredRole="vehicle-officer">
            <ResourceManagement />
          </ProtectedRoute>
        } />
        <Route path="/emergency-management" element={
          <ProtectedRoute requiredRole="vehicle-officer">
            <EmergencyManagement />
          </ProtectedRoute>
        } />

        {/* Vehicle Officer Subsystem */}
        <Route path="/vehicle-officer" element={
          <ProtectedRoute requiredRole="vehicle-officer">
            <VehicleOfficerLayout />
          </ProtectedRoute>
        }>
          <Route index element={<VehicleOfficerDashboard />} />
          <Route path="vehicles" element={<VehicleCardGrid />} />
          <Route path="map" element={<MapPage />} />
          <Route path="emergency-management" element={<EmergencyManagement />} />
          <Route path="maintenance-management" element={<MaintenanceManagement />} />
          <Route path="resource-management" element={<ResourceManagement />} />
          <Route path="add-vehicle" element={<AddVehicle />} />
          <Route path="update-vehicle/:id" element={<UpdateVehicle />} />
          <Route path="vehicle-card" element={<VehicleCard />} />
          <Route path="vehicle-carousel" element={<VehicleCardGrid />} />
          <Route path="vehicle-showcase/:vehicleType" element={<VehicleShowcase />} />
          <Route path="vehicle-showcase" element={<VehicleShowcase />} />
          <Route path="emergency-mode" element={<EmergencyMode />} />
        </Route>
        
        {/* Catch-all route for unmatched paths */}
        <Route path="*" element={
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh', 
            flexDirection: 'column',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontFamily: 'Arial, sans-serif'
          }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>404</h1>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Page Not Found</h2>
            <p style={{ fontSize: '1rem', marginBottom: '2rem' }}>The page you're looking for doesn't exist.</p>
            <a 
              href="/" 
              style={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                color: 'white', 
                padding: '10px 20px', 
                borderRadius: '25px', 
                textDecoration: 'none',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
            >
              Go Home
            </a>
          </div>
        } />
      </Routes>
        </AppProvider>
    </Router>
    </AuthProvider>
  );
}

export default App;
