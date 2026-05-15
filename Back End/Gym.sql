--------------------------------------------------
-- Tao database (neu chua co)
--------------------------------------------------
CREATE DATABASE GymManagement;
GO

USE GymManagement;
GO

--------------------------------------------------
-- NHOM 1: DANH MUC HE THONG
--------------------------------------------------

-- Bang quyen/vai tro he thong (Admin, HLV, Hoi vien)
CREATE TABLE dbo.VaiTro (
    MaVaiTro    INT IDENTITY(1,1) PRIMARY KEY,
    TenVaiTro   NVARCHAR(100) NOT NULL,
    MoTa        NVARCHAR(255) NULL
);

-- Bang chuc vu nhan vien
CREATE TABLE dbo.ChucVu (
    MaChucVu    INT IDENTITY(1,1) PRIMARY KEY,
    TenChucVu   NVARCHAR(100) NOT NULL,
    MoTa        NVARCHAR(255) NULL
);

--------------------------------------------------
-- NHOM 2: PHONG TAP, THIET BI, GOI TAP
--------------------------------------------------

-- Phong tap
CREATE TABLE dbo.PhongTap (
    MaPhong     INT IDENTITY(1,1) PRIMARY KEY,
    TenPhong    NVARCHAR(100) NOT NULL,
    SucChua     INT NULL,
    MoTa        NVARCHAR(255) NULL,
    TrangThai   TINYINT NOT NULL DEFAULT 1
);

-- Thiet bi trong phong tap
CREATE TABLE dbo.ThietBi (
    MaThietBi   INT IDENTITY(1,1) PRIMARY KEY,
    TenThietBi  NVARCHAR(100) NOT NULL,
    MaPhong     INT NULL,
    HangSanXuat NVARCHAR(100) NULL,
    NgayMua     DATE NULL,
    GiaMua      DECIMAL(18,2) NULL,
    TrangThai   NVARCHAR(50) NULL,
    MoTa        NVARCHAR(255) NULL,
    CONSTRAINT FK_ThietBi_PhongTap FOREIGN KEY (MaPhong) REFERENCES dbo.PhongTap(MaPhong)
);

-- Goi tap
CREATE TABLE dbo.GoiTap (
    MaGoiTap        INT IDENTITY(1,1) PRIMARY KEY,
    TenGoiTap       NVARCHAR(100) NOT NULL,
    SoThang         INT NOT NULL,
    SoLanTapToiDa   INT NULL,
    Gia             DECIMAL(18,2) NOT NULL,
    MoTa            NVARCHAR(255) NULL,
    TrangThai       TINYINT NOT NULL DEFAULT 1
);

-- Goi PT (Personal Training)
CREATE TABLE dbo.GoiPT (
    MaGoiPT     INT IDENTITY(1,1) PRIMARY KEY,
    TenGoiPT    NVARCHAR(100) NOT NULL,
    SoBuoi      INT NOT NULL,
    Gia         DECIMAL(18,2) NOT NULL,
    MoTa        NVARCHAR(255) NULL,
    TrangThai   TINYINT NOT NULL DEFAULT 1
);


--------------------------------------------------
-- NHOM 3: THANH VIEN & NHAN VIEN
--------------------------------------------------

-- Thanh vien (hoi vien)
CREATE TABLE dbo.ThanhVien (
    MaThanhVien INT IDENTITY(1,1) PRIMARY KEY,
    MaThe       NVARCHAR(20) NULL UNIQUE,
    HoTen       NVARCHAR(100) NOT NULL,
    NgaySinh    DATE NULL,
    GioiTinh    CHAR(1) NULL,
    SoDienThoai NVARCHAR(20) NULL,
    Email       NVARCHAR(100) NULL,
    DiaChi      NVARCHAR(255) NULL,
    NgayDangKy  DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    TrangThai   TINYINT NOT NULL DEFAULT 1,
    GhiChu      NVARCHAR(255) NULL
);

-- Nhan vien
CREATE TABLE dbo.NhanVien (
    MaNhanVien  INT IDENTITY(1,1) PRIMARY KEY,
    HoTen       NVARCHAR(100) NOT NULL,
    NgaySinh    DATE NULL,
    GioiTinh    CHAR(1) NULL,
    SoDienThoai NVARCHAR(20) NULL,
    Email       NVARCHAR(100) NULL,
    DiaChi      NVARCHAR(255) NULL,
    NgayVaoLam  DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    MaChucVu    INT NULL,
    TrangThai   TINYINT NOT NULL DEFAULT 1,
    GhiChu      NVARCHAR(255) NULL,
    CONSTRAINT FK_NhanVien_ChucVu FOREIGN KEY (MaChucVu) REFERENCES dbo.ChucVu(MaChucVu)
);

