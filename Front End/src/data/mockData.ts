// ============================================
// MOCK DATA - Dữ liệu giả lập cho development
// Tắt tất cả API calls, dùng data local
// ============================================

// Member Profile Data
export const mockMemberProfile = {
  name: "Nguyễn Văn A",
  email: "nguyenvana@email.com",
  phone: "0987654321",
  username: "nguyenvana",
  dateOfBirth: "1995-05-15",
  gender: "male",
  address: "123 Đường ABC, Quận 1, TP.HCM",
  emergencyContact: "Nguyễn Thị B",
  emergencyPhone: "0912345678",
  avatar:
    "https://ui-avatars.com/api/?name=Nguyen+Van+A&background=10b981&color=fff&size=200",
};

// Membership Data
export const mockMembership = {
  packageName: "Gói VIP 12 tháng",
  startDate: "2026-01-01",
  endDate: "2026-12-31",
  daysRemaining: 231,
  status: "active",
  sessionsUsed: 156,
  sessionsTotal: 365,
};

// Recent Check-ins
export const mockCheckIns = [
  { date: "2026-05-14", time: "06:30", duration: "90 phút" },
  { date: "2026-05-12", time: "18:00", duration: "75 phút" },
  { date: "2026-05-10", time: "06:30", duration: "85 phút" },
  { date: "2026-05-08", time: "19:00", duration: "60 phút" },
  { date: "2026-05-06", time: "06:30", duration: "90 phút" },
];

// Upcoming Classes
export const mockUpcomingClasses = [
  {
    id: 1,
    name: "Yoga Buổi Sáng",
    date: "2026-05-15",
    time: "06:00 - 07:00",
    trainer: "Nguyễn Thị Lan",
    room: "Phòng Yoga",
  },
  {
    id: 2,
    name: "Strength Training",
    date: "2026-05-15",
    time: "19:30 - 20:30",
    trainer: "Lê Hoàng Nam",
    room: "Phòng Tạ",
  },
  {
    id: 3,
    name: "CrossFit",
    date: "2026-05-16",
    time: "17:00 - 18:00",
    trainer: "Đỗ Văn Cường",
    room: "Phòng Group Class",
  },
];

// Members Data (Admin)
export const mockMembers = [
  {
    id: 1,
    maThe: "FZ001",
    hoTen: "Nguyễn Văn A",
    soDienThoai: "0987654321",
    email: "nguyenvana@email.com",
    ngayDangKy: "2025-01-15",
    trangThai: 1,
    goiTap: "Gói 12 tháng",
    ngayHetHan: "2026-01-15",
  },
  {
    id: 2,
    maThe: "FZ002",
    hoTen: "Trần Thị B",
    soDienThoai: "0912345678",
    email: "tranthib@email.com",
    ngayDangKy: "2025-03-20",
    trangThai: 1,
    goiTap: "Gói 6 tháng",
    ngayHetHan: "2025-09-20",
  },
  {
    id: 3,
    maThe: "FZ003",
    hoTen: "Lê Văn C",
    soDienThoai: "0923456789",
    email: "levanc@email.com",
    ngayDangKy: "2025-02-10",
    trangThai: 1,
    goiTap: "Gói 3 tháng",
    ngayHetHan: "2025-05-10",
  },
];

// Trainers Data
export const mockTrainers = [
  {
    id: 1,
    hoTen: "Lê Hoàng Nam",
    chuyenMon: "Strength Training, CrossFit",
    soDienThoai: "0923456789",
    email: "nam.le@fitzone.vn",
    trangThai: 1,
  },
  {
    id: 2,
    hoTen: "Phạm Thị Hương",
    chuyenMon: "Yoga, Pilates, Dance",
    soDienThoai: "0934567890",
    email: "huong.pham@fitzone.vn",
    trangThai: 1,
  },
  {
    id: 3,
    hoTen: "Trần Văn Mạnh",
    chuyenMon: "Cardio, Boxing, Spinning",
    soDienThoai: "0945678901",
    email: "manh.tran@fitzone.vn",
    trangThai: 1,
  },
];

