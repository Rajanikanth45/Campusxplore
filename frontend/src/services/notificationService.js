import api from './api';

export const notificationService = {
  async getNotifications() {
    const response = await api.get('/notifications/');
    return response.data;
  },

  async markRead(id) {
    const response = await api.post(`/notifications/${id}/mark_read/`);
    return response.data;
  },

  async markAllRead() {
    const response = await api.post('/notifications/mark_all_read/');
    return response.data;
  },
};

export default notificationService;
