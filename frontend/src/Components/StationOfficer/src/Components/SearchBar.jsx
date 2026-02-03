import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Category slug mapping for navigation
  const categorySlugMap = {
    'Personal Protective Equipment (PPE)': 'ppe',
    'Respiratory Protection': 'respiratory',
    'Hose & Water Delivery': 'hose-water',
    'Ground Ladders': 'ladders',
    'Forcible Entry & Hand Tools': 'entry-tools',
    'Power Tools & Ventilation': 'power-tools',
    'Vehicle Extrication & Stabilization': 'extrication',
    'Rope & Technical Rescue': 'rope-rescue',
    'HazMat & Decontamination': 'hazmat',
    'EMS / Medical': 'ems-medical',
    'Communications': 'communications',
    'Apparatus Loadouts': 'apparatus',
    'Station & Facilities': 'station-facilities',
    'Training & Consumables': 'training',
    'Water Supply & Rural Ops': 'water-supply-rural'
  };

  // Search items from backend
  const searchItems = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Searching for:', query);
      
      const response = await fetch(`http://localhost:5000/api/items?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`Failed to search items: ${response.status}`);
      }
      const data = await response.json();
      console.log('Search response:', data);
      
      const list = data.items || data.data || [];
      // Normalize fields expected by the UI
      const mapped = list.map(it => ({
        _id: it._id,
        itemName: it.name || it.itemName,
        category: it.category?.name || it.categoryName || it.categorySlug,
        itemID: it.itemID || it.serialNumber || '',
        model: it.model || ''
      }));

      console.log('Mapped items:', mapped);

      // Prefer items whose names START WITH the query; fallback to CONTAINS
      const q = query.trim().toLowerCase();
      const startsWith = mapped.filter(it => (it.itemName || '').toLowerCase().startsWith(q));
      const contains = mapped.filter(it => (it.itemName || '').toLowerCase().includes(q));
      const finalResults = startsWith.length > 0 ? startsWith : contains;
      
      console.log('Final suggestions:', finalResults);
      setSuggestions(finalResults);
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to local search if API fails
      const fallbackItems = [
        { _id: '1', itemName: 'Fire Helmet', category: 'Personal Protective Equipment (PPE)', itemID: 'FH001', model: 'Standard' },
        { _id: '2', itemName: 'Fire Jacket', category: 'Personal Protective Equipment (PPE)', itemID: 'FJ001', model: 'Turnout' },
        { _id: '3', itemName: 'Fire Pants', category: 'Personal Protective Equipment (PPE)', itemID: 'FP001', model: 'Turnout' },
        { _id: '4', itemName: 'Fire Boots', category: 'Personal Protective Equipment (PPE)', itemID: 'FB001', model: 'Rubber' },
        { _id: '5', itemName: 'Fire Gloves', category: 'Personal Protective Equipment (PPE)', itemID: 'FG001', model: 'Leather' },
        { _id: '6', itemName: 'Fire Axe', category: 'Forcible Entry & Hand Tools', itemID: 'FA001', model: 'Halligan' },
        { _id: '7', itemName: 'Fire Hose', category: 'Hose & Water Delivery', itemID: 'FH002', model: '2.5 inch' },
        { _id: '8', itemName: 'Fire Ladder', category: 'Ground Ladders', itemID: 'FL001', model: 'Extension' },
        { _id: '9', itemName: 'Fire Extinguisher', category: 'Apparatus Loadouts', itemID: 'FE001', model: 'ABC' },
        { _id: '10', itemName: 'Fire Radio', category: 'Communications', itemID: 'FR001', model: 'Portable' }
      ];
      
      const q = query.trim().toLowerCase();
      const fallbackResults = fallbackItems.filter(it => 
        (it.itemName || '').toLowerCase().includes(q)
      );
      setSuggestions(fallbackResults);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        searchItems(searchTerm);
      } else {
        setSuggestions([]);
      }
    }, 200); // Reduced debounce time for better responsiveness

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(true);
  };

  // Highlight search term in suggestions
  const highlightText = (text, searchTerm) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="highlight">{part}</mark>
      ) : part
    );
  };

  // Handle suggestion click
  const handleSuggestionClick = (item) => {
    const categorySlug = categorySlugMap[item.category] || item.category;
    if (categorySlug) {
      navigate(`/station-officer/inventory/${categorySlug}`);
    }
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      handleSuggestionClick(suggestions[0]);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="search-container" ref={searchRef}>
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search By Item Name"
            value={searchTerm}
            onChange={handleInputChange}
            className="search-input"
            autoComplete="off"
          />
          {isLoading && <div className="search-spinner">🔍</div>}
        </div>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-container">
          {suggestions.map((item, index) => (
            <div
              key={`${item._id}-${index}`}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(item)}
            >
              <div className="suggestion-main">
                <span className="suggestion-name">
                  {highlightText(item.itemName, searchTerm)}
                </span>
                <span className="suggestion-category">{item.category}</span>
              </div>
              <div className="suggestion-details">
                <span className="suggestion-id">{item.itemID}</span>
                <span className="suggestion-model">{item.model}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showSuggestions && searchTerm && !isLoading && suggestions.length === 0 && (
        <div className="suggestions-container">
          <div className="no-results">No items found</div>
        </div>
      )}
    </div>
  );
}

export default SearchBar;
