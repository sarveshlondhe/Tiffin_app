import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login:          d => api.post('/auth/login', d),
  register:       d => api.post('/auth/register', d),
  adminRegister:  d => api.post('/auth/admin-register', d),
  changePassword: d => api.post('/auth/change-password', d),
  updateProfile:  d => api.put('/auth/profile', d),
};

export const adminAPI = {
  getStats:          ()       => api.get('/admin/stats'),
  getTiffins:        (month)  => api.get(`/admin/tiffin${month ? `?month=${month}` : ''}`),
  createTiffin:      d        => api.post('/admin/tiffin', d),
  updateTiffin:      (id, d)  => api.put(`/admin/tiffin/${id}`, d),
  deleteTiffin:      id       => api.delete(`/admin/tiffin/${id}`),
  getUsers:          ()       => api.get('/admin/users'),
  getPendingUsers:   ()       => api.get('/admin/pending-users'),
  approveUser:       id       => api.patch(`/admin/users/${id}/approve`),
  rejectUser:        id       => api.delete(`/admin/users/${id}/reject`),
  toggleUser:        id       => api.patch(`/admin/users/${id}/toggle`),
  getUserLogs:       (uid, m) => api.get(`/admin/users/${uid}/logs${m ? `?month=${m}` : ''}`),
  markDelivered:     id       => api.patch(`/admin/log/${id}/delivered`),
  markPending:       id       => api.patch(`/admin/log/${id}/pending`),
  deliverAll:        (uid, m) => api.patch(`/admin/users/${uid}/deliver-all${m ? `?month=${m}` : ''}`),
  addPersonalTiffin: (uid, d) => api.post(`/admin/users/${uid}/personal-tiffin`, d),
  getUserCalendar:   (uid, m) => api.get(`/admin/users/${uid}/calendar${m ? `?month=${m}` : ''}`),
};

export const userAPI = {
  getTodayTiffin:    ()    => api.get('/user/today-tiffin'),
  getHistory:        month => api.get(`/user/history${month ? `?month=${month}` : ''}`),
  getTotal:          month => api.get(`/user/total${month ? `?month=${month}` : ''}`),
  getCalendar:       month => api.get(`/user/calendar${month ? `?month=${month}` : ''}`),
  skipTiffin:        date  => api.patch(`/user/log/${date}/skip`),
  addPersonalTiffin: d     => api.post('/user/personal-tiffin', d),
  deletePersonal:    id    => api.delete(`/user/personal-tiffin/${id}`),
};

export default api;