-- Huan luyen vien (mo rong tu nhan vien)
CREATE TABLE dbo.HuanLuyenVien (
    MaHuanLuyenVien INT IDENTITY(1,1) PRIMARY KEY,
    MaNhanVien      INT NOT NULL UNIQUE,
    ChuyenMon       NVARCHAR(100) NULL,
    MoTa            NVARCHAR(255) NULL,
    MucLuongCoBan   DECIMAL(18,2) NULL,
    TiLeHoaHongPT   DECIMAL(5,2) NULL,
    CONSTRAINT FK_HLV_NhanVien FOREIGN KEY (MaNhanVien) REFERENCES dbo.NhanVien(MaNhanVien)
);

--------------------------------------------------
-- NHOM 4: TAI KHOAN HE THONG
--------------------------------------------------

CREATE TABLE dbo.TaiKhoan (
    MaTaiKhoan  INT IDENTITY(1,1) PRIMARY KEY,
    TenDangNhap NVARCHAR(50) NOT NULL UNIQUE,
    MatKhauHash NVARCHAR(255) NOT NULL,
    MaVaiTro    INT NOT NULL,
    MaNhanVien  INT NULL,
    MaThanhVien INT NULL,
    TrangThai   TINYINT NOT NULL DEFAULT 1,
    NgayTao     DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_TaiKhoan_VaiTro FOREIGN KEY (MaVaiTro) REFERENCES dbo.VaiTro(MaVaiTro),
    CONSTRAINT FK_TaiKhoan_NhanVien FOREIGN KEY (MaNhanVien) REFERENCES dbo.NhanVien(MaNhanVien),
    CONSTRAINT FK_TaiKhoan_ThanhVien FOREIGN KEY (MaThanhVien) REFERENCES dbo.ThanhVien(MaThanhVien)
);


--------------------------------------------------
-- NHOM 5: HOP DONG GOI TAP & PT
--------------------------------------------------

-- Hop dong mua goi tap
CREATE TABLE dbo.HopDongGoiTap (
    MaHopDong       INT IDENTITY(1,1) PRIMARY KEY,
    MaThanhVien     INT NOT NULL,
    MaGoiTap        INT NOT NULL,
    NgayBatDau      DATE NOT NULL,
    NgayKetThuc     DATE NOT NULL,
    TongTien        DECIMAL(18,2) NOT NULL,
    SoTienGiam      DECIMAL(18,2) NOT NULL DEFAULT 0,
    SoTienPhaiTra   DECIMAL(18,2) NOT NULL,
    TrangThai       TINYINT NOT NULL DEFAULT 1,
    NgayTao         DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    MaNhanVienTao   INT NULL,
    GhiChu          NVARCHAR(255) NULL,
    CONSTRAINT FK_HopDongGT_ThanhVien FOREIGN KEY (MaThanhVien) REFERENCES dbo.ThanhVien(MaThanhVien),
    CONSTRAINT FK_HopDongGT_GoiTap FOREIGN KEY (MaGoiTap) REFERENCES dbo.GoiTap(MaGoiTap),
    CONSTRAINT FK_HopDongGT_NhanVien FOREIGN KEY (MaNhanVienTao) REFERENCES dbo.NhanVien(MaNhanVien)
);

-- Hop dong PT (Personal Training)
CREATE TABLE dbo.HopDongPT (
    MaHopDongPT     INT IDENTITY(1,1) PRIMARY KEY,
    MaThanhVien     INT NOT NULL,
    MaHuanLuyenVien INT NOT NULL,
    MaGoiPT         INT NOT NULL,
    NgayBatDau      DATE NOT NULL,
    NgayKetThuc     DATE NOT NULL,
    SoBuoiConLai    INT NOT NULL,
    TongTien        DECIMAL(18,2) NOT NULL,
    SoTienGiam      DECIMAL(18,2) NOT NULL DEFAULT 0,
    SoTienPhaiTra   DECIMAL(18,2) NOT NULL,
    TrangThai       TINYINT NOT NULL DEFAULT 1,
    NgayTao         DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    MaNhanVienTao   INT NULL,
    GhiChu          NVARCHAR(255) NULL,
    CONSTRAINT FK_HopDongPT_ThanhVien FOREIGN KEY (MaThanhVien) REFERENCES dbo.ThanhVien(MaThanhVien),
    CONSTRAINT FK_HopDongPT_HLV FOREIGN KEY (MaHuanLuyenVien) REFERENCES dbo.HuanLuyenVien(MaHuanLuyenVien),
    CONSTRAINT FK_HopDongPT_GoiPT FOREIGN KEY (MaGoiPT) REFERENCES dbo.GoiPT(MaGoiPT),
    CONSTRAINT FK_HopDongPT_NhanVien FOREIGN KEY (MaNhanVienTao) REFERENCES dbo.NhanVien(MaNhanVien)
);

