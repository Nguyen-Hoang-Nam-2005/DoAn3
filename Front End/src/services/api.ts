import axios from "axios";

// Backend Gateway URL
const GATEWAY_URL = "http://localhost:7000";

const api = axios.create({
  baseURL: GATEWAY_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (
    token &&
    token !== "demo-token-admin" &&
    token !== "demo-token-trainer" &&
    token !== "demo-token-member"
  ) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ─── Auth API (Gateway: /auth/...) ───────────────────────
export const authApi = {
  login: (tenDangNhap: string, matKhau: string) =>
    api.post("/auth/Auth/login", { tenDangNhap, matKhau }),
  register: (data: {
    hoTen: string;
    email?: string;
    soDienThoai?: string;
    tenDangNhap: string;
    matKhau: string;
  }) => api.post("/auth/Auth/register", data),
};

// ─── Admin API (Gateway: /admin/...) ─────────────────────
export const memberApi = {
  getAll: () => api.get("/admin/thanhvien"),
  getById: (id: number) => api.get(`/admin/thanhvien/${id}`),
  create: (data: any) => api.post("/admin/thanhvien", data),
  update: (id: number, data: any) => api.put(`/admin/thanhvien/${id}`, data),
  delete: (id: number) => api.delete(`/admin/thanhvien/${id}`),
};

export const trainerApi = {
  getAll: () => api.get("/admin/nhanvien"),
  getById: (id: number) => api.get(`/admin/nhanvien/${id}`),
  create: (data: any) => api.post("/admin/nhanvien", data),
  update: (id: number, data: any) => api.put(`/admin/nhanvien/${id}`, data),
  delete: (id: number) => api.delete(`/admin/nhanvien/${id}`),
};

export const packageApi = {
  getAll: () => api.get("/admin/goitap"),
  getActive: () => api.get("/admin/goitap/active"),
  getById: (id: number) => api.get(`/admin/goitap/${id}`),
  create: (data: any) => api.post("/admin/goitap", data),
  update: (id: number, data: any) => api.put(`/admin/goitap/${id}`, data),
  delete: (id: number) => api.delete(`/admin/goitap/${id}`),
};

export const checkInApi = {
  checkIn: (memberId: number) =>
    api.post("/admin/diemdanh/checkin", { thanhVienId: memberId }),
  checkOut: (id: number) => api.post(`/admin/diemdanh/checkout/${id}`),
  getToday: () => api.get("/admin/diemdanh/today"),
};

export const invoiceApi = {
  getAll: () => api.get("/admin/hoadon"),
  getById: (id: number) => api.get(`/admin/hoadon/${id}`),
  getByMember: (memberId: number) =>
    api.get(`/admin/hoadon/thanhvien/${memberId}`),
  create: (data: any) => api.post("/admin/hoadon", data),
  update: (id: number, data: any) => api.put(`/admin/hoadon/${id}`, data),
  approve: (id: number) => api.put(`/admin/hoadon/${id}/approve`),
  delete: (id: number) => api.delete(`/admin/hoadon/${id}`),
};

export const scheduleApi = {
  getAll: () => api.get("/admin/lichtap"),
  getById: (id: number) => api.get(`/admin/lichtap/${id}`),
  create: (data: any) => api.post("/admin/lichtap", data),
  update: (id: number, data: any) => api.put(`/admin/lichtap/${id}`, data),
  delete: (id: number) => api.delete(`/admin/lichtap/${id}`),
};

export const facilityApi = {
  getAll: () => api.get("/admin/thietbi"),
  getById: (id: number) => api.get(`/admin/thietbi/${id}`),
  create: (data: any) => api.post("/admin/thietbi", data),
  update: (id: number, data: any) => api.put(`/admin/thietbi/${id}`, data),
  delete: (id: number) => api.delete(`/admin/thietbi/${id}`),
};

export const reportApi = {
  getRevenue: (startDate?: string, endDate?: string) =>
    api.get("/admin/baocao/doanhthu", { params: { startDate, endDate } }),
  getMemberStats: () => api.get("/admin/baocao/thanhvien"),
  getAttendance: (startDate?: string, endDate?: string) =>
    api.get("/admin/baocao/diemdanh", { params: { startDate, endDate } }),
};

// ─── User/Member API (Gateway: /user/...) ────────────────
export const profileApi = {
  getMe: () => api.get("/user/Profile"),
  updateMe: (data: any) => api.put("/user/Profile", data),
};

export const membershipApi = {
  getAll: () => api.get("/user/Memberships"),
  getActive: () => api.get("/user/Memberships/active"),
  register: (packageId: number) =>
    api.post("/user/Memberships/register", { maGoiTap: packageId }),
};

export const activityApi = {
  getCheckIns: () => api.get("/user/Activity/checkins"),
  getWorkouts: () => api.get("/user/Activity/workouts"),
  checkIn: () => api.post("/user/Activity/checkin"),
  checkOut: () => api.post("/user/Activity/checkout"),
};

export const userInvoiceApi = {
  getAll: () => api.get("/user/Invoices"),
  pay: (id: number, method: string) =>
    api.post(`/user/Invoices/${id}/pay`, { method }),
};

export const notificationApi = {
  getAll: () => api.get("/user/Notifications"),
  markAsRead: (id: number) => api.put(`/user/Notifications/${id}/read`),
};

// ─── Trainer API (Gateway: /trainer/...) ─────────────────
export const trainerScheduleApi = {
  getMySchedule: () => api.get("/trainer/schedule"),
  getMyStudents: () => api.get("/trainer/students"),
  getMyClasses: () => api.get("/trainer/classes"),
};

export const attendanceApi = {
  save: (data: any) => api.post("/trainer/attendance", data),
  getByDate: (date: string) => api.get(`/trainer/attendance/${date}`),
};

// ─── Public APIs (no auth needed) ────────────────────────
export const serviceApi = {
  getAll: () => api.get("/admin/dichvu"),
};

export const promotionApi = {
  getAll: () => api.get("/admin/khuyenmai"),
  getActive: () => api.get("/admin/khuyenmai/active"),
};

export const blogApi = {
  getAll: () => api.get("/admin/blog"),
  getById: (id: number) => api.get(`/admin/blog/${id}`),
};

export const careerApi = {
  getAll: () => api.get("/admin/tuyendung"),
  apply: (id: number, data: any) =>
    api.post(`/admin/tuyendung/${id}/apply`, data),
};

export const settingsApi = {
  getAll: () => api.get("/admin/caidat"),
  update: (data: any) => api.put("/admin/caidat", data),
};

export default api;
