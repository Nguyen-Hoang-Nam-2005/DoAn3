using GymManagement.DbHelper;
using Microsoft.AspNetCore.Mvc;

namespace GymManagement.API.Admin.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BaoCaoController : ControllerBase
    {
        private readonly IDbHelper _db;
        public BaoCaoController(IDbHelper db) { _db = db; }

        [HttpGet("doanhthu")]
        public IActionResult GetRevenue([FromQuery] string? startDate, [FromQuery] string? endDate)
        {
            var start = string.IsNullOrEmpty(startDate) ? DateTime.Now.AddMonths(-1) : DateTime.Parse(startDate);
            var end = string.IsNullOrEmpty(endDate) ? DateTime.Now : DateTime.Parse(endDate);

            var total = _db.ExecuteScalar(@"
                SELECT ISNULL(SUM(SoTienPhaiTra), 0) FROM HoaDon
                WHERE TrangThai = 2 AND NgayLap BETWEEN @Start AND @End",
                "@Start", start, "@End", end);

            var count = _db.ExecuteScalar(@"
                SELECT COUNT(*) FROM HoaDon WHERE TrangThai = 2 AND NgayLap BETWEEN @Start AND @End",
                "@Start", start, "@End", end);

            return Ok(new { tongDoanhThu = Convert.ToDecimal(total), soHoaDon = Convert.ToInt32(count), tuNgay = start, denNgay = end });
        }

        [HttpGet("thanhvien")]
        public IActionResult GetMemberStats()
        {
            var total = Convert.ToInt32(_db.ExecuteScalar("SELECT COUNT(*) FROM ThanhVien"));
            var active = Convert.ToInt32(_db.ExecuteScalar("SELECT COUNT(*) FROM ThanhVien WHERE TrangThai = 1"));
            var newThisMonth = Convert.ToInt32(_db.ExecuteScalar("SELECT COUNT(*) FROM ThanhVien WHERE MONTH(NgayDangKy) = MONTH(GETDATE()) AND YEAR(NgayDangKy) = YEAR(GETDATE())"));

            return Ok(new { tongThanhVien = total, dangHoatDong = active, moiThangNay = newThisMonth });
        }

        [HttpGet("diemdanh")]
        public IActionResult GetAttendanceStats([FromQuery] string? startDate, [FromQuery] string? endDate)
        {
            var start = string.IsNullOrEmpty(startDate) ? DateTime.Now.AddDays(-7) : DateTime.Parse(startDate);
            var end = string.IsNullOrEmpty(endDate) ? DateTime.Now : DateTime.Parse(endDate);

            var total = Convert.ToInt32(_db.ExecuteScalar(@"
                SELECT COUNT(*) FROM DiemDanh WHERE ThoiGianVao BETWEEN @Start AND @End",
                "@Start", start, "@End", end));

            return Ok(new { tongDiemDanh = total, tuNgay = start, denNgay = end });
        }
    }
}
