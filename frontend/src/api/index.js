import axios from "axios";

// Use Vercel environment variable in production
// Fallback to localhost for local development
const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_BASE}/api`,
});

// Attach token automatically
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) {
    cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

/* ================= AUTH API ================= */

export const authAPI = {
  login:          (data) => api.post("/auth/login", data),
  register:       (data) => api.post("/auth/register", data),
  adminRegister:  (data) => api.post("/auth/admin-register", data),
  changePassword: (data) => api.post("/auth/change-password", data),
  updateProfile:  (data) => api.put("/auth/profile", data),
};

/* ================= ADMIN API ================= */

export const adminAPI = {
  getStats:          ()               => api.get("/admin/stats"),
  getTiffins:        (month)          => api.get(`/admin/tiffin${month ? `?month=${month}` : ""}`),
  createTiffin:      (data)           => api.post("/admin/tiffin", data),
  updateTiffin:      (id, data)       => api.put(`/admin/tiffin/${id}`, data),
  deleteTiffin:      (id)             => api.delete(`/admin/tiffin/${id}`),
  getUsers:          ()               => api.get("/admin/users"),
  getPendingUsers:   ()               => api.get("/admin/pending-users"),
  approveUser:       (id)             => api.patch(`/admin/users/${id}/approve`),
  rejectUser:        (id)             => api.delete(`/admin/users/${id}/reject`),
  toggleUser:        (id)             => api.patch(`/admin/users/${id}/toggle`),
  getUserLogs:       (uid, month)     => api.get(`/admin/users/${uid}/logs${month ? `?month=${month}` : ""}`),
  markDelivered:     (id)             => api.patch(`/admin/log/${id}/delivered`),
  markPending:       (id)             => api.patch(`/admin/log/${id}/pending`),
  deliverAll:        (uid, month)     => api.patch(`/admin/users/${uid}/deliver-all${month ? `?month=${month}` : ""}`),
  addPersonalTiffin: (uid, data)      => api.post(`/admin/users/${uid}/personal-tiffin`, data),
  getUserCalendar:   (uid, month)     => api.get(`/admin/users/${uid}/calendar${month ? `?month=${month}` : ""}`),
};

/* ================= USER API ================= */

export const userAPI = {
  getTodayTiffin:    ()              => api.get("/user/today-tiffin"),
  getHistory:        (month)         => api.get(`/user/history${month ? `?month=${month}` : ""}`),
  getTotal:          (month)         => api.get(`/user/total${month ? `?month=${month}` : ""}`),
  getCalendar:       (month)         => api.get(`/user/calendar${month ? `?month=${month}` : ""}`),
  skipTiffin:        (date)          => api.patch(`/user/log/${date}/skip`),
  addPersonalTiffin: (data)          => api.post("/user/personal-tiffin", data),
  deletePersonal:    (id)            => api.delete(`/user/personal-tiffin/${id}`),
};

export default api;