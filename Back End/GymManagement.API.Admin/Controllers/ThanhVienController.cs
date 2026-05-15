using GymManagement.DbHelper;
using Microsoft.AspNetCore.Mvc;
using System.Data;

namespace GymManagement.API.Admin.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ThanhVienController : ControllerBase
    {
        private readonly IDbHelper _db;

        public ThanhVienController(IDbHelper db)
        {
            _db = db;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            const string sql = @"
                SELECT tv.MaThanhVien, tv.MaThe, tv.HoTen, tv.NgaySinh, tv.GioiTinh,
                       tv.SoDienThoai, tv.Email, tv.DiaChi, tv.NgayDangKy, tv.TrangThai,
                       gt.TenGoiTap, gt.MaGoiTap, hd.NgayBatDau, hd.NgayKetThuc, hd.TrangThai AS TrangThaiHD
                FROM ThanhVien tv
                LEFT JOIN (
                    SELECT MaThanhVien, MaGoiTap, NgayBatDau, NgayKetThuc, TrangThai,
                           ROW_NUMBER() OVER (PARTITION BY MaThanhVien ORDER BY NgayKetThuc DESC) AS rn
                    FROM HopDongGoiTap
                ) hd ON hd.MaThanhVien = tv.MaThanhVien AND hd.rn = 1
                LEFT JOIN GoiTap gt ON gt.MaGoiTap = hd.MaGoiTap
                WHERE tv.TrangThai = 1
                ORDER BY tv.MaThanhVien";

            var dt = _db.ExecuteQuery(sql);
            var list = dt.Rows.Cast<DataRow>().Select(row =>
            {
                var endDate = row["NgayKetThuc"] != DBNull.Value ? Convert.ToDateTime(row["NgayKetThuc"]) : (DateTime?)null;
                var status = "expired";
                if (endDate.HasValue)
                {
                    var diff = (endDate.Value - DateTime.Today).Days;
                    status = diff < 0 ? "expired" : diff <= 7 ? "expiring" : "active";
                }

                return new
                {
                    id = Convert.ToInt32(row["MaThanhVien"]),
                    name = row["HoTen"]?.ToString() ?? "",
                    cardId = row["MaThe"]?.ToString() ?? $"GYM{Convert.ToInt32(row["MaThanhVien"]):D3}",
                    phone = row["SoDienThoai"]?.ToString() ?? "",
                    email = row["Email"]?.ToString() ?? "",
                    gender = row["GioiTinh"]?.ToString() == "F" ? "female" : "male",
                    packageName = row["TenGoiTap"]?.ToString() ?? "Chưa gán gói tập",
                    packageId = row["MaGoiTap"] != DBNull.Value ? Convert.ToInt32(row["MaGoiTap"]) : 0,
                    startDate = row["NgayBatDau"] != DBNull.Value ? Convert.ToDateTime(row["NgayBatDau"]).ToString("yyyy-MM-dd") : "",
                    endDate = endDate?.ToString("yyyy-MM-dd") ?? "",
                    status,
                    ngayDangKy = Convert.ToDateTime(row["NgayDangKy"]).ToString("yyyy-MM-dd"),
                };
            }).ToList();

            return Ok(list);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var dt = _db.ExecuteQuery("SELECT * FROM ThanhVien WHERE MaThanhVien = @Id", "@Id", id);
            if (dt.Rows.Count == 0) return NotFound();
            var row = dt.Rows[0];
            return Ok(new
            {
                id = Convert.ToInt32(row["MaThanhVien"]),
                name = row["HoTen"]?.ToString(),
                cardId = row["MaThe"]?.ToString(),
                phone = row["SoDienThoai"]?.ToString(),
                email = row["Email"]?.ToString(),
                gender = row["GioiTinh"]?.ToString() == "F" ? "female" : "male",
                dateOfBirth = row["NgaySinh"] != DBNull.Value ? Convert.ToDateTime(row["NgaySinh"]).ToString("yyyy-MM-dd") : "",
                address = row["DiaChi"]?.ToString(),
                registeredDate = Convert.ToDateTime(row["NgayDangKy"]).ToString("yyyy-MM-dd"),
            });
        }

        [HttpPost]
        public IActionResult Create([FromBody] MemberCreateDto dto)
        {
            // Generate card ID
            var maxCard = _db.ExecuteScalar("SELECT ISNULL(MAX(CAST(REPLACE(MaThe, 'GYM', '') AS INT)), 0) FROM ThanhVien WHERE MaThe LIKE 'GYM%'");
            var nextCard = $"GYM{(Convert.ToInt32(maxCard) + 1):D3}";

            var id = _db.ExecuteScalar(@"
                INSERT INTO ThanhVien (MaThe, HoTen, NgaySinh, GioiTinh, SoDienThoai, Email, DiaChi, NgayDangKy, TrangThai)
                VALUES (@MaThe, @HoTen, @NgaySinh, @GioiTinh, @SDT, @Email, @DiaChi, CAST(GETDATE() AS DATE), 1);
                SELECT SCOPE_IDENTITY();",
                "@MaThe", nextCard,
                "@HoTen", dto.Name,
                "@NgaySinh", (object?)dto.DateOfBirth ?? DBNull.Value,
                "@GioiTinh", dto.Gender == "female" ? "F" : "M",
                "@SDT", (object?)dto.Phone ?? DBNull.Value,
                "@Email", (object?)dto.Email ?? DBNull.Value,
                "@DiaChi", (object?)dto.Address ?? DBNull.Value);

            var memberId = Convert.ToInt32(id);

            // If package specified, create contract
            if (dto.PackageId > 0)
            {
                var pkgDt = _db.ExecuteQuery("SELECT SoThang, Gia FROM GoiTap WHERE MaGoiTap = @Id", "@Id", dto.PackageId);
                if (pkgDt.Rows.Count > 0)
                {
                    var months = Convert.ToInt32(pkgDt.Rows[0]["SoThang"]);
                    var price = Convert.ToDecimal(pkgDt.Rows[0]["Gia"]);
                    var startDate = DateTime.Today;
                    var endDate = startDate.AddMonths(months);

                    _db.ExecuteNonQuery(@"
                        INSERT INTO HopDongGoiTap (MaThanhVien, MaGoiTap, NgayBatDau, NgayKetThuc, TongTien, SoTienGiam, SoTienPhaiTra, TrangThai)
                        VALUES (@MaTV, @MaGT, @Start, @End, @Tong, 0, @Tong, 1)",
                        "@MaTV", memberId, "@MaGT", dto.PackageId,
                        "@Start", startDate, "@End", endDate, "@Tong", price);
                }
            }

            return Ok(new { id = memberId, cardId = nextCard, message = "Thêm hội viên thành công" });
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] MemberCreateDto dto)
        {
            var rows = _db.ExecuteNonQuery(@"
                UPDATE ThanhVien SET HoTen=@HoTen, NgaySinh=@NgaySinh, GioiTinh=@GioiTinh,
                       SoDienThoai=@SDT, Email=@Email, DiaChi=@DiaChi
                WHERE MaThanhVien = @Id",
                "@HoTen", dto.Name,
                "@NgaySinh", (object?)dto.DateOfBirth ?? DBNull.Value,
                "@GioiTinh", dto.Gender == "female" ? "F" : "M",
                "@SDT", (object?)dto.Phone ?? DBNull.Value,
                "@Email", (object?)dto.Email ?? DBNull.Value,
                "@DiaChi", (object?)dto.Address ?? DBNull.Value,
                "@Id", id);

            return rows > 0 ? Ok(new { message = "Cập nhật thành công" }) : NotFound();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            _db.ExecuteNonQuery("UPDATE ThanhVien SET TrangThai = 0 WHERE MaThanhVien = @Id", "@Id", id);
            return Ok(new { message = "Xóa thành công" });
        }

        [HttpPost("{id}/register-package")]
        public IActionResult RegisterPackage(int id, [FromBody] RegisterPackageDto dto)
        {
            var pkgDt = _db.ExecuteQuery("SELECT SoThang, Gia, TenGoiTap FROM GoiTap WHERE MaGoiTap = @Id AND TrangThai = 1", "@Id", dto.PackageId);
            if (pkgDt.Rows.Count == 0) return BadRequest(new { message = "Gói tập không tồn tại" });

            var months = Convert.ToInt32(pkgDt.Rows[0]["SoThang"]);
            var price = Convert.ToDecimal(pkgDt.Rows[0]["Gia"]);
            var startDate = DateTime.Today;
            var endDate = startDate.AddMonths(months);

            _db.ExecuteNonQuery(@"
                INSERT INTO HopDongGoiTap (MaThanhVien, MaGoiTap, NgayBatDau, NgayKetThuc, TongTien, SoTienGiam, SoTienPhaiTra, TrangThai)
                VALUES (@MaTV, @MaGT, @Start, @End, @Tong, 0, @Tong, 1)",
                "@MaTV", id, "@MaGT", dto.PackageId,
                "@Start", startDate, "@End", endDate, "@Tong", price);

            // Create invoice
            _db.ExecuteNonQuery(@"
                INSERT INTO HoaDon (MaThanhVien, MaNhanVienLap, TongTien, GiamGia, SoTienPhaiTra, TrangThai, GhiChu)
                VALUES (@MaTV, 1, @Tong, 0, @Tong, 1, @GhiChu)",
                "@MaTV", id, "@Tong", price,
                "@GhiChu", $"Đăng ký {pkgDt.Rows[0]["TenGoiTap"]}");

            return Ok(new { message = "Đăng ký gói tập thành công", endDate = endDate.ToString("yyyy-MM-dd") });
        }
    }

    public class MemberCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public int PackageId { get; set; }
    }

    public class RegisterPackageDto
    {
        public int PackageId { get; set; }
    }
}
