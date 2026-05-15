import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const SIDEBAR_EVENT = "gym:sidebar-collapse-change";

// Mock function to get members expiring count
// Replace with actual API call later
const getMembersExpiringCount = () => {
  // This should fetch from API and count members expiring in next 7 days
  const mockMembers = [
    { name: "Nguyễn Văn D", daysLeft: 3 },
    { name: "Trần Thị E", daysLeft: 5 },
    { name: "Lê Văn F", daysLeft: 7 },
  ];
  return mockMembers.length;
};

export default function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [expiringCount, setExpiringCount] = useState(0);

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

    // Update expiring count
    setExpiringCount(getMembersExpiringCount());

    // Refresh count every minute
    const interval = setInterval(() => {
      setExpiringCount(getMembersExpiringCount());
    }, 60000);

    return () => {
      window.removeEventListener(
        SIDEBAR_EVENT,
        handleSidebarChange as EventListener,
      );
      clearInterval(interval);
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
      section: "MENU CHÍNH",
      items: [
        {
          path: "/admin/dashboard",
          label: "Dashboard",
          icon: "fas fa-th-large",
        },
        {
          path: "/admin/members",
          label: "Hội viên",
          icon: "fas fa-users",
        },
        { path: "/admin/packages", label: "Gói tập", icon: "fas fa-box-open" },
        {
          path: "/admin/trainers",
          label: "Huấn luyện viên",
          icon: "fas fa-user-ninja",
        },
      ],
    },
    {
      section: "HOẠT ĐỘNG",
      items: [
        {
          path: "/admin/schedule",
          label: "Lịch tập",
          icon: "fas fa-calendar-alt",
        },
        {
          path: "/admin/checkin",
          label: "Check-in",
          icon: "fas fa-qrcode",
        },
        {
          path: "/admin/facilities",
          label: "Thiết bị",
          icon: "fas fa-dumbbell",
        },
      ],
    },
    {
      section: "TÀI CHÍNH",
      items: [
        {
          path: "/admin/invoices",
          label: "Hóa đơn",
          icon: "fas fa-file-invoice-dollar",
        },
        { path: "/admin/reports", label: "Báo cáo", icon: "fas fa-chart-line" },
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
            <span className="logo-tagline">Gym Management</span>
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
                    {item.badge && (
                      <span className={`nav-badge ${item.badgeType || ""}`}>
                        {item.badge}
                      </span>
                    )}
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
