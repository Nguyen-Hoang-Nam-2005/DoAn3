using GymManagement.DbHelper;
using Microsoft.AspNetCore.Mvc;
using System.Data;

namespace GymManagement.API.Admin.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DiemDanhController : ControllerBase
    {
        private readonly IDbHelper _db;

        public DiemDanhController(IDbHelper db)
        {
            _db = db;
        }

        [HttpGet("today")]
        public IActionResult GetToday()
        {
            const string sql = @"
                SELECT dd.MaDiemDanh, dd.MaThanhVien, tv.HoTen, tv.MaThe,
                       dd.ThoiGianVao, dd.ThoiGianRa, dd.HinhThuc
                FROM DiemDanh dd
                INNER JOIN ThanhVien tv ON tv.MaThanhVien = dd.MaThanhVien
                WHERE CAST(dd.ThoiGianVao AS DATE) = CAST(GETDATE() AS DATE)
                ORDER BY dd.ThoiGianVao DESC";
            var dt = _db.ExecuteQuery(sql);
            var list = dt.Rows.Cast<DataRow>().Select(row => new
            {
                maDiemDanh = Convert.ToInt32(row["MaDiemDanh"]),
                maThanhVien = Convert.ToInt32(row["MaThanhVien"]),
                hoTen = row["HoTen"]?.ToString(),
                maThe = row["MaThe"]?.ToString(),
                thoiGianVao = Convert.ToDateTime(row["ThoiGianVao"]),
                thoiGianRa = row["ThoiGianRa"] == DBNull.Value ? null : (DateTime?)Convert.ToDateTime(row["ThoiGianRa"]),
                hinhThuc = row["HinhThuc"]?.ToString(),
            }).ToList();
            return Ok(list);
        }

        [HttpPost("checkin")]
        public IActionResult CheckIn([FromBody] CheckInRequest dto)
        {
            var id = _db.ExecuteScalar(@"
                INSERT INTO DiemDanh (MaThanhVien, ThoiGianVao, HinhThuc)
                VALUES (@MaTV, SYSDATETIME(), @HinhThuc);
                SELECT SCOPE_IDENTITY();",
                "@MaTV", dto.ThanhVienId,
                "@HinhThuc", (object?)dto.HinhThuc ?? "QR");
            return Ok(new { maDiemDanh = Convert.ToInt32(id) });
        }

        [HttpPost("checkout/{id}")]
        public IActionResult CheckOut(int id)
        {
            var rows = _db.ExecuteNonQuery(
                "UPDATE DiemDanh SET ThoiGianRa = SYSDATETIME() WHERE MaDiemDanh = @Id",
                "@Id", id);
            return rows > 0 ? Ok(new { message = "Check-out thành công" }) : NotFound();
        }
    }

    public class CheckInRequest
    {
        public int ThanhVienId { get; set; }
        public string? HinhThuc { get; set; }
    }
}
