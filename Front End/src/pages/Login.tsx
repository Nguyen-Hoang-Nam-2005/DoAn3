import React, { useState, useEffect } from "react";

const Login: React.FC = () => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registerRole, setRegisterRole] = useState<"HoiVien" | "HuanLuyenVien">(
    "HoiVien",
  );
  const [loginRole, setLoginRole] = useState<
    "Admin" | "HuanLuyenVien" | "HoiVien"
  >("HoiVien");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load saved credentials on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem("savedUsername");
    const savedPassword = localStorage.getItem("savedPassword");
    const savedRemember = localStorage.getItem("rememberMe");

    if (savedRemember === "true" && savedUsername && savedPassword) {
      setUsername(savedUsername);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Check for demo accounts first (for testing without backend)
    const demoAccounts = [
      { username: "admin", password: "admin123", role: "Admin", name: "Admin" },
      {
        username: "trainer",
        password: "trainer123",
        role: "HuanLuyenVien",
        name: "Huấn luyện viên",
      },
      {
        username: "member",
        password: "member123",
        role: "HoiVien",
        name: "Hội viên",
      },
    ];

    const demoAccount = demoAccounts.find(
      (acc) => acc.username === username && acc.password === password,
    );

    if (demoAccount) {
      console.log("Login successful:", demoAccount);

      localStorage.setItem("authToken", `demo-token-${demoAccount.username}`);
      localStorage.setItem("userRole", demoAccount.role);
      localStorage.setItem("userId", "1");

      console.log("Saved to localStorage:", {
        authToken: localStorage.getItem("authToken"),
        userRole: localStorage.getItem("userRole"),
        userId: localStorage.getItem("userId"),
      });

      // Lưu tên theo role
      if (demoAccount.role === "HuanLuyenVien") {
        localStorage.setItem("trainerName", demoAccount.name);
      } else if (demoAccount.role === "HoiVien") {
        localStorage.setItem("memberName", demoAccount.name);
      } else {
        localStorage.setItem("adminName", demoAccount.name);
      }

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("savedUsername", username);
        localStorage.setItem("savedPassword", password);
      } else {
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("savedUsername");
        localStorage.removeItem("savedPassword");
      }

      // Điều hướng theo role
      console.log("Redirecting to dashboard for role:", demoAccount.role);

      if (demoAccount.role === "Admin") {
        window.location.href = "/admin/dashboard";
      } else if (demoAccount.role === "HuanLuyenVien") {
        window.location.href = "/trainer/dashboard";
      } else {
        window.location.href = "/member/dashboard";
      }
      return;
    }

    // Check locally registered accounts (offline mode)
    const localAccountsRaw = localStorage.getItem("localAccounts");
    if (localAccountsRaw) {
      try {
        const localAccounts: Array<{
          username: string;
          password: string;
          hoTen: string;
          email: string;
          soDienThoai: string;
          userId: string;
        }> = JSON.parse(localAccountsRaw);
        const localAccount = localAccounts.find(
          (acc) => acc.username === username && acc.password === password,
        );
        if (localAccount) {
          localStorage.setItem(
            "authToken",
            `local-token-${localAccount.username}`,
          );
          const accountRole = (localAccount as any).role || "HoiVien";
          localStorage.setItem("userRole", accountRole);
          localStorage.setItem("userId", localAccount.userId);

          if (accountRole === "HuanLuyenVien") {
            localStorage.setItem("trainerName", localAccount.hoTen);
          } else {
            localStorage.setItem("memberName", localAccount.hoTen);
          }

          if (rememberMe) {
            localStorage.setItem("rememberMe", "true");
            localStorage.setItem("savedUsername", username);
            localStorage.setItem("savedPassword", password);
          } else {
            localStorage.removeItem("rememberMe");
            localStorage.removeItem("savedUsername");
            localStorage.removeItem("savedPassword");
          }

          if (accountRole === "HuanLuyenVien") {
            window.location.href = "/trainer/dashboard";
          } else {
            window.location.href = "/member/dashboard";
          }
          return;
        }
      } catch {
        // ignore parse error
      }
    }

    // Try API login if backend is available
    try {
      const response = await fetch("http://localhost:7000/auth/Auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenDangNhap: username,
          matKhau: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userRole", data.vaiTro);
        localStorage.setItem(
          "userId",
          String(data.maThanhVien || data.maNhanVien || "1"),
        );

        // Lưu tên theo role
        if (data.vaiTro === "HuanLuyenVien") {
          localStorage.setItem("trainerName", data.hoTen);
        } else if (data.vaiTro === "HoiVien") {
          localStorage.setItem("memberName", data.hoTen);
        } else {
          localStorage.setItem("adminName", data.hoTen);
        }

        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
          localStorage.setItem("savedUsername", username);
          localStorage.setItem("savedPassword", password);
        } else {
          localStorage.removeItem("rememberMe");
          localStorage.removeItem("savedUsername");
          localStorage.removeItem("savedPassword");
        }

        if (data.vaiTro === "Admin") {
          window.location.href = "/admin/dashboard";
        } else if (data.vaiTro === "HuanLuyenVien") {
          window.location.href = "/trainer/dashboard";
        } else {
          window.location.href = "/member/dashboard";
        }
        return;
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || "Sai tên đăng nhập hoặc mật khẩu!");
      }
    } catch (error) {
      console.error("API unavailable, using demo accounts:", error);
      setError("Sai tên đăng nhập hoặc mật khẩu!");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (
      !fullName ||
      !email ||
      !phone ||
      !username ||
      !password ||
      !confirmPassword
    ) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    // Try API register first
    let apiSuccess = false;
    try {
      const response = await fetch("http://localhost:7000/auth/Auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hoTen: fullName,
          email: email,
          soDienThoai: phone,
          tenDangNhap: username,
          matKhau: password,
          vaiTro: registerRole,
        }),
      });

      if (response.ok) {
        apiSuccess = true;
        setSuccess("Đăng ký thành công! Đang chuyển đến trang đăng nhập...");

        setTimeout(() => {
          setIsRegisterMode(false);
          setSuccess("");
          setFullName("");
          setEmail("");
          setPhone("");
          setPassword("");
          setConfirmPassword("");
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Đăng ký thất bại!");
        return;
      }
    } catch {
      // Backend unavailable — fall back to localStorage registration
    }

    if (!apiSuccess) {
      // Save account to localStorage for offline use
      const localAccountsRaw = localStorage.getItem("localAccounts");
      let localAccounts: Array<{
        username: string;
        password: string;
        hoTen: string;
        email: string;
        soDienThoai: string;
        userId: string;
      }> = [];
      try {
        if (localAccountsRaw) localAccounts = JSON.parse(localAccountsRaw);
      } catch {
        localAccounts = [];
      }

      // Check for duplicate username
      const exists = localAccounts.find((acc) => acc.username === username);
      if (exists) {
        setError("Tên đăng nhập này đã được sử dụng. Vui lòng chọn tên khác!");
        return;
      }

      const newAccount = {
        username,
        password,
        hoTen: fullName,
        email,
        soDienThoai: phone,
        userId: `local-${Date.now()}`,
        role: registerRole,
      };
      localAccounts.push(newAccount);
      localStorage.setItem("localAccounts", JSON.stringify(localAccounts));

      setSuccess("Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.");
      setTimeout(() => {
        setIsRegisterMode(false);
        setSuccess("");
        setFullName("");
        setEmail("");
        setPhone("");
        setPassword("");
        setConfirmPassword("");
      }, 2000);
    }
  };

  const fillDemo = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError("");
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Side - Branding */}
        <div className="login-branding">
          <div className="branding-content">
            <div className="logo-large">
              <div className="logo-icon-large">
                <i className="fas fa-dumbbell"></i>
              </div>
              <h1>FitZone</h1>
              <p>Gym Management System</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-section">
          <div className="login-form-container">
            <div className="login-header">
              <h2>
                {isRegisterMode ? "Đăng ký tài khoản" : "Chào mừng bạn trở lại"}
              </h2>
              <p>
                {isRegisterMode
                  ? "Tạo tài khoản mới để bắt đầu"
                  : "Đăng nhập để tiếp tục quản lý"}
              </p>
            </div>

            {isRegisterMode ? (
              // Register Form
              <form onSubmit={handleRegister}>
                {/* Role Selector */}
                <div className="form-group">
                  <label>
                    <i className="fas fa-user-tag"></i> Đăng ký với vai trò
                  </label>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setRegisterRole("HoiVien")}
                      style={{
                        flex: 1,
                        padding: "0.75rem 1rem",
                        borderRadius: "10px",
                        border:
                          registerRole === "HoiVien"
                            ? "2px solid #6366f1"
                            : "2px solid #e5e7eb",
                        background:
                          registerRole === "HoiVien" ? "#eef2ff" : "white",
                        color:
                          registerRole === "HoiVien" ? "#6366f1" : "#6b7280",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <i className="fas fa-user"></i> Hội viên
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegisterRole("HuanLuyenVien")}
                      style={{
                        flex: 1,
                        padding: "0.75rem 1rem",
                        borderRadius: "10px",
                        border:
                          registerRole === "HuanLuyenVien"
                            ? "2px solid #8b5cf6"
                            : "2px solid #e5e7eb",
                        background:
                          registerRole === "HuanLuyenVien"
                            ? "#f5f3ff"
                            : "white",
                        color:
                          registerRole === "HuanLuyenVien"
                            ? "#8b5cf6"
                            : "#6b7280",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <i className="fas fa-dumbbell"></i> Huấn luyện viên
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <i className="fas fa-user"></i> Họ và tên
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div className="form-group">
                  <label>
                    <i className="fas fa-envelope"></i> Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Nhập email"
                  />
                </div>
                <div className="form-group">
                  <label>
                    <i className="fas fa-phone"></i> Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div className="form-group">
                  <label>
                    <i className="fas fa-user-circle"></i> Tên đăng nhập
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Nhập tên đăng nhập"
                  />
                </div>
                <div className="form-group">
                  <label>
                    <i className="fas fa-lock"></i> Mật khẩu
                  </label>
                  <div className="password-input">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i
                        className={`fas fa-${showPassword ? "eye-slash" : "eye"}`}
                      ></i>
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>
                    <i className="fas fa-lock"></i> Xác nhận mật khẩu
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Nhập lại mật khẩu"
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-login">
                  <i className="fas fa-user-plus"></i>
                  <span>Đăng ký</span>
                </button>

                {error && (
                  <div className="login-error show">
                    <i className="fas fa-exclamation-circle"></i>
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="login-success show">
                    <i className="fas fa-check-circle"></i>
                    <span>{success}</span>
                  </div>
                )}

                <div className="auth-switch">
                  <p>
                    Đã có tài khoản?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegisterMode(false);
                        setError("");
                        setSuccess("");
                      }}
                    >
                      Đăng nhập ngay
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              // Login Form
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label>
                    <i className="fas fa-user"></i> Tên đăng nhập
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Nhập tên đăng nhập"
                    autoComplete="username"
                  />
                </div>
                <div className="form-group">
                  <label>
                    <i className="fas fa-lock"></i> Mật khẩu
                  </label>
                  <div className="password-input">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Nhập mật khẩu"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i
                        className={`fas fa-${showPassword ? "eye-slash" : "eye"}`}
                      ></i>
                    </button>
                  </div>
                </div>

                <div className="form-options">
                  <label className="remember-me">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>Ghi nhớ đăng nhập</span>
                  </label>
                  <a href="#" className="forgot-password">
                    Quên mật khẩu?
                  </a>
                </div>

                <button type="submit" className="btn btn-primary btn-login">
                  <i className="fas fa-sign-in-alt"></i>
                  <span>Đăng nhập</span>
                </button>

                {/* Role Quick Select */}
                <div
                  style={{
                    marginTop: "1rem",
                    display: "flex",
                    gap: "0.5rem",
                    justifyContent: "center",
                  }}
                >
                  {[
                    {
                      role: "HoiVien" as const,
                      label: "Hội viên",
                      icon: "user",
                      color: "#10b981",
                    },
                    {
                      role: "HuanLuyenVien" as const,
                      label: "HLV",
                      icon: "dumbbell",
                      color: "#8b5cf6",
                    },
                    {
                      role: "Admin" as const,
                      label: "Admin",
                      icon: "shield-alt",
                      color: "#6366f1",
                    },
                  ].map((item) => (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => {
                        setLoginRole(item.role);
                        if (item.role === "Admin") {
                          setUsername("admin");
                          setPassword("admin123");
                        } else if (item.role === "HuanLuyenVien") {
                          setUsername("trainer");
                          setPassword("trainer123");
                        } else {
                          setUsername("member");
                          setPassword("member123");
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: "0.5rem 0.75rem",
                        borderRadius: "8px",
                        border:
                          loginRole === item.role
                            ? `2px solid ${item.color}`
                            : "1px solid #e5e7eb",
                        background:
                          loginRole === item.role ? `${item.color}10` : "white",
                        color: loginRole === item.role ? item.color : "#6b7280",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.375rem",
                      }}
                    >
                      <i className={`fas fa-${item.icon}`}></i> {item.label}
                    </button>
                  ))}
                </div>

                {error && (
                  <div className="login-error show">
                    <i className="fas fa-exclamation-circle"></i>
                    <span>{error}</span>
                  </div>
                )}

                <div className="auth-switch">
                  <p>
                    Chưa có tài khoản?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegisterMode(true);
                        setError("");
                      }}
                    >
                      Đăng ký ngay
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
