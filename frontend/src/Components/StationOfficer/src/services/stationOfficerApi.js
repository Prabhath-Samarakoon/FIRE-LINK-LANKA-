// Station Officer API Service
// Handles all backend communication for Station Officer functionality

const API_BASE_URL = 'http://localhost:5000/api';

class StationOfficerApi {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic API call method
  async apiCall(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      let data = null;
      try {
        data = await response.json();
      } catch (_e) {
        // ignore json parse errors (no body)
      }
      if (!response.ok) {
        const err = new Error((data && data.message) || `HTTP error! status: ${response.status}`);
        err.response = { status: response.status, data };
        throw err;
      }
      return data || {};
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Inventory/Items API
  async getAllItems() {
    return this.apiCall('/items');
  }

  async getItemsByCategory(categorySlug) {
    return this.apiCall(`/items/category/${categorySlug}`);
  }

  async getItemById(id) {
    return this.apiCall(`/items/${id}`);
  }

  async createItem(itemData) {
    return this.apiCall('/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  async updateItem(id, itemData) {
    return this.apiCall(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });
  }

  async deleteItem(id) {
    return this.apiCall(`/items/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories API
  async getAllCategories() {
    return this.apiCall('/categories');
  }

  async getCategoryById(id) {
    return this.apiCall(`/categories/${id}`);
  }

  async createCategory(categoryData) {
    return this.apiCall('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  // Donations API
  async getAllDonations() {
    return this.apiCall('/donations');
  }

  async getDonationById(id) {
    return this.apiCall(`/donations/${id}`);
  }

  async createDonation(donationData) {
    return this.apiCall('/donations', {
      method: 'POST',
      body: JSON.stringify(donationData),
    });
  }

  async updateDonation(id, donationData) {
    return this.apiCall(`/donations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(donationData),
    });
  }

  async deleteDonation(id) {
    return this.apiCall(`/donations/${id}`, {
      method: 'DELETE',
    });
  }

  async clearDonations() {
    return this.apiCall('/donations', {
      method: 'DELETE',
    });
  }

  // Reports API
  async getAllReports() {
    return this.apiCall('/reports');
  }

  async getReportById(id) {
    return this.apiCall(`/reports/${id}`);
  }

  async createReport(reportData) {
    return this.apiCall('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  async updateReport(id, reportData) {
    return this.apiCall(`/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reportData),
    });
  }

  async deleteReport(id) {
    return this.apiCall(`/reports/${id}`, {
      method: 'DELETE',
    });
  }

  // Inspections API
  async getAllInspections() {
    return this.apiCall('/inspections');
  }

  async getInspectionsByItem(itemId) {
    return this.apiCall(`/inspections/item/${itemId}`);
  }

  async getInspectionById(id) {
    return this.apiCall(`/inspections/${id}`);
  }

  async createInspection(inspectionData) {
    return this.apiCall('/inspections', {
      method: 'POST',
      body: JSON.stringify(inspectionData),
    });
  }

  async updateInspection(id, inspectionData) {
    return this.apiCall(`/inspections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(inspectionData),
    });
  }

  async deleteInspection(id) {
    return this.apiCall(`/inspections/${id}`, {
      method: 'DELETE',
    });
  }

  // Emergency Mode API (if needed)
  async setEmergencyMode(isActive) {
    // This could be implemented as a simple state management
    // or connected to a backend emergency system
    localStorage.setItem('emergencyMode', isActive.toString());
    return { success: true, emergencyMode: isActive };
  }

  async getEmergencyMode() {
    const emergencyMode = localStorage.getItem('emergencyMode') === 'true';
    return { emergencyMode };
  }
}

// Create and export a singleton instance
const stationOfficerApi = new StationOfficerApi();
export default stationOfficerApi;