// Packages Data
export const mockPackages = [
  {
    id: 1,
    tenGoiTap: "Gói 1 tháng",
    soThang: 1,
    gia: 500000,
    moTa: "Gói tập 1 tháng cơ bản",
    trangThai: 1,
  },
  {
    id: 2,
    tenGoiTap: "Gói 3 tháng",
    soThang: 3,
    gia: 1200000,
    moTa: "Gói tập 3 tháng tiết kiệm",
    trangThai: 1,
  },
  {
    id: 3,
    tenGoiTap: "Gói 6 tháng",
    soThang: 6,
    gia: 2000000,
    moTa: "Gói tập 6 tháng ưu đãi",
    trangThai: 1,
  },
  {
    id: 4,
    tenGoiTap: "Gói 12 tháng",
    soThang: 12,
    gia: 3500000,
    moTa: "Gói tập 1 năm VIP",
    trangThai: 1,
  },
];

// Check-in Data (Admin)
export const mockCheckInData = [
  {
    id: 1,
    maThanhVien: 1,
    hoTen: "Nguyễn Văn A",
    maThe: "FZ001",
    thoiGianVao: "2026-05-14T06:30:00",
    thoiGianRa: "2026-05-14T08:00:00",
    trangThai: "completed",
  },
  {
    id: 2,
    maThanhVien: 2,
    hoTen: "Trần Thị B",
    maThe: "FZ002",
    thoiGianVao: "2026-05-14T18:00:00",
    thoiGianRa: null,
    trangThai: "active",
  },
];

// Schedule/Classes Data
export const mockScheduleClasses = [
  {
    id: 1,
    tenLopHoc: "Yoga Buổi Sáng",
    loaiLopHoc: "Yoga",
    capDo: "Beginner",
    huanLuyenVien: "Nguyễn Thị Lan",
    phong: "Phòng Yoga",
    thu: 2,
    thoiGianBatDau: "06:00",
    thoiGianKetThuc: "07:00",
    sucChua: 20,
    daDangKy: 15,
    trangThai: 1,
  },
  {
    id: 2,
    tenLopHoc: "Cardio Kickboxing",
    loaiLopHoc: "Cardio",
    capDo: "Intermediate",
    huanLuyenVien: "Trần Văn Mạnh",
    phong: "Phòng Group Class",
    thu: 2,
    thoiGianBatDau: "18:00",
    thoiGianKetThuc: "19:00",
    sucChua: 25,
    daDangKy: 20,
    trangThai: 1,
  },
];

// Facilities/Equipment Data
export const mockFacilities = [
  {
    id: 1,
    tenThietBi: "Máy chạy bộ Technogym",
    phong: "Phòng Cardio",
    hangSanXuat: "Technogym",
    ngayMua: "2024-01-15",
    trangThai: "Hoạt động tốt",
  },
  {
    id: 2,
    tenThietBi: "Xe đạp Spinning",
    phong: "Phòng Cardio",
    hangSanXuat: "Life Fitness",
    ngayMua: "2024-02-20",
    trangThai: "Hoạt động tốt",
  },
  {
    id: 3,
    tenThietBi: "Bộ tạ đòn Olympic",
    phong: "Phòng Tạ",
    hangSanXuat: "Rogue Fitness",
    ngayMua: "2024-01-10",
    trangThai: "Hoạt động tốt",
  },
];

// Invoices Data
export const mockInvoices = [
  {
    id: 1,
    maHoaDon: "HD001",
    thanhVien: "Nguyễn Văn A",
    ngayLap: "2026-01-15",
    tongTien: 3500000,
    giamGia: 0,
    soTienPhaiTra: 3500000,
    trangThai: "Đã thanh toán",
  },
  {
    id: 2,
    maHoaDon: "HD002",
    thanhVien: "Trần Thị B",
    ngayLap: "2026-03-20",
    tongTien: 2000000,
    giamGia: 200000,
    soTienPhaiTra: 1800000,
    trangThai: "Đã thanh toán",
  },
];

