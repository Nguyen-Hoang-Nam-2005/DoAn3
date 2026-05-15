-- Chạy file này SAU khi đã chạy Gym.sql
USE GymManagement;
GO

-- Vai trò
IF NOT EXISTS (SELECT 1 FROM VaiTro WHERE TenVaiTro = 'Admin')
    INSERT INTO VaiTro (TenVaiTro, MoTa) VALUES ('Admin', N'Quản trị viên');
IF NOT EXISTS (SELECT 1 FROM VaiTro WHERE TenVaiTro = 'HuanLuyenVien')
    INSERT INTO VaiTro (TenVaiTro, MoTa) VALUES ('HuanLuyenVien', N'Huấn luyện viên');
IF NOT EXISTS (SELECT 1 FROM VaiTro WHERE TenVaiTro = 'HoiVien')
    INSERT INTO VaiTro (TenVaiTro, MoTa) VALUES ('HoiVien', N'Hội viên');

-- Chức vụ
IF NOT EXISTS (SELECT 1 FROM ChucVu WHERE TenChucVu = N'Quản trị viên')
    INSERT INTO ChucVu (TenChucVu) VALUES (N'Quản trị viên');
IF NOT EXISTS (SELECT 1 FROM ChucVu WHERE TenChucVu = N'Huấn luyện viên')
    INSERT INTO ChucVu (TenChucVu) VALUES (N'Huấn luyện viên');

-- Nhân viên Admin
IF NOT EXISTS (SELECT 1 FROM NhanVien WHERE HoTen = N'Quản trị viên')
BEGIN
    INSERT INTO NhanVien (HoTen, NgayVaoLam, MaChucVu)
    VALUES (N'Quản trị viên', CAST(GETDATE() AS DATE), 1);
END

-- Hội viên demo
IF NOT EXISTS (SELECT 1 FROM ThanhVien WHERE HoTen = N'Hội viên Demo')
BEGIN
    INSERT INTO ThanhVien (MaThe, HoTen, GioiTinh, SoDienThoai, Email)
    VALUES ('GYM001', N'Hội viên Demo', 'M', '0901234567', 'member@gym.com');
END

-- Tài khoản (password = admin123, trainer123, member123 - SHA256)
-- admin123 = jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI=
-- trainer123 = sBRLmPkbzZsAAyClhX6dQAUS+0WKZwWvpWXmgRcLqWQ=
-- member123 = Cw0BQ3nyDVuIcz+dkMc2IvMiUHsfhDWXsr06SLfQUZQ=

IF NOT EXISTS (SELECT 1 FROM TaiKhoan WHERE TenDangNhap = 'admin')
BEGIN
    DECLARE @MaNV INT = (SELECT TOP 1 MaNhanVien FROM NhanVien WHERE HoTen = N'Quản trị viên');
    INSERT INTO TaiKhoan (TenDangNhap, MatKhauHash, MaVaiTro, MaNhanVien)
    VALUES ('admin', 'jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI=', 1, @MaNV);
END

IF NOT EXISTS (SELECT 1 FROM TaiKhoan WHERE TenDangNhap = 'member')
BEGIN
    DECLARE @MaTV INT = (SELECT TOP 1 MaThanhVien FROM ThanhVien WHERE HoTen = N'Hội viên Demo');
    INSERT INTO TaiKhoan (TenDangNhap, MatKhauHash, MaVaiTro, MaThanhVien)
    VALUES ('member', 'Cw0BQ3nyDVuIcz+dkMc2IvMiUHsfhDWXsr06SLfQUZQ=', 3, @MaTV);
END

-- Một vài gói tập mẫu
IF NOT EXISTS (SELECT 1 FROM GoiTap)
BEGIN
    INSERT INTO GoiTap (TenGoiTap, SoThang, Gia, MoTa) VALUES
    (N'Gói Basic 1 tháng', 1, 500000, N'Gói tập cơ bản'),
    (N'Gói Standard 3 tháng', 3, 1200000, N'Gói tập tiêu chuẩn'),
    (N'Gói Premium 6 tháng', 6, 2000000, N'Gói tập cao cấp'),
    (N'Gói VIP 12 tháng', 12, 3500000, N'Gói tập VIP');
END

PRINT 'Seed data hoàn tất!';
PRINT 'Tài khoản: admin/admin123, member/member123';
GO
