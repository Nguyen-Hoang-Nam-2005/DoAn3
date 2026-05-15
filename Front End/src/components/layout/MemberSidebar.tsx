import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const SIDEBAR_EVENT = "gym:sidebar-collapse-change";

export default function MemberSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem("sidebarCollapsed") === "true");

    const handleSidebarChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ collapsed?: boolean }>;
      setCollapsed(Boolean(customEvent.detail?.collapsed));
    };

    window.addEventListener(
      SIDEBAR_EVENT,
      handleSidebarChange as EventListener,
    );

    return () => {
      window.removeEventListener(
        SIDEBAR_EVENT,
        handleSidebarChange as EventListener,
      );
    };
  }, []);

  const toggleSidebar = () => {
    const nextCollapsed = !collapsed;
    setCollapsed(nextCollapsed);
    localStorage.setItem("sidebarCollapsed", String(nextCollapsed));
    window.dispatchEvent(
      new CustomEvent(SIDEBAR_EVENT, {
        detail: { collapsed: nextCollapsed },
      }),
    );
  };

  const menuItems = [
    {
      section: "TỔNG QUAN",
      items: [
        {
          path: "/member/dashboard",
          label: "Trang chủ",
          icon: "fas fa-th-large",
        },
        {
          path: "/member/profile",
          label: "Hồ sơ của tôi",
          icon: "fas fa-user-circle",
        },
      ],
    },
    {
      section: "HOẠT ĐỘNG",
      items: [
        {
          path: "/member/schedule",
          label: "Lịch tập",
          icon: "fas fa-calendar-alt",
        },
        {
          path: "/member/checkin-history",
          label: "Lịch sử check-in",
          icon: "fas fa-history",
        },
      ],
    },
    {
      section: "GÓI TẬP & THANH TOÁN",
      items: [
        {
          path: "/member/membership",
          label: "Gói thành viên",
          icon: "fas fa-id-card",
        },
        {
          path: "/member/invoices",
          label: "Hóa đơn",
          icon: "fas fa-file-invoice-dollar",
        },
      ],
    },
  ];

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">
            <i className="fas fa-dumbbell"></i>
          </div>
          <div className="logo-text">
            <span className="logo-name">FitZone</span>
            <span className="logo-tagline">Hội viên</span>
          </div>
        </div>
        <button
          className="sidebar-collapse-btn"
          onClick={toggleSidebar}
          title={collapsed ? "Mở rộng" : "Thu gọn"}
        >
          <i className="fas fa-chevron-left"></i>
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((section, idx) => (
          <div key={idx} className="nav-section">
            <span className="nav-section-title">{section.section}</span>
            <ul>
              {section.items.map((item) => (
                <li
                  key={item.path}
                  className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
                >
                  <Link to={item.path}>
                    <i className={item.icon}></i>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <a href="/" className="back-home-btn">
          <i className="fas fa-home"></i>
          <span>← Về trang chủ</span>
        </a>
      </div>
    </aside>
  );
}
