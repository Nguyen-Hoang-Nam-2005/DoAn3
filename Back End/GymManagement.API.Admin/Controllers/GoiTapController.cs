using GymManagement.DbHelper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Data;

namespace GymManagement.API.Admin.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GoiTapController : ControllerBase
    {
        private readonly IDbHelper _db;

        public GoiTapController(IDbHelper db)
        {
            _db = db;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var packages = LoadPackagesWithFeatures("SELECT * FROM GoiTap ORDER BY MaGoiTap");
            return Ok(packages);
        }

        [HttpGet("active")]
        public IActionResult GetActive()
        {
            var packages = LoadPackagesWithFeatures("SELECT * FROM GoiTap WHERE TrangThai = 1 ORDER BY MaGoiTap");
            return Ok(packages);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var packages = LoadPackagesWithFeatures("SELECT * FROM GoiTap WHERE MaGoiTap = @Id", "@Id", id);
            if (packages.Count == 0) return NotFound();
            return Ok(packages[0]);
        }

        [HttpPost]
        public IActionResult Create([FromBody] PackageCreateDto dto)
        {
            var id = _db.ExecuteScalar(@"
                INSERT INTO GoiTap (TenGoiTap, SoThang, SoLanTapToiDa, Gia, MoTa, TrangThai, MauSac, DanhMuc, NoiBat)
                VALUES (@Ten, @SoThang, @SoLan, @Gia, @MoTa, @TrangThai, @Mau, @DM, @NB);
                SELECT SCOPE_IDENTITY();",
                "@Ten", dto.Name,
                "@SoThang", Math.Max(1, dto.Duration / 30),
                "@SoLan", (object?)null ?? DBNull.Value,
                "@Gia", dto.Price,
                "@MoTa", (object?)dto.Description ?? DBNull.Value,
                "@TrangThai", dto.Status == "active" ? 1 : 0,
                "@Mau", (object?)dto.Color ?? "blue",
                "@DM", (object?)dto.Category ?? "membership",
                "@NB", dto.IsPopular ? 1 : 0);

            var pkgId = Convert.ToInt32(id);

            // Insert features
            if (dto.Features != null)
            {
                foreach (var feature in dto.Features.Where(f => !string.IsNullOrWhiteSpace(f)))
                {
                    _db.ExecuteNonQuery("INSERT INTO ChiTietGoiTap (MaGoiTap, QuyenLoi) VALUES (@Id, @QL)",
                        "@Id", pkgId, "@QL", feature.Trim());
                }
            }

            return Ok(new { id = pkgId, message = "Tạo gói tập thành công" });
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] PackageCreateDto dto)
        {
            var rows = _db.ExecuteNonQuery(@"
                UPDATE GoiTap SET TenGoiTap=@Ten, SoThang=@SoThang, Gia=@Gia, MoTa=@MoTa,
                       TrangThai=@TrangThai, MauSac=@Mau, DanhMuc=@DM, NoiBat=@NB
                WHERE MaGoiTap = @Id",
                "@Ten", dto.Name,
                "@SoThang", Math.Max(1, dto.Duration / 30),
                "@Gia", dto.Price,
                "@MoTa", (object?)dto.Description ?? DBNull.Value,
                "@TrangThai", dto.Status == "active" ? 1 : 0,
                "@Mau", (object?)dto.Color ?? "blue",
                "@DM", (object?)dto.Category ?? "membership",
                "@NB", dto.IsPopular ? 1 : 0,
                "@Id", id);

            if (rows == 0) return NotFound();

            // Update features
            _db.ExecuteNonQuery("DELETE FROM ChiTietGoiTap WHERE MaGoiTap = @Id", "@Id", id);
            if (dto.Features != null)
            {
                foreach (var feature in dto.Features.Where(f => !string.IsNullOrWhiteSpace(f)))
                {
                    _db.ExecuteNonQuery("INSERT INTO ChiTietGoiTap (MaGoiTap, QuyenLoi) VALUES (@Id, @QL)",
                        "@Id", id, "@QL", feature.Trim());
                }
            }

            return Ok(new { message = "Cập nhật thành công" });
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var rows = _db.ExecuteNonQuery("DELETE FROM GoiTap WHERE MaGoiTap = @Id", "@Id", id);
            return rows > 0 ? Ok(new { message = "Xóa thành công" }) : NotFound();
        }

        [HttpPut("{id}/toggle")]
        public IActionResult ToggleStatus(int id)
        {
            var rows = _db.ExecuteNonQuery(@"
                UPDATE GoiTap SET TrangThai = CASE WHEN TrangThai = 1 THEN 0 ELSE 1 END
                WHERE MaGoiTap = @Id", "@Id", id);
            return rows > 0 ? Ok(new { message = "Đã cập nhật trạng thái" }) : NotFound();
        }

        private List<object> LoadPackagesWithFeatures(string sql, params object[] parameters)
        {
            var dt = _db.ExecuteQuery(sql, parameters);
            var packages = new List<object>();

            foreach (DataRow row in dt.Rows)
            {
                var pkgId = Convert.ToInt32(row["MaGoiTap"]);
                var featuresDt = _db.ExecuteQuery("SELECT QuyenLoi FROM ChiTietGoiTap WHERE MaGoiTap = @Id", "@Id", pkgId);
                var features = featuresDt.Rows.Cast<DataRow>().Select(r => r["QuyenLoi"]?.ToString() ?? "").ToList();

                // Count members with this package
                var memberCount = Convert.ToInt32(_db.ExecuteScalar(
                    "SELECT COUNT(*) FROM HopDongGoiTap WHERE MaGoiTap = @Id AND TrangThai = 1", "@Id", pkgId));

                packages.Add(new
                {
                    id = pkgId,
                    name = row["TenGoiTap"]?.ToString() ?? "",
                    duration = Convert.ToInt32(row["SoThang"]) * 30,
                    price = Convert.ToDecimal(row["Gia"]),
                    description = row["MoTa"]?.ToString() ?? "",
                    features,
                    color = row.Table.Columns.Contains("MauSac") ? (row["MauSac"]?.ToString() ?? "blue") : "blue",
                    category = row.Table.Columns.Contains("DanhMuc") ? (row["DanhMuc"]?.ToString() ?? "membership") : "membership",
                    status = Convert.ToByte(row["TrangThai"]) == 1 ? "active" : "inactive",
                    memberCount,
                    isPopular = row.Table.Columns.Contains("NoiBat") && row["NoiBat"] != DBNull.Value && Convert.ToBoolean(row["NoiBat"]),
                });
            }

            return packages;
        }
    }

    public class PackageCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public int Duration { get; set; } = 30;
        public decimal Price { get; set; }
        public string? Description { get; set; }
        public List<string>? Features { get; set; }
        public string? Color { get; set; }
        public string? Category { get; set; }
        public string Status { get; set; } = "active";
        public bool IsPopular { get; set; }
    }
}
