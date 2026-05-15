import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const THEME_EVENT = "gym:theme-change";

const breadcrumbLabels: Record<string, string> = {
  "/trainer/dashboard": "Trang chủ",
  "/trainer/classes": "Lớp học của tôi",
  "/trainer/students": "Học viên PT",
  "/trainer/income": "Thu nhập",
};

export default function TrainerHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [theme, setTheme] = useState("light");
  const [trainerName, setTrainerName] = useState("Huấn luyện viên");

  const currentLabel = breadcrumbLabels[location.pathname] || "Trang chủ";

  useEffect(() => {
    const savedTheme =
      document.documentElement.getAttribute("data-theme") ||
      localStorage.getItem("theme") ||
      "light";
    setTheme(savedTheme);

    // Get trainer name from localStorage
    const storedName = localStorage.getItem("trainerName") || "Huấn luyện viên";
    setTrainerName(storedName);

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
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userId");
      localStorage.removeItem("trainerName");
      localStorage.removeItem("memberName");
      navigate("/");
    }
  };

  const handleGoHome = () => {
    setShowDropdown(false);
    navigate("/");
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
          <input type="text" placeholder="Tìm kiếm học viên, lớp học..." />
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

        <button className="header-btn notification-btn" title="Thông báo">
          <i className="fas fa-bell"></i>
        </button>

        <div className={`admin-dropdown ${showDropdown ? "active" : ""}`}>
          <button
            className="btn btn-primary btn-glow admin-btn"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(trainerName)}&background=f093fb&color=fff&size=28`}
              alt={trainerName}
              className="admin-avatar"
            />
            <span>{trainerName}</span>
            <i className="fas fa-chevron-down"></i>
          </button>

          {showDropdown && (
            <div className="admin-dropdown-menu">
              <div className="dropdown-header">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(trainerName)}&background=f093fb&color=fff`}
                  alt={trainerName}
                />
                <div>
                  <strong>{trainerName}</strong>
                  <span>Huấn luyện viên</span>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <a
                href="#"
                className="dropdown-item"
                onClick={(e) => {
                  e.preventDefault();
                  handleGoHome();
                }}
              >
                <i className="fas fa-home"></i> Về trang chủ
              </a>
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
