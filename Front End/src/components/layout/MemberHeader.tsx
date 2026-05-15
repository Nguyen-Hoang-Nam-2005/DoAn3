import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { profileApi } from "../../services/api";

const THEME_EVENT = "gym:theme-change";

const breadcrumbLabels: Record<string, string> = {
  "/member/dashboard": "Trang chủ",
  "/member/profile": "Hồ sơ của tôi",
  "/member/schedule": "Lịch tập",
  "/member/checkin-history": "Lịch sử check-in",
  "/member/workouts": "Bài tập của tôi",
  "/member/membership": "Gói thành viên",
  "/member/invoices": "Hóa đơn",
  "/member/notifications": "Thông báo",
};

export default function MemberHeader() {
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [theme, setTheme] = useState("light");
  const [memberName, setMemberName] = useState("Hội viên");

  const currentLabel = breadcrumbLabels[location.pathname] || "Trang chủ";

  useEffect(() => {
    const savedTheme =
      document.documentElement.getAttribute("data-theme") ||
      localStorage.getItem("theme") ||
      "light";
    setTheme(savedTheme);

    // Get member info from API
    const fetchMemberProfile = async () => {
      try {
        const response = await profileApi.getMe();
        if (response.data) {
          const memberData = response.data;
          const name = memberData.hoTen || "Hội viên";
          localStorage.setItem("memberName", name);
          setMemberName(name);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Use localStorage as fallback
        const storedName = localStorage.getItem("memberName") || "Hội viên";
        setMemberName(storedName);
      }
    };

    fetchMemberProfile();

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
      localStorage.removeItem("memberName");
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
          <input type="text" placeholder="Tìm kiếm lịch tập, bài tập..." />
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
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(memberName)}&background=10b981&color=fff&size=28`}
              alt={memberName}
              className="admin-avatar"
            />
            <span>{memberName}</span>
            <i className="fas fa-chevron-down"></i>
          </button>

          {showDropdown && (
            <div className="admin-dropdown-menu">
              <div className="dropdown-header">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(memberName)}&background=10b981&color=fff`}
                  alt={memberName}
                />
                <div>
                  <strong>{memberName}</strong>
                  <span>Hội viên</span>
                </div>
              </div>
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
