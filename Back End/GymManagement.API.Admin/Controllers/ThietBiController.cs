using GymManagement.DbHelper;
using Microsoft.AspNetCore.Mvc;
using System.Data;

namespace GymManagement.API.Admin.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ThietBiController : ControllerBase
    {
        private readonly IDbHelper _db;
        public ThietBiController(IDbHelper db) { _db = db; }

        [HttpGet]
        public IActionResult GetAll()
        {
            var dt = _db.ExecuteQuery(@"
                SELECT tb.*, pt.TenPhong FROM ThietBi tb
                LEFT JOIN PhongTap pt ON pt.MaPhong = tb.MaPhong
                ORDER BY tb.MaThietBi");
            var list = dt.Rows.Cast<DataRow>().Select(row => new
            {
                maThietBi = Convert.ToInt32(row["MaThietBi"]),
                tenThietBi = row["TenThietBi"]?.ToString(),
                tenPhong = row["TenPhong"]?.ToString(),
                hangSanXuat = row["HangSanXuat"]?.ToString(),
                ngayMua = row["NgayMua"] == DBNull.Value ? null : (DateTime?)Convert.ToDateTime(row["NgayMua"]),
                giaMua = row["GiaMua"] == DBNull.Value ? null : (decimal?)Convert.ToDecimal(row["GiaMua"]),
                trangThai = row["TrangThai"]?.ToString(),
                moTa = row["MoTa"]?.ToString(),
            }).ToList();
            return Ok(list);
        }

        [HttpPost]
        public IActionResult Create([FromBody] EquipmentDto dto)
        {
            var id = _db.ExecuteScalar(@"
                INSERT INTO ThietBi (TenThietBi, MaPhong, HangSanXuat, NgayMua, GiaMua, TrangThai, MoTa)
                VALUES (@Ten, @Phong, @Hang, @Ngay, @Gia, @TT, @MoTa); SELECT SCOPE_IDENTITY();",
                "@Ten", dto.TenThietBi,
                "@Phong", (object?)dto.MaPhong ?? DBNull.Value,
                "@Hang", (object?)dto.HangSanXuat ?? DBNull.Value,
                "@Ngay", (object?)dto.NgayMua ?? DBNull.Value,
                "@Gia", (object?)dto.GiaMua ?? DBNull.Value,
                "@TT", (object?)dto.TrangThai ?? "Hoạt động",
                "@MoTa", (object?)dto.MoTa ?? DBNull.Value);
            return Ok(new { id = Convert.ToInt32(id) });
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] EquipmentDto dto)
        {
            _db.ExecuteNonQuery(@"
                UPDATE ThietBi SET TenThietBi=@Ten, MaPhong=@Phong, HangSanXuat=@Hang,
                NgayMua=@Ngay, GiaMua=@Gia, TrangThai=@TT, MoTa=@MoTa WHERE MaThietBi=@Id",
                "@Ten", dto.TenThietBi, "@Phong", (object?)dto.MaPhong ?? DBNull.Value,
                "@Hang", (object?)dto.HangSanXuat ?? DBNull.Value,
                "@Ngay", (object?)dto.NgayMua ?? DBNull.Value,
                "@Gia", (object?)dto.GiaMua ?? DBNull.Value,
                "@TT", (object?)dto.TrangThai ?? "Hoạt động",
                "@MoTa", (object?)dto.MoTa ?? DBNull.Value, "@Id", id);
            return Ok(new { message = "Cập nhật thành công" });
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            _db.ExecuteNonQuery("DELETE FROM ThietBi WHERE MaThietBi = @Id", "@Id", id);
            return Ok(new { message = "Xóa thành công" });
        }
    }

    public class EquipmentDto
    {
        public string TenThietBi { get; set; } = string.Empty;
        public int? MaPhong { get; set; }
        public string? HangSanXuat { get; set; }
        public DateTime? NgayMua { get; set; }
        public decimal? GiaMua { get; set; }
        public string? TrangThai { get; set; }
        public string? MoTa { get; set; }
    }
}
