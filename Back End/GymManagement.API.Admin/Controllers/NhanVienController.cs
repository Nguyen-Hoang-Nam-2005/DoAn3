using GymManagement.DbHelper;
using Microsoft.AspNetCore.Mvc;
using System.Data;

namespace GymManagement.API.Admin.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NhanVienController : ControllerBase
    {
        private readonly IDbHelper _db;

        public NhanVienController(IDbHelper db)
        {
            _db = db;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            const string sql = @"
                SELECT nv.*, hlv.ChuyenMon, hlv.MaHuanLuyenVien
                FROM NhanVien nv
                LEFT JOIN HuanLuyenVien hlv ON hlv.MaNhanVien = nv.MaNhanVien
                WHERE nv.TrangThai = 1
                ORDER BY nv.MaNhanVien";
            var dt = _db.ExecuteQuery(sql);
            var list = dt.Rows.Cast<DataRow>().Select(row => new
            {
                maNhanVien = Convert.ToInt32(row["MaNhanVien"]),
                hoTen = row["HoTen"]?.ToString(),
                gioiTinh = row["GioiTinh"]?.ToString(),
                soDienThoai = row["SoDienThoai"]?.ToString(),
                email = row["Email"]?.ToString(),
                ngayVaoLam = Convert.ToDateTime(row["NgayVaoLam"]),
                chuyenMon = row.Table.Columns.Contains("ChuyenMon") ? row["ChuyenMon"]?.ToString() : null,
                isTrainer = row.Table.Columns.Contains("MaHuanLuyenVien") && row["MaHuanLuyenVien"] != DBNull.Value,
            }).ToList();
            return Ok(list);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var dt = _db.ExecuteQuery(@"
                SELECT nv.*, hlv.ChuyenMon, hlv.MoTa AS ChuyenMonMoTa
                FROM NhanVien nv
                LEFT JOIN HuanLuyenVien hlv ON hlv.MaNhanVien = nv.MaNhanVien
                WHERE nv.MaNhanVien = @Id", "@Id", id);
            if (dt.Rows.Count == 0) return NotFound();
            var row = dt.Rows[0];
            return Ok(new
            {
                maNhanVien = Convert.ToInt32(row["MaNhanVien"]),
                hoTen = row["HoTen"]?.ToString(),
                gioiTinh = row["GioiTinh"]?.ToString(),
                soDienThoai = row["SoDienThoai"]?.ToString(),
                email = row["Email"]?.ToString(),
                diaChi = row["DiaChi"]?.ToString(),
                ngayVaoLam = Convert.ToDateTime(row["NgayVaoLam"]),
                chuyenMon = row["ChuyenMon"]?.ToString(),
            });
        }

        [HttpPost]
        public IActionResult Create([FromBody] TrainerDto dto)
        {
            var id = _db.ExecuteScalar(@"
                INSERT INTO NhanVien (HoTen, GioiTinh, SoDienThoai, Email, DiaChi, NgayVaoLam, MaChucVu, TrangThai)
                VALUES (@HoTen, @GioiTinh, @SDT, @Email, @DiaChi, CAST(GETDATE() AS DATE), 2, 1);
                SELECT SCOPE_IDENTITY();",
                "@HoTen", dto.HoTen,
                "@GioiTinh", (object?)dto.GioiTinh ?? DBNull.Value,
                "@SDT", (object?)dto.SoDienThoai ?? DBNull.Value,
                "@Email", (object?)dto.Email ?? DBNull.Value,
                "@DiaChi", (object?)dto.DiaChi ?? DBNull.Value);

            var maNV = Convert.ToInt32(id);

            // Also create HuanLuyenVien record
            if (!string.IsNullOrEmpty(dto.ChuyenMon))
            {
                _db.ExecuteNonQuery(@"
                    INSERT INTO HuanLuyenVien (MaNhanVien, ChuyenMon)
                    VALUES (@MaNV, @CM)",
                    "@MaNV", maNV,
                    "@CM", dto.ChuyenMon);
            }

            return Ok(new { id = maNV, message = "Thêm nhân viên thành công" });
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            _db.ExecuteNonQuery("UPDATE NhanVien SET TrangThai = 0 WHERE MaNhanVien = @Id", "@Id", id);
            return Ok(new { message = "Xóa thành công" });
        }
    }

    public class TrainerDto
    {
        public string HoTen { get; set; } = string.Empty;
        public string? GioiTinh { get; set; }
        public string? SoDienThoai { get; set; }
        public string? Email { get; set; }
        public string? DiaChi { get; set; }
        public string? ChuyenMon { get; set; }
    }
}
