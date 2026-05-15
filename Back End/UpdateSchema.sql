USE GymManagement;
GO

-- Thêm cột mới cho GoiTap
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('GoiTap') AND name = 'MauSac')
    ALTER TABLE GoiTap ADD MauSac NVARCHAR(20) NULL DEFAULT 'blue';

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('GoiTap') AND name = 'DanhMuc')
    ALTER TABLE GoiTap ADD DanhMuc NVARCHAR(20) NULL DEFAULT 'membership';

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('GoiTap') AND name = 'NoiBat')
    ALTER TABLE GoiTap ADD NoiBat BIT NULL DEFAULT 0;

-- Tạo bảng chi tiết quyền lợi gói tập
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'ChiTietGoiTap')
BEGIN
    CREATE TABLE dbo.ChiTietGoiTap (
        MaChiTiet   INT IDENTITY(1,1) PRIMARY KEY,
        MaGoiTap    INT NOT NULL,
        QuyenLoi    NVARCHAR(200) NOT NULL,
        CONSTRAINT FK_ChiTietGT_GoiTap FOREIGN KEY (MaGoiTap) REFERENCES dbo.GoiTap(MaGoiTap) ON DELETE CASCADE
    );
END
GO

-- Xóa dữ liệu cũ và thêm gói tập mới đầy đủ
DELETE FROM ChiTietGoiTap;
DELETE FROM GoiTap;
GO

-- Insert 15 gói tập với đầy đủ thông tin
INSERT INTO GoiTap (TenGoiTap, SoThang, Gia, MoTa, TrangThai, MauSac, DanhMuc, NoiBat) VALUES
(N'Gói Basic 1 tháng', 1, 500000, N'Gói tập cơ bản cho người mới bắt đầu', 1, 'blue', 'membership', 0),
(N'Gói Standard 3 tháng', 3, 1200000, N'Gói tập tiêu chuẩn với nhiều ưu đãi', 1, 'green', 'membership', 1),
(N'Gói Premium 6 tháng', 6, 2000000, N'Gói tập cao cấp với đầy đủ tiện ích', 1, 'purple', 'membership', 0),
(N'Gói VIP 12 tháng', 12, 3500000, N'Gói tập VIP với quyền lợi tốt nhất', 1, 'gold', 'membership', 0),
(N'Gói Yoga & Pilates', 1, 800000, N'Tham gia tất cả lớp Yoga và Pilates trong tháng', 1, 'green', 'membership', 0),
(N'Gói Boxing & MMA', 1, 1000000, N'Lớp Boxing và MMA cho mọi cấp độ', 1, 'red', 'membership', 0),
(N'Gói Gia đình', 1, 1800000, N'Gói tập cho 2-4 thành viên gia đình', 1, 'blue', 'membership', 0),
(N'Gói PT 5 buổi', 1, 1400000, N'5 buổi tập cá nhân với huấn luyện viên', 1, 'orange', 'pt', 0),
(N'Gói PT 10 buổi', 2, 2500000, N'10 buổi tập cá nhân - Tiết kiệm 7%', 1, 'orange', 'pt', 1),
(N'Gói PT 20 buổi', 3, 4500000, N'20 buổi tập cá nhân - Tiết kiệm 10%', 1, 'orange', 'pt', 0),
(N'Gói PT Giảm cân', 2, 3000000, N'Chương trình giảm cân chuyên biệt 2 tháng', 1, 'red', 'pt', 0),
(N'Gói Spa & Massage', 1, 1500000, N'Dịch vụ spa và massage thư giãn sau tập', 1, 'purple', 'service', 0),
(N'Dịch vụ Đo InBody', 1, 300000, N'Đo thành phần cơ thể chuyên nghiệp', 1, 'blue', 'service', 0),
(N'Dịch vụ Dinh dưỡng', 1, 500000, N'Tư vấn dinh dưỡng cá nhân hóa', 1, 'green', 'service', 0),
(N'Gói Phục hồi chức năng', 1, 2000000, N'Phục hồi chấn thương và tăng cường sức khỏe', 1, 'gold', 'service', 0);
GO

-- Insert quyền lợi cho từng gói
DECLARE @id INT;

SELECT @id = MaGoiTap FROM GoiTap WHERE TenGoiTap = N'Gói Basic 1 tháng';
INSERT INTO ChiTietGoiTap (MaGoiTap, QuyenLoi) VALUES (@id, N'Tập không giới hạn'), (@id, N'Phòng tập đa năng'), (@id, N'Tủ đồ cá nhân');

SELECT @id = MaGoiTap FROM GoiTap WHERE TenGoiTap = N'Gói Standard 3 tháng';
INSERT INTO ChiTietGoiTap (MaGoiTap, QuyenLoi) VALUES (@id, N'Tập không giới hạn'), (@id, N'Phòng xông hơi'), (@id, N'Tủ đồ cá nhân'), (@id, N'1 buổi PT miễn phí'), (@id, N'Đo InBody định kỳ');

SELECT @id = MaGoiTap FROM GoiTap WHERE TenGoiTap = N'Gói Premium 6 tháng';
INSERT INTO ChiTietGoiTap (MaGoiTap, QuyenLoi) VALUES (@id, N'Tập không giới hạn'), (@id, N'Phòng xông hơi'), (@id, N'Tủ đồ cá nhân'), (@id, N'3 buổi PT miễn phí'), (@id, N'Nước uống miễn phí');

