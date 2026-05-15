namespace GymManagement.API.Auth.DTOs
{
    public class LoginDto
    {
        public string TenDangNhap { get; set; } = string.Empty;
        public string MatKhau { get; set; } = string.Empty;
    }

    public class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string VaiTro { get; set; } = string.Empty;
        public string HoTen { get; set; } = string.Empty;
        public int MaTaiKhoan { get; set; }
        public int? MaThanhVien { get; set; }
        public int? MaNhanVien { get; set; }
    }

    public class RegisterDto
    {
        public string TenDangNhap { get; set; } = string.Empty;
        public string MatKhau { get; set; } = string.Empty;
        public string HoTen { get; set; } = string.Empty;
        public string? SoDienThoai { get; set; }
        public string? Email { get; set; }
    }
}
