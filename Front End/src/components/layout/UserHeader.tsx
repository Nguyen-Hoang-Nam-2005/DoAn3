import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const UserHeader: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're on the home page
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    const role = localStorage.getItem("userRole");
    const currentUser = localStorage.getItem("currentUser");

    setIsAuthenticated(!!authToken);
    setUserRole(role);

    if (currentUser) {
      const user = JSON.parse(currentUser);
      setUserName(user.fullName || user.username);
    } else if (role === "admin") {
      setUserName("Admin");
    } else if (role === "trainer") {
      setUserName("Trainer");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("currentUser");
    setIsAuthenticated(false);
    setUserRole(null);
    setUserMenuOpen(false);
    navigate("/");
    window.location.reload();
  };

  return (
    <>
      {/* Top Banner */}
      <div className="top-banner">
        <div className="banner-content">
          <span>BẮT ĐẦU HÔM NAY • THAY ĐỔI NGÀY MAI</span>
          <span>•</span>
          <span>BẮT ĐẦU HÔM NAY • THAY ĐỔI NGÀY MAI</span>
          <span>•</span>
          <span>BẮT ĐẦU HÔM NAY • THAY ĐỔI NGÀY MAI</span>
          <span>•</span>
          <span>BẮT ĐẦU HÔM NAY • THAY ĐỔI NGÀY MAI</span>
          <span>•</span>
          <span>BẮT ĐẦU HÔM NAY • THAY ĐỔI NGÀY MAI</span>
          <span>•</span>
          <span>BẮT ĐẦU HÔM NAY • THAY ĐỔI NGÀY MAI</span>
          <span>•</span>
          {/* Duplicate for seamless loop */}
          <span>BẮT ĐẦU HÔM NAY • THAY ĐỔI NGÀY MAI</span>
          <span>•</span>
          <span>BẮT ĐẦU HÔM NAY • THAY ĐỔI NGÀY MAI</span>
          <span>•</span>
          <span>BẮT ĐẦU HÔM NAY • THAY ĐỔI NGÀY MAI</span>
          <span>•</span>
          <span>BẮT ĐẦU HÔM NAY • THAY ĐỔI NGÀY MAI</span>
          <span>•</span>
          <span>BẮT ĐẦU HÔM NAY • THAY ĐỔI NGÀY MAI</span>
          <span>•</span>
          <span>BẮT ĐẦU HÔM NAY • THAY ĐỔI NGÀY MAI</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="navbar-user">
        <div className="container">
          <Link to="/" className="nav-logo">
            <div className="logo-fitzone">
              <i className="fas fa-dumbbell"></i>
              <span className="logo-text">FitZone</span>
            </div>
          </Link>
          <button
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <ul className={`nav-menu ${mobileMenuOpen ? "active" : ""}`}>
            <li>
              <Link to="/">Trang chủ</Link>
            </li>
            <li>
              <Link to="/services">Dịch vụ</Link>
            </li>
            <li>
              <Link to="/promotions">Khuyến mãi</Link>
            </li>
            <li>
              <a href="#facilities">Cơ sở vật chất</a>
            </li>
            <li>
              <Link to="/blog">Blog</Link>
            </li>
            <li>
              <Link to="/careers">Tuyển dụng</Link>
            </li>
          </ul>
          <div className="nav-actions">
            {isAuthenticated && isHomePage && userRole === "member" ? (
              <div className="user-menu-wrapper">
                <button
                  className="btn-join btn-icon-only"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <i className="fas fa-user-circle"></i>
                  <i
                    className={`fas fa-chevron-${userMenuOpen ? "up" : "down"}`}
                    style={{ fontSize: "12px", marginLeft: "4px" }}
                  ></i>
                </button>
                {userMenuOpen && (
                  <div className="user-dropdown">
                    <Link
                      to="/user/profile"
                      className="user-dropdown-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <i className="fas fa-user"></i>
                      <span>Tài khoản</span>
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button
                      className="user-dropdown-item logout"
                      onClick={handleLogout}
                    >
                      <i className="fas fa-sign-out-alt"></i>
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : isAuthenticated &&
              isHomePage &&
              (userRole === "admin" || userRole === "trainer") ? (
              <div className="user-menu-wrapper">
                <button
                  className="btn-user-menu"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <i className="fas fa-user-circle"></i>
                  <span>{userName}</span>
                  <i
                    className={`fas fa-chevron-${userMenuOpen ? "up" : "down"}`}
                  ></i>
                </button>
                {userMenuOpen && (
                  <div className="user-dropdown">
                    <Link
                      to="/admin/dashboard"
                      className="user-dropdown-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <i className="fas fa-tachometer-alt"></i>
                      <span>Trang quản trị</span>
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button
                      className="user-dropdown-item logout"
                      onClick={handleLogout}
                    >
                      <i className="fas fa-sign-out-alt"></i>
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-join">
                Tham gia
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default UserHeader;
