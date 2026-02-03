import axios from 'axios';

const API_BASE = process.env.REACT_APP_STAFF_API_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 15000
});

async function requestWithLocalhostFallback(fn) {
  try {
    return await fn(API_BASE);
  } catch (err) {
    if (API_BASE.includes('localhost')) {
      const fallbackBase = API_BASE.replace('localhost', '127.0.0.1');
      return await fn(fallbackBase);
    }
    throw err;
  }
}

async function getUsers() {
  const res = await requestWithLocalhostFallback(async (base) => {
    const { data } = await axios.get(`${base}/Users`, { timeout: 15000 });
    return data;
  });
  const users = res?.data || res?.Users || res?.users || [];
  const count = res?.count ?? users.length;
  return { data: users, count };
}

async function getCategories() {
  const res = await requestWithLocalhostFallback(async (base) => {
    const { data } = await axios.get(`${base}/api/categories`, { timeout: 15000 });
    return data;
  });
  const categories = res?.categories || res?.data || [];
  return { data: categories };
}

async function getItems(params = {}) {
  const query = new URLSearchParams(params).toString();
  const path = query ? `/api/items?${query}` : '/api/items';
  const res = await requestWithLocalhostFallback(async (base) => {
    const { data } = await axios.get(`${base}${path}`, { timeout: 15000 });
    return data;
  });
  const items = res?.items || res?.data || [];
  return { data: items };
}

async function createItem(payload) {
  const res = await requestWithLocalhostFallback(async (base) => {
    const { data } = await axios.post(`${base}/api/items`, payload, { timeout: 15000 });
    return data;
  });
  return res;
}

async function updateItem(id, payload) {
  const res = await requestWithLocalhostFallback(async (base) => {
    const { data } = await axios.put(`${base}/api/items/${id}`, payload, { timeout: 15000 });
    return data;
  });
  return res;
}

async function deleteItem(id) {
  const res = await requestWithLocalhostFallback(async (base) => {
    const { data } = await axios.delete(`${base}/api/items/${id}`, { timeout: 15000 });
    return data;
  });
  return res;
}

async function clearItems(categorySlug) {
  const path = categorySlug ? `/api/items?category=${encodeURIComponent(categorySlug)}` : '/api/items';
  const res = await requestWithLocalhostFallback(async (base) => {
    const { data } = await axios.delete(`${base}${path}`, { timeout: 15000 });
    return data;
  });
  return res;
}

