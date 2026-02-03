import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./VehicleCard.css";

function VehicleCard({ vehicle = {}, onDelete, onClick, isSelected = false }) {
  const { _id, vehicleId, name, Vtype, maxCrew, Capacity, tripA, tripB, deploymentHistory } = vehicle || {};
  const [isDeleting, setIsDeleting] = useState(false);

  if (!name && !Vtype && !maxCrew && !Capacity) {
    return (
      <div className="vehicle-card empty">
        <h2>No vehicle selected.</h2>
      </div>
    );
  }

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      setIsDeleting(true);
      try {
        await axios.delete(`http://localhost:5000/vehicles/${_id}`);
        // Call the onDelete callback to refresh the vehicle list
        if (onDelete) {
          onDelete(_id);
        }
      } catch (error) {
        console.error('Delete error:', error);
        const errorMessage = error.response?.data?.message || 'Failed to delete vehicle. Please try again.';
        alert(errorMessage);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div 
      className={`vehicle-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick && onClick(vehicle)}
    >
      <div className="vehicle-header">
        <h3 className="vehicle-name">{name}</h3>
        <div className="header-badges">
          <span className="vehicle-type">{Vtype}</span>
        </div>
      </div>
      
      <div className="vehicle-details">
        <div className="detail-item">
          <span className="label">Crew:</span>
          <span className="value">{maxCrew} members</span>
        </div>
        <div className="detail-item">
          <span className="label">Capacity:</span>
          <span className="value">{Capacity} L</span>
        </div>
        <div className="detail-item">
          <span className="label">ID:</span>
          <span className="value">{vehicleId || _id?.slice(-8)}</span>
        </div>
        
        {/* Trip Meter Data */}
        <div className="trip-meters-mini">
          <div className="trip-meter-mini">
            <span className="trip-label">Trip A:</span>
            <span className="trip-value-mini">{parseFloat(tripA ?? 0).toFixed(1)} km</span>
          </div>
          <div className="trip-meter-mini">
            <span className="trip-label">Trip B:</span>
            <span className="trip-value-mini">{parseFloat(tripB ?? 500).toFixed(1)} km</span>
          </div>
        </div>
        
        {/* Current Deployment Distance */}
        {deploymentHistory && deploymentHistory.length > 0 && (() => {
          const activeDeployment = deploymentHistory
            .filter(deployment => deployment.status === 'Deployed' || deployment.status === 'In Progress')
            .sort((a, b) => new Date(b.deployedAt) - new Date(a.deployedAt))[0];
          
          if (activeDeployment) {
            return (
              <div className="deployment-mini">
                <span className="deployment-label">Deployed:</span>
                <span className="deployment-value">{activeDeployment.distance.toFixed(1)} km</span>
              </div>
            );
          }
          return null;
        })()}
      </div>
      
      <div className="vehicle-actions">
        <Link to={`/update-vehicle/${_id}`} className="btn btn-update">
          ✏️ EDIT
        </Link>
        <button 
          className="btn btn-delete" 
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? '🗑️ Deleting...' : '🗑️ DELETE'}
        </button>
      </div>
    </div>
  );
}

export default VehicleCard;