// Services Data
export const mockServices = [
  {
    id: 1,
    tenDichVu: "Massage thư giãn",
    loaiDichVu: "Spa",
    gia: 300000,
    thoiLuong: 60,
    moTa: "Massage toàn thân thư giãn",
    hinhAnh: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400",
  },
  {
    id: 2,
    tenDichVu: "Tư vấn dinh dưỡng",
    loaiDichVu: "Nutrition",
    gia: 500000,
    thoiLuong: 45,
    moTa: "Tư vấn chế độ ăn uống phù hợp",
    hinhAnh:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400",
  },
  {
    id: 3,
    tenDichVu: "Đo chỉ số cơ thể",
    loaiDichVu: "Health Check",
    gia: 200000,
    thoiLuong: 30,
    moTa: "Đo và phân tích chỉ số cơ thể",
    hinhAnh:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
  },
];

// Promotions Data
export const mockPromotions = [
  {
    id: 1,
    tenKhuyenMai: "Giảm 20% gói 12 tháng",
    maCode: "VIP2026",
    loaiGiamGia: "Percent",
    giaTriGiam: 20,
    ngayBatDau: "2026-05-01",
    ngayKetThuc: "2026-05-31",
    trangThai: "active",
    hinhAnh:
      "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400",
  },
  {
    id: 2,
    tenKhuyenMai: "Tặng 1 tháng khi đăng ký 6 tháng",
    maCode: "SUMMER2026",
    loaiGiamGia: "FixedAmount",
    giaTriGiam: 500000,
    ngayBatDau: "2026-06-01",
    ngayKetThuc: "2026-08-31",
    trangThai: "upcoming",
    hinhAnh:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400",
  },
];

// Blog Posts Data
export const mockBlogPosts = [
  {
    id: 1,
    tieuDe: "10 Bài Tập Cardio Đốt Cháy Mỡ Hiệu Quả",
    tomTat:
      "Khám phá những bài tập cardio giúp bạn đốt cháy calories nhanh chóng",
    noiDung: "Nội dung chi tiết về các bài tập cardio...",
    hinhAnh:
      "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800",
    tacGia: "Trần Văn Mạnh",
    danhMuc: "Tips",
    luotXem: 1250,
    ngayDang: "2026-05-10",
  },
  {
    id: 2,
    tieuDe: "Chế Độ Ăn Uống Cho Người Tập Gym",
    tomTat:
      "Hướng dẫn xây dựng chế độ dinh dưỡng phù hợp với mục tiêu tập luyện",
    noiDung: "Nội dung chi tiết về dinh dưỡng...",
    hinhAnh:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800",
    tacGia: "Phạm Thị Hương",
    danhMuc: "Nutrition",
    luotXem: 980,
    ngayDang: "2026-05-08",
  },
];

// Career/Job Postings Data
export const mockCareers = [
  {
    id: 1,
    tieuDe: "Tuyển Huấn Luyện Viên Yoga",
    viTri: "Huấn luyện viên Yoga",
    moTaCongViec: "Hướng dẫn các lớp Yoga cho hội viên",
    yeuCau: "Có chứng chỉ Yoga quốc tế, kinh nghiệm 2 năm",
    quyenLoi: "Lương cạnh tranh, bảo hiểm đầy đủ",
    mucLuong: "12-18 triệu",
    soLuong: 2,
    hanNop: "2026-06-30",
    trangThai: 1,
  },
  {
    id: 2,
    tieuDe: "Tuyển Nhân Viên Lễ Tân",
    viTri: "Lễ tân",
    moTaCongViec: "Tiếp đón khách hàng, hỗ trợ đăng ký",
    yeuCau: "Giao tiếp tốt, ngoại hình khá",
    quyenLoi: "Môi trường trẻ trung, năng động",
    mucLuong: "8-12 triệu",
    soLuong: 1,
    hanNop: "2026-05-31",
    trangThai: 1,
  },
];

// Dashboard Stats
export const mockDashboardStats = {
  totalMembers: 245,
  activeMembers: 198,
  newMembersThisMonth: 12,
  todayCheckIns: 87,
  monthlyRevenue: 125000000,
  revenueGrowth: 15.5,
};

// Export all mock data
export default {
  mockMemberProfile,
  mockMembership,
  mockCheckIns,
  mockUpcomingClasses,
  mockMembers,
  mockTrainers,
  mockPackages,
  mockCheckInData,
  mockScheduleClasses,
  mockFacilities,
  mockInvoices,
  mockServices,
  mockPromotions,
  mockBlogPosts,
  mockCareers,
  mockDashboardStats,
};
