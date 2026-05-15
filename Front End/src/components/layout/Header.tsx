import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const THEME_EVENT = "gym:theme-change";

const breadcrumbLabels: Record<string, string> = {
  "/": "Dashboard",
  "/dashboard": "Dashboard",
  "/members": "Hội viên",
  "/packages": "Gói tập",
  "/trainers": "Huấn luyện viên",
  "/checkin": "Check-in",
  "/reports": "Báo cáo",
  "/schedule": "Lịch tập",
  "/facilities": "Thiết bị",
  "/invoices": "Hóa đơn",
  "/settings": "Cài đặt",
};

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [theme, setTheme] = useState("light");
  const normalizedPath =
    location.pathname === "/admin"
      ? "/dashboard"
      : location.pathname.replace(/^\/admin/, "") || "/dashboard";
  const currentLabel = breadcrumbLabels[normalizedPath] || "Dashboard";

  useEffect(() => {
    const savedTheme =
      document.documentElement.getAttribute("data-theme") ||
      localStorage.getItem("theme") ||
      "light";
    setTheme(savedTheme);

    const handleThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ theme?: string }>;
      setTheme(customEvent.detail?.theme || "light");
    };

    window.addEventListener(THEME_EVENT, handleThemeChange as EventListener);

    return () => {
      window.removeEventListener(
        THEME_EVENT,
        handleThemeChange as EventListener,
      );
    };
  }, []);

  const handleLogout = () => {
    if (confirm("Bạn có chắc muốn đăng xuất?")) {
      // Only remove auth tokens, keep saved credentials if remember me was checked
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      // Don't remove rememberMe, savedUsername, savedPassword
      window.location.href = "/";
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    window.dispatchEvent(
      new CustomEvent(THEME_EVENT, {
        detail: { theme: newTheme },
      }),
    );
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle" id="menuToggle">
          <i className="fas fa-bars"></i>
        </button>
        <div className="breadcrumb">
          <span className="breadcrumb-item">
            <i className="fas fa-home"></i>
          </span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item active">{currentLabel}</span>
        </div>
      </div>

      <div className="header-center">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input type="text" placeholder="Tìm kiếm hội viên, PT, gói tập..." />
        </div>
      </div>

      <div className="header-right">
        <button
          className="header-btn"
          onClick={toggleTheme}
          title="Đổi giao diện"
        >
          <i className={`fas fa-${theme === "light" ? "moon" : "sun"}`}></i>
        </button>

        <button
          className="header-btn"
          onClick={toggleFullscreen}
          title="Toàn màn hình"
        >
          <i className="fas fa-expand"></i>
        </button>

        <div className={`admin-dropdown ${showDropdown ? "active" : ""}`}>
          <button
            className="btn btn-primary btn-glow admin-btn"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <img
              src="https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff&size=28"
              alt="Admin"
              className="admin-avatar"
            />
            <span>Admin</span>
            <i className="fas fa-chevron-down"></i>
          </button>

          {showDropdown && (
            <div className="admin-dropdown-menu">
              <div className="dropdown-header">
                <img
                  src="https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff"
                  alt="Admin"
                />
                <div>
                  <strong>Nguyễn Admin</strong>
                  <span>Quản trị viên</span>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <a href="/admin/settings" className="dropdown-item">
                <i className="fas fa-cog"></i> Cài đặt
              </a>
              <div className="dropdown-divider"></div>
              <a
                href="#"
                className="dropdown-item text-danger"
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
              >
                <i className="fas fa-sign-out-alt"></i> Đăng xuất
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
