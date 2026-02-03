import React, { useEffect, useMemo, useState } from 'react'
import './Training.css'
import jsPDF from 'jspdf'
const API_BASE = process.env.REACT_APP_STAFF_API_URL || 'http://localhost:5000'

// Edit Training Form Component
function EditTrainingForm({ training, onUpdate, onCancel, trainingParts }) {
  const [formData, setFormData] = useState({
    type: training.type,
    part: training.part,
    level: training.level,
    assignedTo: [...training.assignedTo],
    status: training.status,
    notes: training.notes || ''
  });
  const [newName, setNewName] = useState('');
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Fetch name suggestions for search
  const fetchNameSuggestions = async (query) => {
    if (!query.trim() || query.length < 2) {
      setNameSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/Users/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        const users = data.data?.users || [];
        setNameSuggestions(users.map(u => ({ name: u.name, position: u.position })));
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setNameSuggestions([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(training._id, formData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addFirefighter = (user) => {
    const name = typeof user === 'string' ? user : user.name;
    if (!formData.assignedTo.includes(name)) {
      setFormData(prev => ({
        ...prev,
        assignedTo: [...prev.assignedTo, name]
      }));
      setNewName('');
      setNameSuggestions([]);
    }
  };

  const removeFirefighter = (name) => {
    setFormData(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.filter(n => n !== name)
    }));
  };

  const handleNameInputChange = (e) => {
    const value = e.target.value;
    setNewName(value);
    setSelectedIndex(-1); // Reset selection when typing
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      fetchNameSuggestions(value);
    }, 300); // 300ms delay
    
    setSearchTimeout(timeout);
  };

  const handleKeyDown = (e) => {
    if (nameSuggestions.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < nameSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : nameSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < nameSuggestions.length) {
          addFirefighter(nameSuggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setNameSuggestions([]);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Training Type</label>
          <select 
            value={formData.type} 
            onChange={(e) => handleInputChange('type', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
          >
            <option value="practical">Practical Training</option>
            <option value="theoretical">Theoretical Training</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Training Part</label>
          <select 
            value={formData.part} 
            onChange={(e) => handleInputChange('part', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
          >
            <option value="">Select training part</option>
            {trainingParts[formData.type].map((part, index) => (
              <option key={index} value={part}>{part}</option>
            ))}
          </select>
        </div>

        {formData.type === 'practical' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Level</label>
            <select 
              value={formData.level} 
              onChange={(e) => handleInputChange('level', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            >
              <option value="basic">Basic</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select 
            value={formData.status} 
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
          >
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Assigned Firefighters</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Type a name to add..."
            value={newName}
            onChange={handleNameInputChange}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            autoComplete="off"
          />
          {nameSuggestions.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {nameSuggestions.map((user, index) => (
                <li 
                  key={index} 
                  onClick={() => addFirefighter(user)}
                  className={`px-4 py-2 cursor-pointer text-gray-700 flex justify-between items-center ${
                    index === selectedIndex 
                      ? 'bg-red-100 text-red-800' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <span className="font-medium">{user.name}</span>
                  <span className="text-sm text-gray-500">{user.position || 'Unassigned'}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Display current assigned firefighters */}
        <div className="flex flex-wrap gap-2 mt-3">
          {formData.assignedTo.map((name, index) => (
            <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
              {name}
              <button 
                type="button" 
                onClick={() => removeFirefighter(name)}
                className="ml-2 hover:bg-red-200 rounded-full p-1 transition-colors"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea 
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Add any additional notes..."
          rows="3"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-vertical"
        />
      </div>

      <div className="flex gap-4 justify-end pt-4">
        <button 
          type="button" 
          onClick={onCancel} 
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
        >
          Update Training
        </button>
      </div>
    </form>
  );
}

function Training() {
  const [nameQuery, setNameQuery] = useState('');
  const [selectedNames, setSelectedNames] = useState([]);
  const [type, setType] = useState('practical');
  const [practicalLevel, setPracticalLevel] = useState('');
  const [trainingPart, setTrainingPart] = useState(''); // Added for training part
  const [assignedTrainings, setAssignedTrainings] = useState([]); // Added for assigned trainings
  const [editingTraining, setEditingTraining] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Training parts data
  const trainingParts = {
    practical: [
      'Hose and ladder drills',
      'First aid and casualty handling',
      'Foam and fire engine drills',
      'Rope and knot techniques',
      'Smoke drill',
      'Hydrant and pump drills',
      'Proper use of breathing apparatus',
      'On-the-job training for real-world emergency situations'
    ],
    theoretical: [
      'Fire Engineering Science — Basic calculations, Chemistry of combustion',
      'Fire extinguishers and their use',
      'Ropes, lines, and ladders',
      'Breathing apparatus and communication systems',
      'Water supply, hydrant systems, pumps, and priming',
      'Ventilation and salvage operations',
      'Rescue techniques and firefighting strategies',
      'Small rescue tools and equipment',
      'Firefighting hoses and fittings',
      'Foam and foam-making equipment',
      'Personal protective equipment (PPE)',
      'First aid and casualty handling',
      'Construction and structural elements in fire safety',
      'Fixed fire installations and alarm systems',
      'Automatic fire detectors',
      'Fire safety and protection measure'
    ]
  };

  // Fetch all training assignments from database
  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/trainings`);
      if (response.ok) {
        const data = await response.json();
        setAssignedTrainings(data.trainings || []);
      } else {
        throw new Error('Failed to fetch trainings');
      }
    } catch (error) {
      console.error('Error fetching trainings:', error);
      setError('Failed to load training assignments');
    } finally {
      setLoading(false);
    }
  };

  // Load trainings on component mount
  useEffect(() => {
    fetchTrainings();
  }, []);

  // Download functions
  const downloadPDF = () => {
    if (!assignedTrainings || assignedTrainings.length === 0) {
      alert('No training data to download');
      return;
    }

    // Create a new PDF document
    const pdf = new jsPDF();
    
    // Set title
    pdf.setFontSize(20);
    pdf.setTextColor(178, 34, 34); // Fire brigade red
    pdf.text('Fire Brigade Training Assignments Report', 105, 20, { align: 'center' });
    
    // Set subtitle
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
    pdf.text(`Total Training Assignments: ${assignedTrainings.length}`, 105, 37, { align: 'center' });
    
    // Add line separator
    pdf.setDrawColor(178, 34, 34);
    pdf.line(20, 45, 190, 45);
    
    // Set font for content
    pdf.setFontSize(11);
    pdf.setTextColor(50, 50, 50);
    
    let yPosition = 60;
    
    // Add training details
    assignedTrainings.forEach((training, index) => {
      // Check if we need a new page
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
      
      // Training number and type
      pdf.setFontSize(12);
      pdf.setTextColor(178, 34, 34);
      pdf.text(`${index + 1}. ${training.type === 'practical' ? 'Practical Training' : 'Theoretical Training'}`, 20, yPosition);
      yPosition += 8;
      
      // Training details
      pdf.setFontSize(10);
      pdf.setTextColor(80, 80, 80);
      pdf.text(`   Part: ${training.part || 'N/A'}`, 25, yPosition);
      yPosition += 6;
      if (training.level !== 'N/A') {
        pdf.text(`   Level: ${training.level || 'N/A'}`, 25, yPosition);
        yPosition += 6;
      }
      pdf.text(`   Assigned to: ${training.assignedTo.join(', ') || 'N/A'}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`   Status: ${training.status || 'N/A'}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`   Date: ${new Date(training.assignedDate).toLocaleDateString()}`, 25, yPosition);
      yPosition += 12; // Extra space between trainings
    });
    
    // Add footer
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('--- End of Report ---', 105, yPosition + 10, { align: 'center' });
    
    // Save the PDF
    pdf.save(`fire_brigade_training_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Handle type change
  const handleTypeChange = (e) => {
    setType(e.target.value);
    setTrainingPart(''); // Reset training part when type changes
    setPracticalLevel(''); // Reset practical level when type changes
  };

  // Suggestions for names - fetch from database
  const [allNames, setAllNames] = useState([]);
  
  // Fetch all names from database on component mount
  useEffect(() => {
    const fetchAllNames = async () => {
      try {
        const response = await fetch(`${API_BASE}/Users`);
        if (response.ok) {
          const data = await response.json();
          const users = data.data || data.Users || data.users || [];
          const names = users.map(u => u.name).filter(Boolean);
          setAllNames(names);
        }
      } catch (error) {
        console.error('Error fetching names:', error);
      }
    };
    fetchAllNames();
  }, []);

  const suggestions = useMemo(() => {
    if (!nameQuery.trim()) return [];
    
    return allNames.filter(name => 
      name.toLowerCase().includes(nameQuery.toLowerCase())
    ).slice(0, 5);
  }, [nameQuery, allNames]);

  // Add name to selected list
  const addName = (name) => {
    if (!selectedNames.includes(name)) {
      setSelectedNames(prev => [...prev, name]);
      setNameQuery('');
    }
  };

  // Remove name from selected list
  const removeName = (name) => {
    setSelectedNames(prev => prev.filter(n => n !== name));
  };

  // Handle training assignment
  const handleAssignTraining = async () => {
    if (!trainingPart || selectedNames.length === 0) {
      alert('Please select training part and add at least one firefighter');
      return;
    }

    try {
      setLoading(true);
      const trainingData = {
        type,
        part: trainingPart,
        level: type === 'practical' ? practicalLevel : 'N/A',
        assignedTo: selectedNames,
        assignedDate: new Date().toISOString(),
        status: 'Active'
      };

      const response = await fetch(`${API_BASE}/trainings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trainingData),
      });

      if (response.ok) {
        fetchTrainings(); // Refresh the list
        setSelectedNames([]);
        setTrainingPart('');
        setPracticalLevel('');
        setType('practical');
        setTimeout(() => setError(''), 3000);
      } else {
        throw new Error('Failed to assign training');
      }
    } catch (error) {
      console.error('Error assigning training:', error);
      setError('Failed to assign training. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete training
  const handleDeleteTraining = async (trainingId) => {
    const confirmed = window.confirm('Are you sure you want to delete this training assignment?');
    if (confirmed) {
      try {
        const response = await fetch(`${API_BASE}/trainings/${trainingId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          fetchTrainings(); // Refresh the list
          setError('Training deleted successfully');
          setTimeout(() => setError(''), 3000);
        } else {
          throw new Error('Failed to delete training');
        }
      } catch (error) {
        console.error('Error deleting training:', error);
        setError('Failed to delete training. Please try again.');
      }
    }
  };

  // Handle update training
  const handleUpdateTraining = async (trainingId, updatedData) => {
    try {
      const response = await fetch(`${API_BASE}/trainings/${trainingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      
      if (response.ok) {
        fetchTrainings(); // Refresh the list
        setShowEditModal(false);
        setEditingTraining(null);
        setError('Training updated successfully');
        setTimeout(() => setError(''), 3000);
      } else {
        throw new Error('Failed to update training');
      }
    } catch (error) {
      console.error('Error updating training:', error);
      setError('Failed to update training. Please try again.');
    }
  };

  // Open edit modal
  const openEditModal = (training) => {
    setEditingTraining(training);
    setShowEditModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Training Management</h1>
          <p className="text-lg text-gray-600">Assign and manage firefighter training programs</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Training Assignment Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Assign New Training</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Training Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Training Type</label>
              <select 
                value={type} 
                onChange={handleTypeChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              >
                <option value="practical">Practical Training</option>
                <option value="theoretical">Theoretical Training</option>
              </select>
            </div>

            {/* Training Part */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Training Part</label>
              <select 
                value={trainingPart} 
                onChange={(e) => setTrainingPart(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              >
                <option value="">Select training part</option>
                {trainingParts[type].map((part, index) => (
                  <option key={index} value={part}>{part}</option>
                ))}
              </select>
            </div>

            {/* Practical Level - Only show for practical training */}
            {type === 'practical' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Practical Level</label>
                <select 
                  value={practicalLevel} 
                  onChange={(e) => setPracticalLevel(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                >
                  <option value="">Select level</option>
                  <option value="basic">Basic</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            )}

            {/* Add Firefighter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Add Firefighter</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type a name..."
                  value={nameQuery}
                  onChange={(e) => setNameQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                />
                {suggestions.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {suggestions.map((n) => (
                      <li 
                        key={n} 
                        onClick={() => addName(n)}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
                      >
                        {n}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Selected Firefighters */}
          {selectedNames.length > 0 && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Selected Firefighters</label>
              <div className="flex flex-wrap gap-2">
                {selectedNames.map((n) => (
                  <span 
                    key={n} 
                    onClick={() => removeName(n)}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200 cursor-pointer transition-colors"
                  >
                    {n} ×
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Training Summary */}
          {(trainingPart || practicalLevel) && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Assignment Summary</h3>
              <div className="space-y-2 text-gray-700">
                <p><span className="font-medium">Type:</span> {type === 'practical' ? 'Practical Training' : 'Theoretical Training'}</p>
                {trainingPart && <p><span className="font-medium">Part:</span> {trainingPart}</p>}
                {practicalLevel && <p><span className="font-medium">Level:</span> {practicalLevel}</p>}
                {selectedNames.length > 0 && (
                  <p><span className="font-medium">Assigned to:</span> {selectedNames.join(', ')}</p>
                )}
              </div>
              <button 
                onClick={handleAssignTraining}
                disabled={loading}
                className="mt-4 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {loading ? 'Assigning...' : 'Assign Training'}
              </button>
            </div>
          )}
        </div>

        {/* Training Types Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Practical Training</h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Hose and ladder drills
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                First aid and casualty handling
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Foam and fire engine drills
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Rope and knot techniques
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Smoke drill
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Hydrant and pump drills
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Proper use of breathing apparatus
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                On-the-job training for real-world emergency situations
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Theoretical Training</h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Fire Engineering Science — Basic calculations, Chemistry of combustion
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Fire extinguishers and their use
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Ropes, lines, and ladders
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Breathing apparatus and communication systems
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Water supply, hydrant systems, pumps, and priming
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Ventilation and salvage operations
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Rescue techniques and firefighting strategies
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Small rescue tools and equipment
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Firefighting hoses and fittings
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Foam and foam-making equipment
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Personal protective equipment (PPE)
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                First aid and casualty handling
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Construction and structural elements in fire safety
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Fixed fire installations and alarm systems
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Automatic fire detectors
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Fire safety and protection measures
              </li>
            </ul>
          </div>
        </div>

        {/* Assigned Trainings Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">Assigned Trainings</h2>
            <button 
              onClick={downloadPDF}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
            >
              📄 Download Report
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          ) : assignedTrainings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📚</div>
              <p className="text-gray-600 text-lg">No training assignments yet.</p>
              <p className="text-gray-500">Create your first training assignment above.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {assignedTrainings.map((training) => (
                <div key={training._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        training.status === 'Active' ? 'bg-green-100 text-green-800' :
                        training.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {training.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(training.assignedDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2 sm:mt-0">
                      <button 
                        onClick={() => openEditModal(training)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteTraining(training._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {training.type === 'practical' ? 'Practical Training' : 'Theoretical Training'}
                  </h4>
                  
                  <div className="space-y-1 text-gray-700">
                    <p><span className="font-medium">Part:</span> {training.part}</p>
                    {training.level !== 'N/A' && <p><span className="font-medium">Level:</span> {training.level}</p>}
                    <p><span className="font-medium">Assigned to:</span> {training.assignedTo.join(', ')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

        {/* Edit Training Modal */}
        {showEditModal && editingTraining && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowEditModal(false)}>
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900">Edit Training Assignment</h2>
                <button 
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  onClick={() => setShowEditModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <EditTrainingForm 
                  training={editingTraining}
                  onUpdate={handleUpdateTraining}
                  onCancel={() => setShowEditModal(false)}
                  trainingParts={trainingParts}
                />
              </div>
            </div>
          </div>
        )}

        {/* Download Section - Bottom Right Corner */}
        {/* This section is now moved to be positioned under the "View Assigned Trainings" button */}
    </div>
  )
}

export default Training




