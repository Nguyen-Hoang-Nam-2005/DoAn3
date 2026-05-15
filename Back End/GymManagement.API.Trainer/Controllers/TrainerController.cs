using GymManagement.DbHelper;
using Microsoft.AspNetCore.Mvc;
using System.Data;

namespace GymManagement.API.Trainer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ScheduleController : ControllerBase
    {
        private readonly IDbHelper _db;
        public ScheduleController(IDbHelper db) { _db = db; }

        [HttpGet]
        public IActionResult GetMySchedule()
        {
            // For demo, return all schedules
            var dt = _db.ExecuteQuery(@"
                SELECT TOP 20 bt.MaBuoiTapPT, bt.ThoiGianBatDau, bt.ThoiGianKetThuc, bt.TrangThai, bt.GhiChu,
                       tv.HoTen AS TenHocVien
                FROM BuoiTapPT bt
                INNER JOIN HopDongPT hd ON hd.MaHopDongPT = bt.MaHopDongPT
                INNER JOIN ThanhVien tv ON tv.MaThanhVien = hd.MaThanhVien
                ORDER BY bt.ThoiGianBatDau DESC");
            var list = dt.Rows.Cast<DataRow>().Select(row => new
            {
                id = Convert.ToInt32(row["MaBuoiTapPT"]),
                thoiGianBatDau = Convert.ToDateTime(row["ThoiGianBatDau"]),
                thoiGianKetThuc = Convert.ToDateTime(row["ThoiGianKetThuc"]),
                trangThai = Convert.ToByte(row["TrangThai"]),
                ghiChu = row["GhiChu"]?.ToString(),
                tenHocVien = row["TenHocVien"]?.ToString(),
            }).ToList();
            return Ok(list);
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class StudentsController : ControllerBase
    {
        private readonly IDbHelper _db;
        public StudentsController(IDbHelper db) { _db = db; }

        [HttpGet]
        public IActionResult GetMyStudents()
        {
            var dt = _db.ExecuteQuery(@"
                SELECT DISTINCT tv.MaThanhVien, tv.HoTen, tv.SoDienThoai, tv.Email,
                       gpt.TenGoiPT, hd.SoBuoiConLai, hd.NgayBatDau, hd.NgayKetThuc
                FROM HopDongPT hd
                INNER JOIN ThanhVien tv ON tv.MaThanhVien = hd.MaThanhVien
                INNER JOIN GoiPT gpt ON gpt.MaGoiPT = hd.MaGoiPT
                WHERE hd.TrangThai = 1
                ORDER BY tv.HoTen");
            var list = dt.Rows.Cast<DataRow>().Select(row => new
            {
                maThanhVien = Convert.ToInt32(row["MaThanhVien"]),
                hoTen = row["HoTen"]?.ToString(),
                soDienThoai = row["SoDienThoai"]?.ToString(),
                email = row["Email"]?.ToString(),
                tenGoiPT = row["TenGoiPT"]?.ToString(),
                soBuoiConLai = Convert.ToInt32(row["SoBuoiConLai"]),
                ngayBatDau = Convert.ToDateTime(row["NgayBatDau"]),
                ngayKetThuc = Convert.ToDateTime(row["NgayKetThuc"]),
            }).ToList();
            return Ok(list);
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class AttendanceController : ControllerBase
    {
        private readonly IDbHelper _db;
        public AttendanceController(IDbHelper db) { _db = db; }

        [HttpPost]
        public IActionResult SaveAttendance([FromBody] AttendanceDto dto)
        {
            // Save attendance records
            foreach (var student in dto.Students.Where(s => s.Attended))
            {
                _db.ExecuteNonQuery(@"
                    INSERT INTO DiemDanh (MaThanhVien, ThoiGianVao, HinhThuc, GhiChu)
                    VALUES (@MaTV, @ThoiGian, 'PT', @GhiChu)",
                    "@MaTV", student.Id,
                    "@ThoiGian", DateTime.Parse(dto.Date),
                    "@GhiChu", (object?)student.Note ?? DBNull.Value);
            }
            return Ok(new { message = "Lưu điểm danh thành công", count = dto.Students.Count(s => s.Attended) });
        }
    }

    public class AttendanceDto
    {
        public string Date { get; set; } = string.Empty;
        public string ClassName { get; set; } = string.Empty;
        public List<StudentAttendance> Students { get; set; } = new();
    }

    public class StudentAttendance
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool Attended { get; set; }
        public string? Note { get; set; }
    }
}