-- Buoi tap PT cu the
CREATE TABLE dbo.BuoiTapPT (
    MaBuoiTapPT     INT IDENTITY(1,1) PRIMARY KEY,
    MaHopDongPT     INT NOT NULL,
    ThoiGianBatDau  DATETIME2 NOT NULL,
    ThoiGianKetThuc DATETIME2 NOT NULL,
    TrangThai       TINYINT NOT NULL DEFAULT 1,
    GhiChu          NVARCHAR(255) NULL,
    CONSTRAINT FK_BuoiTapPT_HopDongPT FOREIGN KEY (MaHopDongPT) REFERENCES dbo.HopDongPT(MaHopDongPT)
);


--------------------------------------------------
-- NHOM 6: CHECK-IN & BUOI TAP
--------------------------------------------------

-- Diem danh thanh vien (check-in)
CREATE TABLE dbo.DiemDanh (
    MaDiemDanh      INT IDENTITY(1,1) PRIMARY KEY,
    MaThanhVien     INT NOT NULL,
    ThoiGianVao     DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    ThoiGianRa      DATETIME2 NULL,
    HinhThuc        NVARCHAR(50) NULL,
    GhiChu          NVARCHAR(255) NULL,
    CONSTRAINT FK_DiemDanh_ThanhVien FOREIGN KEY (MaThanhVien) REFERENCES dbo.ThanhVien(MaThanhVien)
);

-- Buoi tap cua hoi vien (ghi nhan sessions)
CREATE TABLE dbo.BuoiTap (
    MaBuoiTap       INT IDENTITY(1,1) PRIMARY KEY,
    MaThanhVien     INT NOT NULL,
    MaHopDong       INT NULL,
    NgayTap         DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    ThoiGianBatDau  DATETIME2 NULL,
    ThoiGianKetThuc DATETIME2 NULL,
    GhiChu          NVARCHAR(255) NULL,
    CONSTRAINT FK_BuoiTap_ThanhVien FOREIGN KEY (MaThanhVien) REFERENCES dbo.ThanhVien(MaThanhVien),
    CONSTRAINT FK_BuoiTap_HopDong FOREIGN KEY (MaHopDong) REFERENCES dbo.HopDongGoiTap(MaHopDong)
);

--------------------------------------------------
-- NHOM 7: HOA DON & THANH TOAN
--------------------------------------------------

-- Hoa don
CREATE TABLE dbo.HoaDon (
    MaHoaDon        INT IDENTITY(1,1) PRIMARY KEY,
    MaThanhVien     INT NULL,
    MaNhanVienLap   INT NOT NULL,
    NgayLap         DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    TongTien        DECIMAL(18,2) NOT NULL,
    GiamGia         DECIMAL(18,2) NOT NULL DEFAULT 0,
    SoTienPhaiTra   DECIMAL(18,2) NOT NULL,
    TrangThai       TINYINT NOT NULL DEFAULT 1,
    GhiChu          NVARCHAR(255) NULL,
    CONSTRAINT FK_HoaDon_ThanhVien FOREIGN KEY (MaThanhVien) REFERENCES dbo.ThanhVien(MaThanhVien),
    CONSTRAINT FK_HoaDon_NhanVien FOREIGN KEY (MaNhanVienLap) REFERENCES dbo.NhanVien(MaNhanVien)
);

-- Chi tiet hoa don
CREATE TABLE dbo.ChiTietHoaDon (
    MaChiTiet       INT IDENTITY(1,1) PRIMARY KEY,
    MaHoaDon        INT NOT NULL,
    LoaiSanPham     NVARCHAR(50) NOT NULL,
    MaThamChieu     INT NOT NULL,
    SoLuong         INT NOT NULL DEFAULT 1,
    DonGia          DECIMAL(18,2) NOT NULL,
    ThanhTien       DECIMAL(18,2) NOT NULL,
    CONSTRAINT FK_ChiTietHoaDon_HoaDon FOREIGN KEY (MaHoaDon) REFERENCES dbo.HoaDon(MaHoaDon)
);

-- Thanh toan (1 hoa don co the tra nhieu lan)
CREATE TABLE dbo.ThanhToan (
    MaThanhToan     INT IDENTITY(1,1) PRIMARY KEY,
    MaHoaDon        INT NOT NULL,
    SoTien          DECIMAL(18,2) NOT NULL,
    NgayThanhToan   DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    HinhThuc        NVARCHAR(50) NOT NULL,
    GhiChu          NVARCHAR(255) NULL,
    CONSTRAINT FK_ThanhToan_HoaDon FOREIGN KEY (MaHoaDon) REFERENCES dbo.HoaDon(MaHoaDon)
);


--------------------------------------------------
-- NHOM 8: THONG BAO & AUDIT
--------------------------------------------------

