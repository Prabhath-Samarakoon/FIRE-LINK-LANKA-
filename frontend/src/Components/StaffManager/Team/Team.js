import React, { useEffect, useRef, useState } from 'react'
import './Team.css'
import teamHero from '../../../assets/OurTeam.jpg'
import axios from 'axios'
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

function StatCard({ label, target }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasStarted.current) {
          hasStarted.current = true;
          const durationMs = 1200; // fast count up
          const startTs = performance.now();
          const animate = (ts) => {
            const progress = Math.min(1, (ts - startTs) / durationMs);
            const current = Math.floor(progress * target);
            setValue(current);
            if (progress < 1) requestAnimationFrame(animate);
            else setValue(target);
          };
          requestAnimationFrame(animate);
        }
      });
    }, { threshold: 0.2 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div 
      ref={ref}
      className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-center border border-gray-200 hover:shadow-md transition-all duration-300 hover:scale-105 min-w-[160px]"
    >
      <span className="block text-sm font-medium text-gray-600 mb-2 uppercase tracking-wide">
        {label}
      </span>
      <div className="text-4xl font-bold text-red-600">
        {value}
      </div>
    </div>
  );
}

function Team() {
  const [staffCounts, setStaffCounts] = useState({
    total: 0,
    byPosition: {},
    breakdown: []
  });

  // Fetch staff count by position from database
  const fetchStaffCounts = async () => {
    try {
      const payload = await robustGetCounts();
      const normalized = payload?.data || payload;
      if (normalized && typeof normalized === 'object') {
        setStaffCounts({
          total: normalized.total ?? 0,
          byPosition: normalized.byPosition || {},
          breakdown: normalized.breakdown || []
        });
      }
    } catch (error) {
      console.error('Error fetching staff counts:', error);
    }
  };

  // Listen for staff changes
  useEffect(() => {
    fetchStaffCounts();
    
    // Set up event listener for staff changes
    const handleStaffChange = () => {
      fetchStaffCounts();
    };

    // Listen for custom events when staff is added or removed
    window.addEventListener('staffAdded', handleStaffChange);
    window.addEventListener('staffRemoved', handleStaffChange);

    return () => {
      window.removeEventListener('staffAdded', handleStaffChange);
      window.removeEventListener('staffRemoved', handleStaffChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img 
          className="w-full h-full object-cover" 
          src={teamHero} 
          alt="Our Team" 
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <h1 className="text-6xl font-bold text-white text-center">
            OUR TEAM
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {/* Operation Stats Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <span className="inline-block bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
              OPERATION
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">OPERATION COUNT</h2>
            <p className="text-lg text-gray-600 mb-6">2025</p>
            
            {/* Total Calls - Top Middle */}
            <div className="flex justify-center mb-8">
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 text-center border-2 border-red-200 max-w-xs">
                <span className="block text-lg font-semibold text-red-700 mb-2 uppercase tracking-wide">
                  TOTAL CALLS
                </span>
                <div className="text-4xl font-bold text-red-600">
                  {100 + 6 + 33 + 9 + 143 + 87}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            <StatCard label="FIRE CALL" target={100} />
            <StatCard label="RESCUE" target={6} />
            <StatCard label="EMERGENCY CALL" target={33} />
            <StatCard label="AMB-CALL" target={9} />
            <StatCard label="VIP" target={143} />
            <StatCard label="SP-SERVICE" target={87} />
          </div>
        </section>

        {/* Staff Stats Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
              STAFF
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">STAFF BREAKDOWN</h2>
            <p className="text-lg text-gray-600 mb-6">2025</p>
            
            {/* Total Staff - Top Middle */}
            <div className="flex justify-center mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center border-2 border-blue-200 max-w-xs">
                <span className="block text-lg font-semibold text-blue-700 mb-2 uppercase tracking-wide">
                  TOTAL STAFF
                </span>
                <div className="text-4xl font-bold text-blue-600">
                  {staffCounts.total}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            <StatCard label="FIREFIGHTERS" target={staffCounts.byPosition.Firefighters || 0} />
            <StatCard label="EQUIPMENT TECH" target={staffCounts.byPosition['Equipment Technician'] || 0} />
            <StatCard label="DISPATCHERS" target={staffCounts.byPosition.Dispatcher || 0} />
            <StatCard label="FIRST AID OFFICER" target={staffCounts.byPosition['First Aid Officer'] || 0} />
            <StatCard label="PUMP OPERATOR" target={staffCounts.byPosition['Pump Operator'] || 0} />
            <StatCard label="SAFETY OFFICER" target={staffCounts.byPosition['Safety Officer'] || 0} />
          </div>
        </section>
      </div>
    </div>
  )
}

export default Team


