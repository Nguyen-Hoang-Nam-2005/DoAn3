using GymManagement.API.Auth.DTOs;
using GymManagement.API.Auth.Services;
using Microsoft.AspNetCore.Mvc;

namespace GymManagement.API.Auth.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.TenDangNhap) || string.IsNullOrWhiteSpace(dto.MatKhau))
                return BadRequest(new { message = "Tên đăng nhập và mật khẩu không được để trống" });

            var result = _authService.Login(dto);
            if (result == null)
                return Unauthorized(new { message = "Tên đăng nhập hoặc mật khẩu không đúng" });

            return Ok(result);
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.TenDangNhap) || string.IsNullOrWhiteSpace(dto.MatKhau))
                return BadRequest(new { message = "Thông tin không hợp lệ" });

            var success = _authService.Register(dto);
            if (!success)
                return Conflict(new { message = "Tên đăng nhập đã tồn tại" });

            return Ok(new { message = "Đăng ký thành công" });
        }
    }
}