-- Thong bao (nhac han, thong bao chung)
CREATE TABLE dbo.ThongBao (
    MaThongBao      INT IDENTITY(1,1) PRIMARY KEY,
    MaThanhVien     INT NULL,
    TieuDe          NVARCHAR(200) NOT NULL,
    NoiDung         NVARCHAR(MAX) NULL,
    LoaiThongBao    NVARCHAR(50) NOT NULL,
    NgayTao         DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    NgayGui         DATETIME2 NULL,
    DaDoc           BIT NOT NULL DEFAULT 0,
    TrangThai       TINYINT NOT NULL DEFAULT 1,
    CONSTRAINT FK_ThongBao_ThanhVien FOREIGN KEY (MaThanhVien) REFERENCES dbo.ThanhVien(MaThanhVien)
);

-- Lich su thay doi goi (audit)
CREATE TABLE dbo.LichSuThayDoiGoi (
    MaLichSu        INT IDENTITY(1,1) PRIMARY KEY,
    MaHopDong       INT NOT NULL,
    LoaiThayDoi     NVARCHAR(50) NOT NULL,
    NoiDungCu       NVARCHAR(MAX) NULL,
    NoiDungMoi      NVARCHAR(MAX) NULL,
    NgayThayDoi     DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    MaNguoiThayDoi  INT NULL,
    GhiChu          NVARCHAR(255) NULL,
    CONSTRAINT FK_LichSu_HopDong FOREIGN KEY (MaHopDong) REFERENCES dbo.HopDongGoiTap(MaHopDong),
    CONSTRAINT FK_LichSu_NguoiThayDoi FOREIGN KEY (MaNguoiThayDoi) REFERENCES dbo.NhanVien(MaNhanVien)
);
GO

--------------------------------------------------
-- DU LIEU MAU
--------------------------------------------------

INSERT INTO dbo.VaiTro (TenVaiTro, MoTa) VALUES 
(N'Admin', N'Quản trị hệ thống'),
(N'HuanLuyenVien', N'Huấn luyện viên'),
(N'HoiVien', N'Hội viên');

INSERT INTO dbo.ChucVu (TenChucVu, MoTa) VALUES 
(N'Quản lý', N'Quản lý phòng tập'),
(N'Lễ tân', N'Tiếp đón khách hàng'),
(N'Huấn luyện viên', N'Hướng dẫn tập luyện'),
(N'Kế toán', N'Quản lý tài chính');

INSERT INTO dbo.GoiTap (TenGoiTap, SoThang, Gia, MoTa) VALUES
(N'Gói 1 tháng', 1, 500000, N'Gói tập 1 tháng cơ bản'),
(N'Gói 3 tháng', 3, 1200000, N'Gói tập 3 tháng tiết kiệm'),
(N'Gói 6 tháng', 6, 2000000, N'Gói tập 6 tháng ưu đãi'),
(N'Gói 12 tháng', 12, 3500000, N'Gói tập 1 năm VIP');

INSERT INTO dbo.GoiPT (TenGoiPT, SoBuoi, Gia, MoTa) VALUES
(N'PT 10 buổi', 10, 2000000, N'Gói PT 10 buổi'),
(N'PT 20 buổi', 20, 3500000, N'Gói PT 20 buổi'),
(N'PT 30 buổi', 30, 4500000, N'Gói PT 30 buổi');
GO

--------------------------------------------------
-- NHOM 9: LICH TAP & LOP HOC (BỔ SUNG)
--------------------------------------------------

-- Lop hoc nhom (Group Classes)
CREATE TABLE dbo.LopHoc (
    MaLopHoc        INT IDENTITY(1,1) PRIMARY KEY,
    TenLopHoc       NVARCHAR(100) NOT NULL,
    MaHuanLuyenVien INT NULL,
    MaPhong         INT NULL,
    LoaiLopHoc      NVARCHAR(50) NULL, -- Yoga, Cardio, Strength, Dance, etc.
    CapDo           NVARCHAR(20) NULL, -- Beginner, Intermediate, Advanced
    SucChua         INT NOT NULL DEFAULT 20,
    ThoiLuong       INT NOT NULL, -- Phút
    MoTa            NVARCHAR(500) NULL,
    TrangThai       TINYINT NOT NULL DEFAULT 1,
    CONSTRAINT FK_LopHoc_HLV FOREIGN KEY (MaHuanLuyenVien) REFERENCES dbo.HuanLuyenVien(MaHuanLuyenVien),
    CONSTRAINT FK_LopHoc_PhongTap FOREIGN KEY (MaPhong) REFERENCES dbo.PhongTap(MaPhong)
);

-- Lich tap lop hoc (Schedule)
CREATE TABLE dbo.LichTapLopHoc (
    MaLichTap       INT IDENTITY(1,1) PRIMARY KEY,
    MaLopHoc        INT NOT NULL,
    Thu             TINYINT NOT NULL, -- 2=Monday, 3=Tuesday, ..., 8=Sunday
    ThoiGianBatDau  TIME NOT NULL,
    ThoiGianKetThuc TIME NOT NULL,
    NgayBatDau      DATE NOT NULL, -- Ngày bắt đầu áp dụng lịch
    NgayKetThuc     DATE NULL, -- NULL = vô thời hạn
    TrangThai       TINYINT NOT NULL DEFAULT 1,
    CONSTRAINT FK_LichTap_LopHoc FOREIGN KEY (MaLopHoc) REFERENCES dbo.LopHoc(MaLopHoc),
    CONSTRAINT CHK_Thu CHECK (Thu BETWEEN 2 AND 8)
);

