import api from './api';

export const bookingService = {
  async getBookings(params = {}) {
    const response = await api.get('/bookings/', { params });
    return response.data;
  },

  async getBookedSlots(facility, date) {
    const response = await api.get('/bookings/booked_slots/', { params: { facility, date } });
    return response.data;
  },

  async createBooking(payload) {
    const response = await api.post('/bookings/', payload);
    return response.data;
  },

  async cancelBooking(id) {
    const response = await api.post(`/bookings/${id}/cancel/`);
    return response.data;
  },

  async decideBooking(id, status) {
    const response = await api.post(`/bookings/${id}/decide/`, { status });
    return response.data;
  },
};

export default bookingService;
