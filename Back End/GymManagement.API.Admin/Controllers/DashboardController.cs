using GymManagement.DbHelper;
using Microsoft.AspNetCore.Mvc;

namespace GymManagement.API.Admin.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IDbHelper _db;

        public DashboardController(IDbHelper db)
        {
            _db = db;
        }

        [HttpGet]
        public IActionResult GetStats()
        {
            var totalMembers = Convert.ToInt32(_db.ExecuteScalar("SELECT COUNT(*) FROM ThanhVien WHERE TrangThai = 1"));
            var totalTrainers = Convert.ToInt32(_db.ExecuteScalar("SELECT COUNT(*) FROM HuanLuyenVien"));
            var totalPackages = Convert.ToInt32(_db.ExecuteScalar("SELECT COUNT(*) FROM GoiTap WHERE TrangThai = 1"));
            var todayCheckins = Convert.ToInt32(_db.ExecuteScalar("SELECT COUNT(*) FROM DiemDanh WHERE CAST(ThoiGianVao AS DATE) = CAST(GETDATE() AS DATE)"));

            var monthRevenue = _db.ExecuteScalar(@"
                SELECT ISNULL(SUM(SoTienPhaiTra), 0) FROM HoaDon
                WHERE TrangThai = 2 AND MONTH(NgayLap) = MONTH(GETDATE()) AND YEAR(NgayLap) = YEAR(GETDATE())");

            var activeContracts = Convert.ToInt32(_db.ExecuteScalar(@"
                SELECT COUNT(*) FROM HopDongGoiTap WHERE TrangThai = 1 AND NgayKetThuc >= CAST(GETDATE() AS DATE)"));

            return Ok(new
            {
                totalMembers,
                totalTrainers,
                totalPackages,
                todayCheckins,
                monthRevenue = Convert.ToDecimal(monthRevenue),
                activeContracts,
            });
        }
    }
}