-- Dang ky lop hoc
CREATE TABLE dbo.DangKyLopHoc (
    MaDangKy        INT IDENTITY(1,1) PRIMARY KEY,
    MaThanhVien     INT NOT NULL,
    MaLichTap       INT NOT NULL,
    NgayDangKy      DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    TrangThai       TINYINT NOT NULL DEFAULT 1, -- 1=Active, 0=Cancelled
    GhiChu          NVARCHAR(255) NULL,
    CONSTRAINT FK_DangKy_ThanhVien FOREIGN KEY (MaThanhVien) REFERENCES dbo.ThanhVien(MaThanhVien),
    CONSTRAINT FK_DangKy_LichTap FOREIGN KEY (MaLichTap) REFERENCES dbo.LichTapLopHoc(MaLichTap),
    CONSTRAINT UQ_DangKy UNIQUE (MaThanhVien, MaLichTap)
);

--------------------------------------------------
-- NHOM 10: KHUYEN MAI & DICH VU (BỔ SUNG)
--------------------------------------------------

-- Khuyen mai
CREATE TABLE dbo.KhuyenMai (
    MaKhuyenMai     INT IDENTITY(1,1) PRIMARY KEY,
    TenKhuyenMai    NVARCHAR(200) NOT NULL,
    MaCode          NVARCHAR(50) NULL UNIQUE,
    LoaiGiamGia     NVARCHAR(20) NOT NULL, -- Percent, FixedAmount
    GiaTriGiam      DECIMAL(18,2) NOT NULL,
    GiamToiDa       DECIMAL(18,2) NULL, -- Giảm tối đa (cho % discount)
    NgayBatDau      DATE NOT NULL,
    NgayKetThuc     DATE NOT NULL,
    SoLuongToiDa    INT NULL, -- Số lượng mã có thể dùng
    SoLuongDaDung   INT NOT NULL DEFAULT 0,
    DieuKienApDung  NVARCHAR(500) NULL, -- Điều kiện áp dụng
    TrangThai       TINYINT NOT NULL DEFAULT 1,
    MoTa            NVARCHAR(500) NULL,
    CONSTRAINT CHK_LoaiGiamGia CHECK (LoaiGiamGia IN ('Percent', 'FixedAmount'))
);

-- Dich vu bo sung (Spa, Massage, Nutrition, etc.)
CREATE TABLE dbo.DichVu (
    MaDichVu        INT IDENTITY(1,1) PRIMARY KEY,
    TenDichVu       NVARCHAR(100) NOT NULL,
    LoaiDichVu      NVARCHAR(50) NULL,
    Gia             DECIMAL(18,2) NOT NULL,
    ThoiLuong       INT NULL, -- Phút
    MoTa            NVARCHAR(500) NULL,
    TrangThai       TINYINT NOT NULL DEFAULT 1
);

-- Su dung dich vu
CREATE TABLE dbo.SuDungDichVu (
    MaSuDung        INT IDENTITY(1,1) PRIMARY KEY,
    MaThanhVien     INT NOT NULL,
    MaDichVu        INT NOT NULL,
    NgaySuDung      DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    SoLuong         INT NOT NULL DEFAULT 1,
    ThanhTien       DECIMAL(18,2) NOT NULL,
    TrangThai       TINYINT NOT NULL DEFAULT 1,
    GhiChu          NVARCHAR(255) NULL,
    CONSTRAINT FK_SuDung_ThanhVien FOREIGN KEY (MaThanhVien) REFERENCES dbo.ThanhVien(MaThanhVien),
    CONSTRAINT FK_SuDung_DichVu FOREIGN KEY (MaDichVu) REFERENCES dbo.DichVu(MaDichVu)
);

--------------------------------------------------
-- NHOM 11: BLOG & TUYEN DUNG (BỔ SUNG)
--------------------------------------------------

-- Bai viet blog
CREATE TABLE dbo.BaiViet (
    MaBaiViet       INT IDENTITY(1,1) PRIMARY KEY,
    TieuDe          NVARCHAR(200) NOT NULL,
    TomTat          NVARCHAR(500) NULL,
    NoiDung         NVARCHAR(MAX) NOT NULL,
    HinhAnh         NVARCHAR(255) NULL,
    TacGia          NVARCHAR(100) NULL,
    MaNhanVien      INT NULL,
    DanhMuc         NVARCHAR(50) NULL, -- Tips, News, Success Stories, etc.
    LuotXem         INT NOT NULL DEFAULT 0,
    NgayDang        DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    NgayCapNhat     DATETIME2 NULL,
    TrangThai       TINYINT NOT NULL DEFAULT 1, -- 0=Draft, 1=Published
    CONSTRAINT FK_BaiViet_NhanVien FOREIGN KEY (MaNhanVien) REFERENCES dbo.NhanVien(MaNhanVien)
);

