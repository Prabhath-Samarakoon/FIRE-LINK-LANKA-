import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Nav/Sidebar';
import Header from './Header/Header';
import Home from './Home/Home';
import AddUser from './AddUser/AddUser';
import UserDetails from './Userdetails/userdetails';
import Team from './Team/Team';
import Training from './Training/Training';
import Schedules from './Schedules/Schedules';
import Inspections from './Inspections/Inspections';
import Availability from './Availability/Availability';
import Emergency from './Emergency/Emergency';
import PaymentManagement from './Payment/PaymentManagement';
import EmergencyStaff from './EmergencyStaff/EmergencyStaff';
// Tailwind styles applied via className

const StaffManagerLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col bg-zinc-100">
          <Header />
          <div className="flex-1 p-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const StaffManager = () => {
  return (
    <Routes>
      <Route path="/" element={<StaffManagerLayout><Home /></StaffManagerLayout>} />
      <Route path="/addstaff" element={<StaffManagerLayout><AddUser /></StaffManagerLayout>} />
      <Route path="/staffdetails" element={<StaffManagerLayout><UserDetails /></StaffManagerLayout>} />
      <Route path="/team" element={<StaffManagerLayout><Team /></StaffManagerLayout>} />
      <Route path="/training" element={<StaffManagerLayout><Training /></StaffManagerLayout>} />
      <Route path="/schedules" element={<StaffManagerLayout><Schedules /></StaffManagerLayout>} />
      <Route path="/inspections" element={<StaffManagerLayout><Inspections /></StaffManagerLayout>} />
      <Route path="/availability" element={<StaffManagerLayout><Availability /></StaffManagerLayout>} />
      <Route path="/payments" element={<StaffManagerLayout><PaymentManagement /></StaffManagerLayout>} />
      <Route path="/emergency-staff" element={<StaffManagerLayout><EmergencyStaff /></StaffManagerLayout>} />
      <Route path="/emergency" element={<Emergency />} />
    </Routes>
  );
};

export default StaffManager;
