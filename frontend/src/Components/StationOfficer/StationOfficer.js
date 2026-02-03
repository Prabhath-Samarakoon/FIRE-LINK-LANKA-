import React, { useState } from 'react';
import NavigationBar from './src/Components/NavigationBar.jsx';
import HomePage from './src/pages/HomePage.jsx';
// Use top-level Inventory routes/components
import Inventory from './Inventory';
import InventoryCategoryPage from './InventoryCategoryPage';
import Donations from './src/pages/Donations.jsx';
import Reports from './src/pages/Reports.jsx';
import Inspections from './Inspections';
import Assignments from './src/pages/Assignments.jsx';

export default function StationOfficer() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [selectedCategoryData, setSelectedCategoryData] = useState(null);

  const handleEmergencyModeChange = (isEmergencyMode) => {
    setIsEmergencyMode(isEmergencyMode);
    console.log('Emergency mode changed:', isEmergencyMode);
  };

  const handleNavigate = (page, data = null) => {
    setCurrentPage(page);
    if (data && data.category) {
      setSelectedCategoryData(data.category);
    } else if (data && data.categoryData) {
      setSelectedCategoryData(data.categoryData);
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            onEmergencyModeChange={handleEmergencyModeChange}
            onNavigate={handleNavigate}
            currentPage={currentPage}
          />
        );
      case 'inventory':
        return <Inventory />;
      case 'inventory-items':
        return <InventoryCategoryPage onNavigate={handleNavigate} selectedCategoryData={selectedCategoryData} />;
      case 'category-form':
        return <Inventory />;
      case 'category-page':
        return <InventoryCategoryPage onNavigate={handleNavigate} selectedCategoryData={selectedCategoryData} />;
      case 'donations':
        return <Donations onNavigate={handleNavigate} />;
      case 'reports':
        return <Reports onNavigate={handleNavigate} />;
      case 'inspections':
        return <Inspections />;
      case 'assignments':
        return (
          <Assignments
            isEmergencyMode={isEmergencyMode}
            onEmergencyModeChange={handleEmergencyModeChange}
            onNavigate={handleNavigate}
          />
        );
      default:
        return (
          <HomePage
            onEmergencyModeChange={handleEmergencyModeChange}
            onNavigate={handleNavigate}
            currentPage={currentPage}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isEmergencyMode={isEmergencyMode}
      />
      <main className="page-content-wrapper">
        {renderCurrentPage()}
      </main>
    </div>
  );
}