-- Vi tri tuyen dung
CREATE TABLE dbo.TuyenDung (
    MaTuyenDung     INT IDENTITY(1,1) PRIMARY KEY,
    TieuDe          NVARCHAR(200) NOT NULL,
    ViTri           NVARCHAR(100) NOT NULL,
    MoTaCongViec    NVARCHAR(MAX) NOT NULL,
    YeuCau          NVARCHAR(MAX) NULL,
    QuyenLoi        NVARCHAR(MAX) NULL,
    MucLuong        NVARCHAR(100) NULL,
    SoLuong         INT NOT NULL DEFAULT 1,
    HanNop          DATE NULL,
    NgayDang        DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    TrangThai       TINYINT NOT NULL DEFAULT 1, -- 1=Active, 0=Closed
    CONSTRAINT CHK_SoLuong CHECK (SoLuong > 0)
);

-- Ho so ung tuyen
CREATE TABLE dbo.UngTuyen (
    MaUngTuyen      INT IDENTITY(1,1) PRIMARY KEY,
    MaTuyenDung     INT NOT NULL,
    HoTen           NVARCHAR(100) NOT NULL,
    Email           NVARCHAR(100) NOT NULL,
    SoDienThoai     NVARCHAR(20) NOT NULL,
    NgaySinh        DATE NULL,
    DiaChi          NVARCHAR(255) NULL,
    HoSo            NVARCHAR(255) NULL, -- Link to CV file
    ThuGioiThieu    NVARCHAR(MAX) NULL,
    NgayNop         DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    TrangThai       NVARCHAR(50) NOT NULL DEFAULT N'Chờ xử lý', -- Chờ xử lý, Đã xem, Phỏng vấn, Từ chối, Chấp nhận
    GhiChu          NVARCHAR(500) NULL,
    CONSTRAINT FK_UngTuyen_TuyenDung FOREIGN KEY (MaTuyenDung) REFERENCES dbo.TuyenDung(MaTuyenDung)
);

--------------------------------------------------
-- NHOM 12: CAI DAT HE THONG (BỔ SUNG)
--------------------------------------------------

