using GymManagement.DbHelper;
using Microsoft.AspNetCore.Mvc;
using System.Data;

namespace GymManagement.API.Admin.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HoaDonController : ControllerBase
    {
        private readonly IDbHelper _db;

        public HoaDonController(IDbHelper db)
        {
            _db = db;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            const string sql = @"
                SELECT hd.MaHoaDon, hd.MaThanhVien, tv.HoTen AS TenThanhVien, tv.SoDienThoai,
                       nv.HoTen AS TenNhanVien, hd.NgayLap, hd.TongTien, hd.GiamGia,
                       hd.SoTienPhaiTra, hd.TrangThai, hd.GhiChu
                FROM HoaDon hd
                LEFT JOIN ThanhVien tv ON tv.MaThanhVien = hd.MaThanhVien
                LEFT JOIN NhanVien nv ON nv.MaNhanVien = hd.MaNhanVienLap
                ORDER BY hd.NgayLap DESC";
            var dt = _db.ExecuteQuery(sql);
            var list = dt.Rows.Cast<DataRow>().Select(row =>
            {
                var trangThai = Convert.ToByte(row["TrangThai"]);
                var statusStr = trangThai == 2 ? "paid" : trangThai == 3 ? "cancelled" : "pending";

                return new
                {
                    id = Convert.ToInt32(row["MaHoaDon"]),
                    invoiceId = $"INV{Convert.ToDateTime(row["NgayLap"]):yyyyMMdd}{Convert.ToInt32(row["MaHoaDon"]):D3}",
                    customerId = row["MaThanhVien"] != DBNull.Value ? Convert.ToInt32(row["MaThanhVien"]) : 0,
                    customerName = row["TenThanhVien"]?.ToString() ?? "Khách vãng lai",
                    customerPhone = row["SoDienThoai"]?.ToString() ?? "",
                    type = "membership",
                    description = row["GhiChu"]?.ToString() ?? "Dịch vụ gym",
                    total = Convert.ToDecimal(row["SoTienPhaiTra"]),
                    discount = Convert.ToDecimal(row["GiamGia"]),
                    createdAt = Convert.ToDateTime(row["NgayLap"]).ToString("o"),
                    status = statusStr,
                    staffName = row["TenNhanVien"]?.ToString() ?? "",
                };
            }).ToList();
            return Ok(list);
        }

        [HttpGet("member/{memberId}")]
        public IActionResult GetByMember(int memberId)
        {
            const string sql = @"
                SELECT MaHoaDon, NgayLap, TongTien, GiamGia, SoTienPhaiTra, TrangThai, GhiChu
                FROM HoaDon WHERE MaThanhVien = @Id ORDER BY NgayLap DESC";
            var dt = _db.ExecuteQuery(sql, "@Id", memberId);
            var list = dt.Rows.Cast<DataRow>().Select(row =>
            {
                var trangThai = Convert.ToByte(row["TrangThai"]);
                return new
                {
                    id = Convert.ToInt32(row["MaHoaDon"]),
                    invoiceNumber = $"INV-{Convert.ToDateTime(row["NgayLap"]):yyyy}-{Convert.ToInt32(row["MaHoaDon"]):D3}",
                    date = Convert.ToDateTime(row["NgayLap"]).ToString("yyyy-MM-dd"),
                    total = Convert.ToDecimal(row["SoTienPhaiTra"]),
                    discount = Convert.ToDecimal(row["GiamGia"]),
                    status = trangThai == 2 ? "paid" : trangThai == 3 ? "awaiting_approval" : "pending",
                    notes = row["GhiChu"]?.ToString(),
                };
            }).ToList();
            return Ok(list);
        }

        [HttpPut("{id}/approve")]
        public IActionResult Approve(int id)
        {
            var rows = _db.ExecuteNonQuery("UPDATE HoaDon SET TrangThai = 2 WHERE MaHoaDon = @Id", "@Id", id);
            return rows > 0 ? Ok(new { message = "Đã xác nhận thanh toán" }) : NotFound();
        }

        [HttpPut("{id}/pay")]
        public IActionResult Pay(int id, [FromBody] PayDto dto)
        {
            // Member pays -> set to awaiting approval (status 3)
            var rows = _db.ExecuteNonQuery(@"
                UPDATE HoaDon SET TrangThai = 3, GhiChu = CONCAT(GhiChu, ' | Thanh toán: ', @Method)
                WHERE MaHoaDon = @Id",
                "@Method", dto.Method ?? "Chuyển khoản", "@Id", id);
            return rows > 0 ? Ok(new { message = "Đã gửi yêu cầu thanh toán" }) : NotFound();
        }

        [HttpPost]
        public IActionResult Create([FromBody] CreateInvoiceDto dto)
        {
            var id = _db.ExecuteScalar(@"
                INSERT INTO HoaDon (MaThanhVien, MaNhanVienLap, TongTien, GiamGia, SoTienPhaiTra, TrangThai, GhiChu)
                VALUES (@MaTV, @MaNV, @Tong, @Giam, @PhaiTra, @TT, @GhiChu);
                SELECT SCOPE_IDENTITY();",
                "@MaTV", (object?)dto.MaThanhVien ?? DBNull.Value,
                "@MaNV", dto.MaNhanVienLap > 0 ? dto.MaNhanVienLap : 1,
                "@Tong", dto.TongTien,
                "@Giam", dto.GiamGia,
                "@PhaiTra", dto.TongTien - dto.GiamGia,
                "@TT", dto.TrangThai,
                "@GhiChu", (object?)dto.GhiChu ?? DBNull.Value);
            return Ok(new { id = Convert.ToInt32(id), message = "Tạo hóa đơn thành công" });
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            _db.ExecuteNonQuery("DELETE FROM HoaDon WHERE MaHoaDon = @Id", "@Id", id);
            return Ok(new { message = "Xóa thành công" });
        }
    }

    public class CreateInvoiceDto
    {
        public int? MaThanhVien { get; set; }
        public int MaNhanVienLap { get; set; } = 1;
        public decimal TongTien { get; set; }
        public decimal GiamGia { get; set; }
        public int TrangThai { get; set; } = 1;
        public string? GhiChu { get; set; }
    }

    public class PayDto
    {
        public string? Method { get; set; }
    }
}
