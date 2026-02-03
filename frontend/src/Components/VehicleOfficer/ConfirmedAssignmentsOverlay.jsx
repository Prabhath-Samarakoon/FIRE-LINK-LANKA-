import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const ConfirmedAssignmentsOverlay = ({ isVisible, onClose }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Listen for new confirmed assignments
    newSocket.on('assignmentConfirmed', (data) => {
      console.log('New assignment confirmed:', data);
      fetchAssignments();
    });

    // Listen for deployment status updates
    newSocket.on('deploymentStatusUpdated', (data) => {
      console.log('Deployment status updated:', data);
      fetchAssignments();
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // Fetch confirmed assignments
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/confirmed-assignments/map');
      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments || []);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load assignments when overlay becomes visible
  useEffect(() => {
    if (isVisible) {
      fetchAssignments();
    }
  }, [isVisible]);

  // Update deployment status
  const updateDeploymentStatus = async (assignmentId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/confirmed-assignments/${assignmentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ deploymentStatus: status })
      });

      if (response.ok) {
        fetchAssignments();
      }
    } catch (error) {
      console.error('Error updating deployment status:', error);
    }
  };

  // Complete assignment
  const completeAssignment = async (assignmentId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/confirmed-assignments/${assignmentId}/complete`, {
        method: 'PUT'
      });

      if (response.ok) {
        fetchAssignments();
      }
    } catch (error) {
      console.error('Error completing assignment:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 w-96 max-h-[80vh] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-lg">Confirmed Assignments</h3>
            <p className="text-blue-100 text-sm">Station Officer Deployments</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[calc(80vh-80px)] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading assignments...</span>
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Active Assignments</h4>
            <p className="text-gray-500 text-sm">Waiting for Station Officer confirmations...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div key={assignment._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                {/* Assignment Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      assignment.deploymentStatus === 'Confirmed' ? 'bg-yellow-400' :
                      assignment.deploymentStatus === 'Deploying' ? 'bg-blue-500' :
                      assignment.deploymentStatus === 'Deployed' ? 'bg-green-500' :
                      assignment.deploymentStatus === 'On Scene' ? 'bg-purple-500' :
                      'bg-gray-400'
                    }`}></div>
                    <span className="text-sm font-semibold text-gray-700">
                      {assignment.deploymentStatus}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(assignment.confirmedAt).toLocaleTimeString()}
                  </span>
                </div>

                {/* Location */}
                <div className="mb-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>{assignment.location}</span>
                  </div>
                </div>

                {/* Vehicles */}
                <div className="mb-3">
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">Assigned Vehicles:</h5>
                  <div className="space-y-1">
                    {assignment.selectedVehicles.map((vehicle, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm bg-white rounded p-2">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          🚒
                        </div>
                        <span className="text-gray-700">{vehicle.vehicleName}</span>
                        <span className="text-gray-500 text-xs">({vehicle.vehicleType})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Equipment */}
                {assignment.selectedEquipment && assignment.selectedEquipment.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Equipment:</h5>
                    <div className="text-xs text-gray-600">
                      {assignment.selectedEquipment.length} items selected
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {assignment.deploymentStatus === 'Confirmed' && (
                    <button
                      onClick={() => updateDeploymentStatus(assignment._id, 'Deploying')}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded transition-colors duration-200"
                    >
                      DEPLOY
                    </button>
                  )}
                  {assignment.deploymentStatus === 'Deploying' && (
                    <button
                      onClick={() => updateDeploymentStatus(assignment._id, 'Deployed')}
                      className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded transition-colors duration-200"
                    >
                      DEPLOYED
                    </button>
                  )}
                  {assignment.deploymentStatus === 'Deployed' && (
                    <button
                      onClick={() => updateDeploymentStatus(assignment._id, 'On Scene')}
                      className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded transition-colors duration-200"
                    >
                      ON SCENE
                    </button>
                  )}
                  {assignment.deploymentStatus === 'On Scene' && (
                    <button
                      onClick={() => completeAssignment(assignment._id)}
                      className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-xs font-semibold rounded transition-colors duration-200"
                    >
                      COMPLETE
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmedAssignmentsOverlay;