SELECT @id = MaGoiTap FROM GoiTap WHERE TenGoiTap = N'Gói VIP 12 tháng';
INSERT INTO ChiTietGoiTap (MaGoiTap, QuyenLoi) VALUES (@id, N'Tập không giới hạn'), (@id, N'Phòng xông hơi & Spa'), (@id, N'Tủ đồ cá nhân'), (@id, N'10 buổi PT miễn phí'), (@id, N'Nước uống miễn phí'), (@id, N'Khăn tắm miễn phí'), (@id, N'Ưu tiên đặt lịch');

SELECT @id = MaGoiTap FROM GoiTap WHERE TenGoiTap = N'Gói Yoga & Pilates';
INSERT INTO ChiTietGoiTap (MaGoiTap, QuyenLoi) VALUES (@id, N'Yoga mỗi ngày'), (@id, N'Pilates 3 buổi/tuần'), (@id, N'Thảm tập riêng'), (@id, N'Phòng thiền định'), (@id, N'Nước detox miễn phí');

SELECT @id = MaGoiTap FROM GoiTap WHERE TenGoiTap = N'Gói Boxing & MMA';
INSERT INTO ChiTietGoiTap (MaGoiTap, QuyenLoi) VALUES (@id, N'Boxing 5 buổi/tuần'), (@id, N'MMA cơ bản'), (@id, N'Găng tay & băng tay'), (@id, N'Sparring có HLV'), (@id, N'Thể lực chuyên biệt');

SELECT @id = MaGoiTap FROM GoiTap WHERE TenGoiTap = N'Gói Gia đình';
INSERT INTO ChiTietGoiTap (MaGoiTap, QuyenLoi) VALUES (@id, N'2-4 thành viên'), (@id, N'Tập không giới hạn'), (@id, N'Lớp gia đình cuối tuần'), (@id, N'Tủ đồ chung'), (@id, N'Giảm 20% dịch vụ khác');

SELECT @id = MaGoiTap FROM GoiTap WHERE TenGoiTap = N'Gói PT 5 buổi';
INSERT INTO ChiTietGoiTap (MaGoiTap, QuyenLoi) VALUES (@id, N'5 buổi PT 1-1'), (@id, N'Lịch tập linh hoạt'), (@id, N'Theo dõi tiến độ'), (@id, N'Tư vấn dinh dưỡng');

SELECT @id = MaGoiTap FROM GoiTap WHERE TenGoiTap = N'Gói PT 10 buổi';
INSERT INTO ChiTietGoiTap (MaGoiTap, QuyenLoi) VALUES (@id, N'10 buổi PT 1-1'), (@id, N'Lịch tập cá nhân hóa'), (@id, N'Theo dõi tiến độ'), (@id, N'Tư vấn dinh dưỡng'), (@id, N'Đo InBody trước & sau');

SELECT @id = MaGoiTap FROM GoiTap WHERE TenGoiTap = N'Gói PT 20 buổi';
INSERT INTO ChiTietGoiTap (MaGoiTap, QuyenLoi) VALUES (@id, N'20 buổi PT 1-1'), (@id, N'Lịch tập cá nhân hóa'), (@id, N'Theo dõi tiến độ'), (@id, N'Tư vấn dinh dưỡng'), (@id, N'Đo InBody định kỳ'), (@id, N'Video hướng dẫn tại nhà');

SELECT @id = MaGoiTap FROM GoiTap WHERE TenGoiTap = N'Gói PT Giảm cân';
INSERT INTO ChiTietGoiTap (MaGoiTap, QuyenLoi) VALUES (@id, N'12 buổi PT 1-1'), (@id, N'Kế hoạch ăn kiêng'), (@id, N'Đo mỡ cơ thể hàng tuần'), (@id, N'Hỗ trợ 24/7 qua app'), (@id, N'Cam kết kết quả');

SELECT @id = MaGoiTap FROM GoiTap WHERE TenGoiTap = N'Gói Spa & Massage';
INSERT INTO ChiTietGoiTap (MaGoiTap, QuyenLoi) VALUES (@id, N'Massage 4 buổi/tháng'), (@id, N'Xông hơi không giới hạn'), (@id, N'Bể sục jacuzzi'), (@id, N'Phòng muối Himalaya'), (@id, N'Liệu pháp lạnh');

SELECT @id = MaGoiTap FROM GoiTap WHERE TenGoiTap = N'Dịch vụ Đo InBody';
INSERT INTO ChiTietGoiTap (MaGoiTap, QuyenLoi) VALUES (@id, N'Đo InBody 4 lần/tháng'), (@id, N'Báo cáo chi tiết'), (@id, N'Tư vấn chuyên gia'), (@id, N'Theo dõi tiến độ');

SELECT @id = MaGoiTap FROM GoiTap WHERE TenGoiTap = N'Dịch vụ Dinh dưỡng';
INSERT INTO ChiTietGoiTap (MaGoiTap, QuyenLoi) VALUES (@id, N'4 buổi tư vấn/tháng'), (@id, N'Thực đơn cá nhân hóa'), (@id, N'Theo dõi qua app'), (@id, N'Điều chỉnh linh hoạt');

SELECT @id = MaGoiTap FROM GoiTap WHERE TenGoiTap = N'Gói Phục hồi chức năng';
INSERT INTO ChiTietGoiTap (MaGoiTap, QuyenLoi) VALUES (@id, N'8 buổi vật lý trị liệu'), (@id, N'Đánh giá chấn thương'), (@id, N'Bài tập phục hồi'), (@id, N'Thiết bị chuyên dụng'), (@id, N'Theo dõi tiến độ');
GO

PRINT N'Schema updated! 15 gói tập với quyền lợi chi tiết.';
GO