export default {
  getUsers,
  getCategories,
  getItems,
  createItem,
  updateItem,
  deleteItem,
  clearItems,
  async getInspections(params = {}) {
    const query = new URLSearchParams(params).toString();
    const path = query ? `/api/inspections?${query}` : '/api/inspections';
    const res = await requestWithLocalhostFallback(async (base) => {
      const { data } = await axios.get(`${base}${path}`, { timeout: 15000 });
      return data;
    });
    const inspections = Array.isArray(res) ? res : (res?.inspections || res?.data || []);
    return { data: inspections };
  },
  async getDonations() {
    const res = await requestWithLocalhostFallback(async (base) => {
      const { data } = await axios.get(`${base}/api/donations`, { timeout: 15000 });
      return data;
    });
    return { data: res?.donations || res?.data || [] };
  },
  async createDonation(payload) {
    const res = await requestWithLocalhostFallback(async (base) => {
      const { data } = await axios.post(`${base}/api/donations`, payload, { timeout: 15000 });
      return data;
    });
    return res;
  },
  async updateDonation(id, payload) {
    const res = await requestWithLocalhostFallback(async (base) => {
      const { data } = await axios.put(`${base}/api/donations/${id}`, payload, { timeout: 15000 });
      return data;
    });
    return res;
  },
  async deleteDonation(id) {
    const res = await requestWithLocalhostFallback(async (base) => {
      const { data } = await axios.delete(`${base}/api/donations/${id}`, { timeout: 15000 });
      return data;
    });
    return res;
  },
  async clearDonations() {
    const res = await requestWithLocalhostFallback(async (base) => {
      const { data } = await axios.delete(`${base}/api/donations`, { timeout: 15000 });
      return data;
    });
    return res;
  },
  async getReports() {
    const res = await requestWithLocalhostFallback(async (base) => {
      const { data } = await axios.get(`${base}/api/reports`, { timeout: 15000 });
      return data;
    });
    return { data: res?.reports || res?.data || [] };
  },
  async createReport(payload) {
    const res = await requestWithLocalhostFallback(async (base) => {
      const { data } = await axios.post(`${base}/api/reports`, payload, { timeout: 15000 });
      return data;
    });
    return res;
  },
  async updateReport(id, payload) {
    const res = await requestWithLocalhostFallback(async (base) => {
      const { data } = await axios.put(`${base}/api/reports/${id}`, payload, { timeout: 15000 });
      return data;
    });
    return res;
  },
  async deleteReport(id) {
    const res = await requestWithLocalhostFallback(async (base) => {
      const { data } = await axios.delete(`${base}/api/reports/${id}`, { timeout: 15000 });
      return data;
    });
    return res;
  },
  async clearReports() {
    const res = await requestWithLocalhostFallback(async (base) => {
      const { data } = await axios.delete(`${base}/api/reports`, { timeout: 15000 });
      return data;
    });
    return res;
  },

  // Vehicle Officer API functions
  async getVehicleOfficerVehicles() {
    const res = await requestWithLocalhostFallback(async (base) => {
      const { data } = await axios.get(`${base}/api/vehicle-officer/vehicles`, { timeout: 15000 });
      return data;
    });
    return res;
  },

  async getVehicleOfficerVehicleById(id) {
    const res = await requestWithLocalhostFallback(async (base) => {
      const { data } = await axios.get(`${base}/api/vehicle-officer/vehicles/${id}`, { timeout: 15000 });
      return data;
    });
    return res;
  },

  async createVehicleOfficerVehicle(vehicleData) {
    const res = await requestWithLocalhostFallback(async (base) => {
      const { data } = await axios.post(`${base}/api/vehicle-officer/vehicles/add`, vehicleData, { 
        timeout: 15000,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return data;
    });
    return res;
  },

  async updateVehicleOfficerVehicle(id, vehicleData) {
    const res = await requestWithLocalhostFallback(async (base) => {
      const { data } = await axios.put(`${base}/api/vehicle-officer/vehicles/${id}`, vehicleData, { 
        timeout: 15000,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return data;
    });
    return res;
  },

  async deleteVehicleOfficerVehicle(id) {
    const res = await requestWithLocalhostFallback(async (base) => {
      const { data } = await axios.delete(`${base}/api/vehicle-officer/vehicles/${id}`, { timeout: 15000 });
      return data;
    });
    return res;
  },

  // Trip data API functions
  async getVehicleTrip(vehicleId) {
    const res = await requestWithLocalhostFallback(async (base) => {
      const { data } = await axios.get(`${base}/api/vehicle-officer/vehicles/${vehicleId}/trip`, { timeout: 15000 });
      return data;
    });
    return res;
  },

  async updateVehicleTrip(vehicleId, tripData) {
    const res = await requestWithLocalhostFallback(async (base) => {
      const { data } = await axios.put(`${base}/api/vehicle-officer/vehicles/${vehicleId}/trip`, tripData, { 
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return data;
    });
    return res;
  },

  async getEmergencyAssignments() {
    const res = await requestWithLocalhostFallback(async (base) => {
      const { data } = await axios.get(`${base}/api/vehicle-officer/emergency-assignments`, { timeout: 15000 });
      return data;
    });
    return res;
  },

  async createEmergencyAssignment(assignmentData) {
    const res = await requestWithLocalhostFallback(async (base) => {
      const { data } = await axios.post(`${base}/api/vehicle-officer/emergency-assignments/add`, assignmentData, { timeout: 15000 });
      return data;
    });
    return res;
  },

  async getMaintenanceRequests() {
    const res = await requestWithLocalhostFallback(async (base) => {
      const { data } = await axios.get(`${base}/api/vehicle-officer/maintenance-requests`, { timeout: 15000 });
      return data;
    });
    return res;
  },

  async createMaintenanceRequest(requestData) {
    const res = await requestWithLocalhostFallback(async (base) => {
      const { data } = await axios.post(`${base}/api/vehicle-officer/maintenance-requests/add`, requestData, { timeout: 15000 });
      return data;
    });
    return res;
  },

  async getResourceManagement() {
    const res = await requestWithLocalhostFallback(async (base) => {
      const { data } = await axios.get(`${base}/api/vehicle-officer/resource-management`, { timeout: 15000 });
      return data;
    });
    return res;
  },

  async getResourceManagementByVehicle(vehicleId) {
    const res = await requestWithLocalhostFallback(async (base) => {
      const { data } = await axios.get(`${base}/api/vehicle-officer/resource-management/vehicle/${encodeURIComponent(vehicleId)}`, { timeout: 15000 });
      return data;
    });
    return res;
  },

  async updateResourceFuelLevel(payload) {
    // payload: { recordId, newFuelLevel, type?: 'Consumption'|'Refill'|..., amount?: number, notes?: string }
    const res = await requestWithLocalhostFallback(async (base) => {
      const { data } = await axios.post(`${base}/api/vehicle-officer/resource-management/update-fuel`, payload, { timeout: 15000 });
      return data;
    });
    return res;
  },

  async updateResourceWaterLevel(payload) {
    const res = await requestWithLocalhostFallback(async (base) => {
      const { data } = await axios.post(`${base}/api/vehicle-officer/resource-management/update-water`, payload, { timeout: 15000 });
      return data;
    });
    return res;
  },

  // Incident API functions
  async createIncident(incidentData) {
    const res = await requestWithLocalhostFallback(async (base) => {
      const { data } = await axios.post(`${base}/incidents`, incidentData, { timeout: 15000 });
      return data;
    });
    return res;
  },

  async getIncidents(params = {}) {
    const query = new URLSearchParams(params).toString();
    const path = query ? `/incidents?${query}` : '/incidents';
    const res = await requestWithLocalhostFallback(async (base) => {
      const { data } = await axios.get(`${base}${path}`, { timeout: 15000 });
      return data;
    });
    return res;
  },

  async updateIncidentStatus(id, statusData) {
    const res = await requestWithLocalhostFallback(async (base) => {
      const { data } = await axios.patch(`${base}/incidents/${id}/status`, statusData, { timeout: 15000 });
      return data;
    });
    return res;
  },
  async getRefillOrders() {
    const res = await requestWithLocalhostFallback(async (base) => {
      const { data } = await axios.get(`${base}/api/vehicle-officer/refill-orders`, { timeout: 15000 });
      return data;
    });
    return res;
  },
  async createRefillOrder(payload) {
    const res = await requestWithLocalhostFallback(async (base) => {
      const { data } = await axios.post(`${base}/api/vehicle-officer/refill-orders`, payload, { timeout: 15000 });
      return data;
    });
    return res;
  },
  async updateRefillOrder(id, payload) {
    const res = await requestWithLocalhostFallback(async (base) => {
      const { data } = await axios.put(`${base}/api/vehicle-officer/refill-orders/${id}`, payload, { timeout: 15000 });
      return data;
    });
    return res;
  },
  async deleteRefillOrder(id) {
    const res = await requestWithLocalhostFallback(async (base) => {
      const { data } = await axios.delete(`${base}/api/vehicle-officer/refill-orders/${id}`, { timeout: 15000 });
      return data;
    });
    return res;
  },
  async completeRefillOrder(id) {
    const res = await requestWithLocalhostFallback(async (base) => {
      const { data } = await axios.post(`${base}/api/vehicle-officer/refill-orders/${id}/complete`, {}, { timeout: 15000 });
      return data;
    });
    return res;
  }
};

