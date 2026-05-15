using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using GymManagement.API.Auth.DTOs;
using GymManagement.DbHelper;
using Microsoft.IdentityModel.Tokens;

namespace GymManagement.API.Auth.Services
{
    public class AuthService
    {
        private readonly IDbHelper _db;
        private readonly IConfiguration _config;

        public AuthService(IDbHelper db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        public LoginResponseDto? Login(LoginDto dto)
        {
            const string sql = @"
                SELECT tk.MaTaiKhoan, tk.TenDangNhap, tk.MatKhauHash,
                       vt.TenVaiTro, tk.MaNhanVien, tk.MaThanhVien,
                       COALESCE(nv.HoTen, tv.HoTen, tk.TenDangNhap) AS HoTen
                FROM TaiKhoan tk
                INNER JOIN VaiTro vt ON vt.MaVaiTro = tk.MaVaiTro
                LEFT JOIN NhanVien nv ON nv.MaNhanVien = tk.MaNhanVien
                LEFT JOIN ThanhVien tv ON tv.MaThanhVien = tk.MaThanhVien
                WHERE tk.TenDangNhap = @TenDangNhap AND tk.TrangThai = 1";

            var dt = _db.ExecuteQuery(sql, "@TenDangNhap", dto.TenDangNhap);
            if (dt.Rows.Count == 0) return null;

            var row = dt.Rows[0];
            var hash = row["MatKhauHash"].ToString()!;

            if (!VerifyPassword(dto.MatKhau, hash)) return null;

            var vaiTro = row["TenVaiTro"].ToString()!;
            var hoTen = row["HoTen"].ToString()!;
            var maTaiKhoan = Convert.ToInt32(row["MaTaiKhoan"]);
            var maThanhVien = row["MaThanhVien"] == DBNull.Value ? (int?)null : Convert.ToInt32(row["MaThanhVien"]);
            var maNhanVien = row["MaNhanVien"] == DBNull.Value ? (int?)null : Convert.ToInt32(row["MaNhanVien"]);

            var token = GenerateToken(maTaiKhoan, dto.TenDangNhap, vaiTro, hoTen, maThanhVien, maNhanVien);

            return new LoginResponseDto
            {
                Token = token,
                VaiTro = vaiTro,
                HoTen = hoTen,
                MaTaiKhoan = maTaiKhoan,
                MaThanhVien = maThanhVien,
                MaNhanVien = maNhanVien
            };
        }

        public bool Register(RegisterDto dto)
        {
            // Check if username exists
            var check = _db.ExecuteScalar("SELECT COUNT(1) FROM TaiKhoan WHERE TenDangNhap = @TenDangNhap", "@TenDangNhap", dto.TenDangNhap);
            if (Convert.ToInt32(check) > 0) return false;

            // Get HoiVien role id
            var roleId = _db.ExecuteScalar("SELECT MaVaiTro FROM VaiTro WHERE TenVaiTro = 'HoiVien'");
            if (roleId == DBNull.Value) return false;

            // Create ThanhVien record
            var maThanhVien = _db.ExecuteScalar(@"
                INSERT INTO ThanhVien (HoTen, SoDienThoai, Email, NgayDangKy, TrangThai)
                VALUES (@HoTen, @SoDienThoai, @Email, CAST(GETDATE() AS DATE), 1);
                SELECT SCOPE_IDENTITY();",
                "@HoTen", dto.HoTen,
                "@SoDienThoai", (object?)dto.SoDienThoai ?? DBNull.Value,
                "@Email", (object?)dto.Email ?? DBNull.Value);

            // Create TaiKhoan
            var hash = HashPassword(dto.MatKhau);
            _db.ExecuteNonQuery(@"
                INSERT INTO TaiKhoan (TenDangNhap, MatKhauHash, MaVaiTro, MaThanhVien, TrangThai)
                VALUES (@TenDangNhap, @MatKhauHash, @MaVaiTro, @MaThanhVien, 1)",
                "@TenDangNhap", dto.TenDangNhap,
                "@MatKhauHash", hash,
                "@MaVaiTro", Convert.ToInt32(roleId),
                "@MaThanhVien", Convert.ToInt32(maThanhVien));

            return true;
        }

        private string GenerateToken(int maTaiKhoan, string tenDangNhap, string vaiTro, string hoTen, int? maThanhVien, int? maNhanVien)
        {
            var jwt = _config.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, maTaiKhoan.ToString()),
                new(ClaimTypes.Name, tenDangNhap),
                new(ClaimTypes.Role, vaiTro),
                new("HoTen", hoTen),
            };

            if (maThanhVien.HasValue)
                claims.Add(new("MaThanhVien", maThanhVien.Value.ToString()));
            if (maNhanVien.HasValue)
                claims.Add(new("MaNhanVien", maNhanVien.Value.ToString()));

            var token = new JwtSecurityToken(
                issuer: jwt["Issuer"],
                audience: jwt["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public static string HashPassword(string password)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }

        private static bool VerifyPassword(string password, string hash)
        {
            return HashPassword(password) == hash;
        }
    }
}