-- Cai dat he thong
CREATE TABLE dbo.CaiDat (
    MaCaiDat        INT IDENTITY(1,1) PRIMARY KEY,
    TenCaiDat       NVARCHAR(100) NOT NULL UNIQUE,
    GiaTri          NVARCHAR(500) NULL,
    LoaiDuLieu      NVARCHAR(20) NOT NULL DEFAULT 'String', -- String, Number, Boolean, JSON
    MoTa            NVARCHAR(255) NULL,
    NgayCapNhat     DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

-- Nhat ky hoat dong (Activity Log)
CREATE TABLE dbo.NhatKyHoatDong (
    MaNhatKy        INT IDENTITY(1,1) PRIMARY KEY,
    MaTaiKhoan      INT NULL,
    HanhDong        NVARCHAR(100) NOT NULL,
    BangDuLieu      NVARCHAR(50) NULL,
    MaThamChieu     INT NULL,
    NoiDung         NVARCHAR(MAX) NULL,
    DiaChi IP       NVARCHAR(50) NULL,
    ThoiGian        DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_NhatKy_TaiKhoan FOREIGN KEY (MaTaiKhoan) REFERENCES dbo.TaiKhoan(MaTaiKhoan)
);

--------------------------------------------------
-- DU LIEU MAU BO SUNG
--------------------------------------------------

-- Phong tap mau
INSERT INTO dbo.PhongTap (TenPhong, SucChua, MoTa) VALUES
(N'Phòng Cardio', 30, N'Phòng tập cardio với máy chạy bộ, xe đạp'),
(N'Phòng Yoga', 25, N'Phòng tập yoga yên tĩnh'),
(N'Phòng Tạ', 20, N'Phòng tập tạ và sức mạnh'),
(N'Phòng Group Class', 40, N'Phòng tập lớp nhóm');

-- Lop hoc mau
INSERT INTO dbo.LopHoc (TenLopHoc, LoaiLopHoc, CapDo, SucChua, ThoiLuong, MoTa) VALUES
(N'Yoga Buổi Sáng', N'Yoga', N'Beginner', 20, 60, N'Lớp yoga nhẹ nhàng giúp khởi động cơ thể buổi sáng'),
(N'Cardio Kickboxing', N'Cardio', N'Intermediate', 25, 60, N'Đốt cháy calories với kickboxing năng động'),
(N'Strength Training', N'Strength', N'Advanced', 15, 60, N'Tập luyện sức mạnh với tạ và thiết bị chuyên nghiệp'),
(N'Zumba Dance', N'Dance', N'Beginner', 30, 60, N'Nhảy Zumba vui vẻ, giảm cân hiệu quả'),
(N'CrossFit', N'CrossFit', N'Advanced', 20, 60, N'Luyện tập cường độ cao với CrossFit'),
(N'Pilates', N'Pilates', N'Intermediate', 15, 60, N'Tăng cường sức mạnh cốt lõi với Pilates'),
(N'Spinning', N'Cycling', N'Intermediate', 25, 60, N'Đạp xe trong nhà với cường độ cao'),
(N'HIIT Training', N'HIIT', N'Advanced', 25, 60, N'Tập luyện cường độ cao ngắt quãng');

-- Dich vu mau
INSERT INTO dbo.DichVu (TenDichVu, LoaiDichVu, Gia, ThoiLuong, MoTa) VALUES
(N'Massage thư giãn', N'Spa', 300000, 60, N'Massage toàn thân thư giãn'),
(N'Tư vấn dinh dưỡng', N'Nutrition', 500000, 45, N'Tư vấn chế độ ăn uống phù hợp'),
(N'Đo chỉ số cơ thể', N'Health Check', 200000, 30, N'Đo và phân tích chỉ số cơ thể'),
(N'Sauna', N'Spa', 150000, 30, N'Phòng xông hơi khô');

-- Cai dat he thong mau
INSERT INTO dbo.CaiDat (TenCaiDat, GiaTri, LoaiDuLieu, MoTa) VALUES
(N'TenPhongTap', N'FitZone Gym', N'String', N'Tên phòng tập'),
(N'DiaChi', N'123 Đường ABC, Quận 1, TP.HCM', N'String', N'Địa chỉ phòng tập'),
(N'SoDienThoai', N'0123456789', N'String', N'Số điện thoại liên hệ'),
(N'Email', N'contact@fitzone.vn', N'String', N'Email liên hệ'),
(N'GioMoCua', N'05:00', N'String', N'Giờ mở cửa'),
(N'GioDongCua', N'23:00', N'String', N'Giờ đóng cửa'),
(N'SoNgayNhacHanTruoc', N'7', N'Number', N'Số ngày nhắc hạn trước khi gói tập hết hạn'),
(N'TyLeGiamGiaThanhVienCu', N'10', N'Number', N'Tỷ lệ giảm giá cho thành viên cũ (%)');

-- Nhan vien mau
INSERT INTO dbo.NhanVien (HoTen, NgaySinh, GioiTinh, SoDienThoai, Email, MaChucVu) VALUES
(N'Nguyễn Văn Admin', '1990-01-01', 'M', '0901234567', 'admin@fitzone.vn', 1),
(N'Trần Thị Lan', '1995-05-15', 'F', '0912345678', 'lan.tran@fitzone.vn', 2),
(N'Lê Hoàng Nam', '1992-08-20', 'M', '0923456789', 'nam.le@fitzone.vn', 3),
(N'Phạm Thị Hương', '1993-03-10', 'F', '0934567890', 'huong.pham@fitzone.vn', 3);

-- Huan luyen vien mau
INSERT INTO dbo.HuanLuyenVien (MaNhanVien, ChuyenMon, MucLuongCoBan, TiLeHoaHongPT) VALUES
(3, N'Strength Training, CrossFit', 15000000, 20.00),
(4, N'Yoga, Pilates, Dance', 12000000, 20.00);

-- Tai khoan mau
INSERT INTO dbo.TaiKhoan (TenDangNhap, MatKhauHash, MaVaiTro, MaNhanVien) VALUES
(N'admin', N'$2a$11$hashed_password_here', 1, 1), -- Password: admin123
(N'trainer1', N'$2a$11$hashed_password_here', 2, 3), -- Password: trainer123
(N'trainer2', N'$2a$11$hashed_password_here', 2, 4); -- Password: trainer123

GO

--------------------------------------------------
-- INDEX DE TANG HIEU SUAT
--------------------------------------------------

-- Index cho check-in
CREATE INDEX IX_DiemDanh_ThanhVien_ThoiGian ON dbo.DiemDanh(MaThanhVien, ThoiGianVao);
CREATE INDEX IX_DiemDanh_ThoiGianVao ON dbo.DiemDanh(ThoiGianVao);

-- Index cho hop dong
CREATE INDEX IX_HopDong_ThanhVien ON dbo.HopDongGoiTap(MaThanhVien, TrangThai);
CREATE INDEX IX_HopDong_NgayKetThuc ON dbo.HopDongGoiTap(NgayKetThuc, TrangThai);

-- Index cho hoa don
CREATE INDEX IX_HoaDon_ThanhVien ON dbo.HoaDon(MaThanhVien, NgayLap);
CREATE INDEX IX_HoaDon_NgayLap ON dbo.HoaDon(NgayLap);

-- Index cho lich tap
CREATE INDEX IX_LichTap_LopHoc_Thu ON dbo.LichTapLopHoc(MaLopHoc, Thu, TrangThai);

-- Index cho dang ky lop hoc
CREATE INDEX IX_DangKy_ThanhVien ON dbo.DangKyLopHoc(MaThanhVien, TrangThai);
CREATE INDEX IX_DangKy_LichTap ON dbo.DangKyLopHoc(MaLichTap, TrangThai);

-- Index cho tai khoan
CREATE INDEX IX_TaiKhoan_TenDangNhap ON dbo.TaiKhoan(TenDangNhap, TrangThai);

-- Index cho thong bao
CREATE INDEX IX_ThongBao_ThanhVien ON dbo.ThongBao(MaThanhVien, DaDoc, TrangThai);

GO

--------------------------------------------------
-- STORED PROCEDURES HUU ICH
--------------------------------------------------

-- Procedure: Kiem tra hop dong con han
CREATE PROCEDURE sp_KiemTraHopDongConHan
    @MaThanhVien INT
AS
BEGIN
    SELECT TOP 1 
        MaHopDong,
        MaGoiTap,
        NgayBatDau,
        NgayKetThuc,
        DATEDIFF(DAY, CAST(GETDATE() AS DATE), NgayKetThuc) AS SoNgayConLai
    FROM dbo.HopDongGoiTap
    WHERE MaThanhVien = @MaThanhVien
        AND TrangThai = 1
        AND NgayKetThuc >= CAST(GETDATE() AS DATE)
    ORDER BY NgayKetThuc DESC;
END;
GO

-- Procedure: Lay danh sach thanh vien sap het han
CREATE PROCEDURE sp_LayThanhVienSapHetHan
    @SoNgay INT = 7
AS
BEGIN
    SELECT 
        tv.MaThanhVien,
        tv.HoTen,
        tv.SoDienThoai,
        tv.Email,
        hd.NgayKetThuc,
        DATEDIFF(DAY, CAST(GETDATE() AS DATE), hd.NgayKetThuc) AS SoNgayConLai
    FROM dbo.ThanhVien tv
    INNER JOIN dbo.HopDongGoiTap hd ON tv.MaThanhVien = hd.MaThanhVien
    WHERE hd.TrangThai = 1
        AND hd.NgayKetThuc BETWEEN CAST(GETDATE() AS DATE) AND DATEADD(DAY, @SoNgay, CAST(GETDATE() AS DATE))
    ORDER BY hd.NgayKetThuc;
END;
GO

-- Procedure: Thong ke doanh thu theo thang
CREATE PROCEDURE sp_ThongKeDoanhThuTheoThang
    @Nam INT,
    @Thang INT
AS
BEGIN
    SELECT 
        COUNT(DISTINCT MaHoaDon) AS SoHoaDon,
        SUM(TongTien) AS TongDoanhThu,
        SUM(GiamGia) AS TongGiamGia,
        SUM(SoTienPhaiTra) AS DoanhThuThucTe
    FROM dbo.HoaDon
    WHERE YEAR(NgayLap) = @Nam
        AND MONTH(NgayLap) = @Thang
        AND TrangThai = 1;
END;
GO

-- Procedure: Lay lich tap theo ngay
CREATE PROCEDURE sp_LayLichTapTheoNgay
    @Thu TINYINT
AS
BEGIN
    SELECT 
        lh.MaLopHoc,
        lh.TenLopHoc,
        lh.LoaiLopHoc,
        lh.CapDo,
        lh.SucChua,
        lh.ThoiLuong,
        lt.ThoiGianBatDau,
        lt.ThoiGianKetThuc,
        nv.HoTen AS TenHuanLuyenVien,
        pt.TenPhong,
        (SELECT COUNT(*) FROM dbo.DangKyLopHoc WHERE MaLichTap = lt.MaLichTap AND TrangThai = 1) AS SoNguoiDangKy
    FROM dbo.LichTapLopHoc lt
    INNER JOIN dbo.LopHoc lh ON lt.MaLopHoc = lh.MaLopHoc
    LEFT JOIN dbo.HuanLuyenVien hlv ON lh.MaHuanLuyenVien = hlv.MaHuanLuyenVien
    LEFT JOIN dbo.NhanVien nv ON hlv.MaNhanVien = nv.MaNhanVien
    LEFT JOIN dbo.PhongTap pt ON lh.MaPhong = pt.MaPhong
    WHERE lt.Thu = @Thu
        AND lt.TrangThai = 1
        AND lh.TrangThai = 1
        AND (lt.NgayKetThuc IS NULL OR lt.NgayKetThuc >= CAST(GETDATE() AS DATE))
    ORDER BY lt.ThoiGianBatDau;
END;
GO

PRINT N'Database schema created successfully with all enhancements!';
GO
