// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Auth Types
export interface LoginRequest {
  tenDangNhap: string;
  matKhau: string;
}

export interface LoginResponse {
  token: string;
  vaiTro: string;
  userId: number;
  hoTen: string;
}

export interface RegisterRequest {
  hoTen: string;
  email: string;
  soDienThoai: string;
  tenDangNhap: string;
  matKhau: string;
}

// Member Types
export interface Member {
  id: number;
  hoTen: string;
  soDienThoai: string;
  email: string;
  ngaySinh: string;
  gioiTinh: string;
  diaChi: string;
}

export interface ThanhVien {
  maThanhVien: number;
  maThe?: string;
  hoTen: string;
  ngaySinh?: string;
  gioiTinh?: string;
  soDienThoai?: string;
  email?: string;
  diaChi?: string;
  ngayDangKy: string;
  trangThai: number;
  ghiChu?: string;
}

// Trainer Types
export interface Trainer {
  id: number;
  hoTen: string;
  soDienThoai: string;
  email: string;
  chuyenMon: string;
}

// Package Types
export interface Package {
  id: number;
  tenGoiTap: string;
  moTa: string;
  gia: number;
  thoiHan: number;
}

export interface GoiTap {
  maGoiTap: number;
  tenGoiTap: string;
  soThang: number;
  soLanTapToiDa?: number;
  gia: number;
  moTa?: string;
  trangThai: number;
}

// Check-in Types
export interface CheckIn {
  id: number;
  thanhVienId: number;
  thoiGianVao: string;
  thoiGianRa?: string;
}

export interface DiemDanh {
  maDiemDanh: number;
  maThanhVien: number;
  thoiGianVao: string;
  thoiGianRa?: string;
  hinhThuc?: string;
  ghiChu?: string;
}

// Profile Types
export interface ProfileData {
  hoTen: string;
  email: string;
  soDienThoai: string;
  tenDangNhap: string;
  ngaySinh?: string;
  gioiTinh?: string;
  diaChi?: string;
  nguoiLienHe?: string;
  sdtLienHe?: string;
}

// Membership Types
export interface HopDongGoiTap {
  maHopDong: number;
  maThanhVien: number;
  maGoiTap: number;
  tenGoiTap: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  tongTien: number;
  soTienGiam: number;
  soTienPhaiTra: number;
  trangThai: number;
}

// Workout Types
export interface BuoiTap {
  maBuoiTap: number;
  maThanhVien: number;
  ngayTap: string;
  thoiGianBatDau?: string;
  thoiGianKetThuc?: string;
  baiTap?: string;
  thoiLuong?: number;
  calories?: number;
  ghiChu?: string;
}

// Class Schedule Types
export interface LopHoc {
  maLopHoc: number;
  tenLopHoc: string;
  maHuanLuyenVien?: number;
  tenHuanLuyenVien?: string;
  maPhong?: number;
  tenPhong?: string;
  loaiLopHoc?: string;
  capDo?: string;
  sucChua: number;
  thoiLuong: number;
  moTa?: string;
  trangThai: number;
}

export interface LichTapLopHoc {
  maLichTap: number;
  maLopHoc: number;
  thu: number;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  ngayBatDau: string;
  ngayKetThuc?: string;
  trangThai: number;
  lopHoc?: LopHoc;
  soNguoiDangKy?: number;
}

export interface DangKyLopHoc {
  maDangKy: number;
  maThanhVien: number;
  maLichTap: number;
  ngayDangKy: string;
  trangThai: number;
}

// Invoice Types
export interface HoaDon {
  maHoaDon: number;
  maThanhVien?: number;
  maNhanVienLap: number;
  ngayLap: string;
  tongTien: number;
  giamGia: number;
  soTienPhaiTra: number;
  trangThai: number;
  ghiChu?: string;
}

// Notification Types
export interface ThongBao {
  maThongBao: number;
  maThanhVien?: number;
  tieuDe: string;
  noiDung?: string;
  loaiThongBao: string;
  ngayTao: string;
  ngayGui?: string;
  daDoc: boolean;
  trangThai: number;
}
