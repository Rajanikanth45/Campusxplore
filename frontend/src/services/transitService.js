import api from './api';

const transitService = {
  // Routes
  getRoutes: async () => {
    const res = await api.get('/transit/routes/');
    return res.data;
  },

  getRoute: async (id) => {
    const res = await api.get(`/transit/routes/${id}/`);
    return res.data;
  },

  createRoute: async (data) => {
    const res = await api.post('/transit/routes/', data);
    return res.data;
  },

  updateRoute: async (id, data) => {
    const res = await api.patch(`/transit/routes/${id}/`, data);
    return res.data;
  },

  deleteRoute: async (id) => {
    const res = await api.delete(`/transit/routes/${id}/`);
    return res.data;
  },

  // Stops
  getStops: async (params = {}) => {
    const res = await api.get('/transit/stops/', { params });
    return res.data;
  },

  getStop: async (id) => {
    const res = await api.get(`/transit/stops/${id}/`);
    return res.data;
  },

  createStop: async (data) => {
    const res = await api.post('/transit/stops/', data);
    return res.data;
  },

  updateStop: async (id, data) => {
    const res = await api.patch(`/transit/stops/${id}/`, data);
    return res.data;
  },

  deleteStop: async (id) => {
    const res = await api.delete(`/transit/stops/${id}/`);
    return res.data;
  },

  // Vehicles
  getVehicles: async (params = {}) => {
    const res = await api.get('/transit/vehicles/', { params });
    return res.data;
  },

  getVehicle: async (id) => {
    const res = await api.get(`/transit/vehicles/${id}/`);
    return res.data;
  },

  createVehicle: async (data) => {
    const res = await api.post('/transit/vehicles/', data);
    return res.data;
  },

  updateVehicle: async (id, data) => {
    const res = await api.patch(`/transit/vehicles/${id}/`, data);
    return res.data;
  },

  deleteVehicle: async (id) => {
    const res = await api.delete(`/transit/vehicles/${id}/`);
    return res.data;
  },

  // IoT / Live GPS location update ping
  updateVehicleLocation: async (id, { latitude, longitude, speed_kmh }) => {
    const res = await api.post(`/transit/vehicles/${id}/update_location/`, {
      latitude,
      longitude,
      speed_kmh,
    });
    return res.data;
  },

  // Demo Simulator: advance all active vehicles along their route
  simulateStep: async () => {
    const res = await api.post('/transit/vehicles/simulate_step/');
    return res.data;
  },

  // Emergency SOS Posts
  getEmergencyPosts: async () => {
    const res = await api.get('/transit/emergency/');
    return res.data;
  },

  createEmergencyPost: async (data) => {
    const res = await api.post('/transit/emergency/', data);
    return res.data;
  },

  updateEmergencyPost: async (id, data) => {
    const res = await api.patch(`/transit/emergency/${id}/`, data);
    return res.data;
  },

  deleteEmergencyPost: async (id) => {
    const res = await api.delete(`/transit/emergency/${id}/`);
    return res.data;
  },
};

export default transitService;

