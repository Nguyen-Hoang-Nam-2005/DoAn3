import {
  useState,
  useEffect,
  useRef,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import "./dashboard.css";

interface Member {
  id: number;
  name: string;
  email: string;
  cardId: string;
  package: string;
  startDate: string;
  endDate: string;
  status: "active" | "expiring" | "expired";
  avatar: string;
}

const MEMBERS_STORAGE_KEY = "gymMembers";

const createAvatarUrl = (name: string, background: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name,
  )}&background=${background}&color=fff`;

const formatDashboardDate = (value: string) => {
  if (!value) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("vi-VN");
  }

  return value;
};

const getDashboardStatus = (endDate: string): Member["status"] => {
  if (!endDate) {
    return "expired";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    return "active";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = endDate.split("-").map(Number);
  const expiryDate = new Date(year, month - 1, day);
  expiryDate.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil(
    (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays < 0) {
    return "expired";
  }

  if (diffDays <= 7) {
    return "expiring";
  }

  return "active";
};

const MOCK_MEMBERS: Member[] = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    cardId: "GYM001",
    package: "Gói 3 tháng",
    startDate: "01/01/2026",
    endDate: "01/04/2026",
    status: "active",
    avatar: createAvatarUrl("Nguyễn Văn A", "6366f1"),
  },
  {
    id: 2,
    name: "Trần Thị B",
    email: "tranthib@email.com",
    cardId: "GYM002",
    package: "Gói 6 tháng",
    startDate: "15/12/2025",
    endDate: "15/04/2026",
    status: "expiring",
    avatar: createAvatarUrl("Trần Thị B", "f59e0b"),
  },
  {
    id: 3,
    name: "Lê Văn C",
    email: "levanc@email.com",
    cardId: "GYM003",
    package: "Gói 1 tháng",
    startDate: "01/11/2025",
    endDate: "01/12/2025",
    status: "expired",
    avatar: createAvatarUrl("Lê Văn C", "ef4444"),
  },
  {
    id: 4,
    name: "Phạm Minh Dũng",
    email: "dung.pham@email.com",
    cardId: "GYM004",
    package: "Gói 12 tháng",
    startDate: "05/01/2026",
    endDate: "05/01/2027",
    status: "active",
    avatar: createAvatarUrl("Phạm Minh Dũng", "0ea5e9"),
  },
  {
    id: 5,
    name: "Vũ Thu Hà",
    email: "ha.vu@email.com",
    cardId: "GYM005",
    package: "Gói 3 tháng",
    startDate: "10/02/2026",
    endDate: "10/05/2026",
    status: "active",
    avatar: createAvatarUrl("Vũ Thu Hà", "8b5cf6"),
  },
  {
    id: 6,
    name: "Bùi Quốc Huy",
    email: "huy.bui@email.com",
    cardId: "GYM006",
    package: "Gói 6 tháng",
    startDate: "20/11/2025",
    endDate: "20/05/2026",
    status: "active",
    avatar: createAvatarUrl("Bùi Quốc Huy", "06b6d4"),
  },
  {
    id: 7,
    name: "Đặng Lan Anh",
    email: "lananh.dang@email.com",
    cardId: "GYM007",
    package: "Gói 1 tháng",
    startDate: "01/03/2026",
    endDate: "01/04/2026",
    status: "expiring",
    avatar: createAvatarUrl("Đặng Lan Anh", "f97316"),
  },
  {
    id: 8,
    name: "Ngô Hữu Khang",
    email: "khang.ngo@email.com",
    cardId: "GYM008",
    package: "Gói 12 tháng",
    startDate: "18/01/2026",
    endDate: "18/01/2027",
    status: "active",
    avatar: createAvatarUrl("Ngô Hữu Khang", "14b8a6"),
  },
  {
    id: 9,
    name: "Lý Khánh Linh",
    email: "linh.ly@email.com",
    cardId: "GYM009",
    package: "Gói 3 tháng",
    startDate: "12/12/2025",
    endDate: "12/03/2026",
    status: "expired",
    avatar: createAvatarUrl("Lý Khánh Linh", "ec4899"),
  },
  {
    id: 10,
    name: "Hoàng Gia Minh",
    email: "minh.hoang@email.com",
    cardId: "GYM010",
    package: "Gói 6 tháng",
    startDate: "22/10/2025",
    endDate: "22/04/2026",
    status: "active",
    avatar: createAvatarUrl("Hoàng Gia Minh", "3b82f6"),
  },
  {
    id: 11,
    name: "Trương Bảo Ngọc",
    email: "ngoc.truong@email.com",
    cardId: "GYM011",
    package: "Gói 1 tháng",
    startDate: "05/03/2026",
    endDate: "05/04/2026",
    status: "expiring",
    avatar: createAvatarUrl("Trương Bảo Ngọc", "f43f5e"),
  },
  {
    id: 12,
    name: "Mai Quốc Phong",
    email: "phong.mai@email.com",
    cardId: "GYM012",
    package: "Gói 12 tháng",
    startDate: "14/02/2026",
    endDate: "14/02/2027",
    status: "active",
    avatar: createAvatarUrl("Mai Quốc Phong", "22c55e"),
  },
  {
    id: 13,
    name: "Phan Mỹ Quyên",
    email: "quyen.phan@email.com",
    cardId: "GYM013",
    package: "Gói 3 tháng",
    startDate: "25/01/2026",
    endDate: "25/04/2026",
    status: "active",
    avatar: createAvatarUrl("Phan Mỹ Quyên", "a855f7"),
  },
  {
    id: 14,
    name: "Lâm Tấn Tài",
    email: "tai.lam@email.com",
    cardId: "GYM014",
    package: "Gói 6 tháng",
    startDate: "09/09/2025",
    endDate: "09/03/2026",
    status: "expired",
    avatar: createAvatarUrl("Lâm Tấn Tài", "ef4444"),
  },
  {
    id: 15,
    name: "Cao Thảo Vy",
    email: "vy.cao@email.com",
    cardId: "GYM015",
    package: "Gói 1 tháng",
    startDate: "08/03/2026",
    endDate: "08/04/2026",
    status: "expiring",
    avatar: createAvatarUrl("Cao Thảo Vy", "fb7185"),
  },
  {
    id: 16,
    name: "Đoàn Nhật Nam",
    email: "nam.doan@email.com",
    cardId: "GYM016",
    package: "Gói 12 tháng",
    startDate: "01/02/2026",
    endDate: "01/02/2027",
    status: "active",
    avatar: createAvatarUrl("Đoàn Nhật Nam", "4f46e5"),
  },
  {
    id: 17,
    name: "Tạ Ngọc Bích",
    email: "bich.ta@email.com",
    cardId: "GYM017",
    package: "Gói 3 tháng",
    startDate: "17/02/2026",
    endDate: "17/05/2026",
    status: "active",
    avatar: createAvatarUrl("Tạ Ngọc Bích", "10b981"),
  },
  {
    id: 18,
    name: "Hồ Đức Long",
    email: "long.ho@email.com",
    cardId: "GYM018",
    package: "Gói 6 tháng",
    startDate: "28/12/2025",
    endDate: "28/06/2026",
    status: "active",
    avatar: createAvatarUrl("Hồ Đức Long", "0891b2"),
  },
  {
    id: 19,
    name: "Nguyễn Thảo Nhi",
    email: "nhi.nguyen@email.com",
    cardId: "GYM019",
    package: "Gói 1 tháng",
    startDate: "11/03/2026",
    endDate: "11/04/2026",
    status: "expiring",
    avatar: createAvatarUrl("Nguyễn Thảo Nhi", "f59e0b"),
  },
  {
    id: 20,
    name: "Trịnh Hữu Phúc",
    email: "phuc.trinh@email.com",
    cardId: "GYM020",
    package: "Gói 12 tháng",
    startDate: "30/01/2026",
    endDate: "30/01/2027",
    status: "active",
    avatar: createAvatarUrl("Trịnh Hữu Phúc", "2563eb"),
  },
  {
    id: 21,
    name: "Quách Mỹ Duyên",
    email: "duyen.quach@email.com",
    cardId: "GYM021",
    package: "Gói 3 tháng",
    startDate: "02/03/2026",
    endDate: "02/06/2026",
    status: "active",
    avatar: createAvatarUrl("Quách Mỹ Duyên", "d946ef"),
  },
  {
    id: 22,
    name: "Kiều Minh Tuấn",
    email: "tuan.kieu@email.com",
    cardId: "GYM022",
    package: "Gói 6 tháng",
    startDate: "14/08/2025",
    endDate: "14/02/2026",
    status: "expired",
    avatar: createAvatarUrl("Kiều Minh Tuấn", "dc2626"),
  },
  {
    id: 23,
    name: "Châu Bảo Trâm",
    email: "tram.chau@email.com",
    cardId: "GYM023",
    package: "Gói 1 tháng",
    startDate: "16/03/2026",
    endDate: "16/04/2026",
    status: "expiring",
    avatar: createAvatarUrl("Châu Bảo Trâm", "7c3aed"),
  },
];

export default function Dashboard() {
  const [currentDate, setCurrentDate] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [isMembersTableDragging, setIsMembersTableDragging] = useState(false);
  const membersTableRef = useRef<HTMLDivElement | null>(null);
  const membersTableDragRef = useRef({
    isDragging: false,
    startX: 0,
    scrollLeft: 0,
    moved: false,
  });
  const suppressMembersTableClickRef = useRef(false);

  useEffect(() => {
    // Set current date
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setCurrentDate(date.toLocaleDateString("vi-VN", options));

    // Try loading from API
    const loadFromAPI = async () => {
      try {
        const res = await fetch("http://localhost:7000/admin/Dashboard");
        if (res.ok) {
          const data = await res.json();
          // Update stats if we have a setStats or similar
          console.log("Dashboard API stats:", data);
        }
      } catch {
        /* Backend unavailable */
      }
    };
    loadFromAPI();

    try {
      const rawStoredMembers = localStorage.getItem(MEMBERS_STORAGE_KEY);
      if (rawStoredMembers) {
        const parsedMembers = JSON.parse(rawStoredMembers) as Array<{
          id?: number;
          name?: string;
          email?: string;
          cardId?: string;
          packageName?: string;
          startDate?: string;
          endDate?: string;
          gender?: string;
        }>;

        if (Array.isArray(parsedMembers) && parsedMembers.length > 0) {
          setMembers(
            parsedMembers.map((member, index) => {
              const name = member.name || `Hội viên ${index + 1}`;
              const gender = member.gender === "female" ? "female" : "male";
              const status = getDashboardStatus(member.endDate || "");

              return {
                id: Number(member.id ?? index + 1),
                name,
                email:
                  member.email ||
                  `${name
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9]+/g, ".")
                    .replace(/^\.+|\.+$/g, "")}@fitzone.local`,
                cardId:
                  member.cardId || `GYM${String(index + 1).padStart(3, "0")}`,
                package: member.packageName || "Gói 1 tháng",
                startDate: formatDashboardDate(member.startDate || ""),
                endDate: formatDashboardDate(member.endDate || ""),
                status,
                avatar: createAvatarUrl(
                  name,
                  gender === "female" ? "ec4899" : "6366f1",
                ),
              };
            }),
          );
          return;
        }
      }
    } catch {
      // Fall back to static mock data below.
    }

    setMembers(MOCK_MEMBERS);
  }, []);

  useEffect(() => {
    return () => {
      document.body.style.removeProperty("user-select");
    };
  }, []);

  const filteredMembers = members.filter((member) => {
    if (filterStatus === "all") return true;
    return member.status === filterStatus;
  });
  const expiringMembers = members.filter(
    (member) => member.status === "expiring",
  );
  const validMembers = members.filter((member) => member.status !== "expired");

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { class: "active", text: "Còn hạn" },
      expiring: { class: "expiring", text: "Sắp hết hạn" },
      expired: { class: "expired", text: "Hết hạn" },
    };
    return badges[status as keyof typeof badges] || badges.active;
  };

  const finishMembersTableDrag = () => {
    if (!membersTableDragRef.current.isDragging) {
      return;
    }

    const didMove = membersTableDragRef.current.moved;
    membersTableDragRef.current.isDragging = false;
    membersTableDragRef.current.moved = false;
    setIsMembersTableDragging(false);
    document.body.style.removeProperty("user-select");

    if (didMove) {
      suppressMembersTableClickRef.current = true;
      window.setTimeout(() => {
        suppressMembersTableClickRef.current = false;
      }, 0);
    }
  };

  const handleMembersTablePointerDown = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (event.button !== 0) {
      return;
    }

    const target = event.target as HTMLElement;
    if (target.closest("button, a, input, select, textarea, label")) {
      return;
    }

    const container = membersTableRef.current;
    if (!container || container.scrollWidth <= container.clientWidth) {
      return;
    }

    membersTableDragRef.current.isDragging = true;
    membersTableDragRef.current.startX = event.clientX;
    membersTableDragRef.current.scrollLeft = container.scrollLeft;
    membersTableDragRef.current.moved = false;
    setIsMembersTableDragging(true);
    document.body.style.setProperty("user-select", "none");
    container.setPointerCapture(event.pointerId);
  };

  const handleMembersTablePointerMove = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (!membersTableDragRef.current.isDragging) {
      return;
    }

    const container = membersTableRef.current;
    if (!container) {
      return;
    }

    const deltaX = event.clientX - membersTableDragRef.current.startX;
    if (!membersTableDragRef.current.moved && Math.abs(deltaX) > 4) {
      membersTableDragRef.current.moved = true;
    }

    container.scrollLeft = membersTableDragRef.current.scrollLeft - deltaX;
    event.preventDefault();
  };

  const handleMembersTablePointerUp = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    finishMembersTableDrag();
  };

  const handleMembersTablePointerCancel = () => {
    finishMembersTableDrag();
  };

  const handleMembersTableClickCapture = (
    event: ReactMouseEvent<HTMLDivElement>,
  ) => {
    if (!suppressMembersTableClickRef.current) {
      return;
    }

    suppressMembersTableClickRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="dashboard-page">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <h1>Chào mừng trở lại, Admin! 👋</h1>
          <p>
            Hôm nay là <span id="currentDate">{currentDate}</span>. Bạn có{" "}
            <strong>{expiringMembers.length} hội viên</strong> sắp hết hạn.
          </p>
        </div>
        <div className="welcome-illustration">
          <i className="fas fa-dumbbell"></i>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-info">
            <p>Tổng hội viên</p>
            <h3>{members.length}</h3>
          </div>
          <div className="stat-trend up">
            <i className="fas fa-arrow-up"></i> 12%
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <i className="fas fa-id-card"></i>
          </div>
          <div className="stat-info">
            <p>Thẻ còn hạn</p>
            <h3>{validMembers.length}</h3>
          </div>
          <div className="stat-trend up">
            <i className="fas fa-arrow-up"></i> 8%
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-info">
            <p>Sắp hết hạn</p>
            <h3>{expiringMembers.length}</h3>
          </div>
          <div className="stat-trend down">
            <i className="fas fa-arrow-down"></i> 3%
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <i className="fas fa-money-bill-wave"></i>
          </div>
          <div className="stat-info">
            <p>Doanh thu tháng</p>
            <h3>45.2M</h3>
          </div>
          <div className="stat-trend up">
            <i className="fas fa-arrow-up"></i> 18%
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="main-grid">
        {/* Members Card */}
        <div className="card members-card">
          <div className="card-header">
            <h2>
              <i className="fas fa-users"></i> Danh sách hội viên
            </h2>
            <div className="card-actions">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="active">Còn hạn</option>
                <option value="expiring">Sắp hết hạn</option>
                <option value="expired">Hết hạn</option>
              </select>
            </div>
          </div>
          <div className="card-body">
            <div
              ref={membersTableRef}
              className={`table-container members-table-container${
                isMembersTableDragging ? " is-dragging" : ""
              }`}
              onPointerDown={handleMembersTablePointerDown}
              onPointerMove={handleMembersTablePointerMove}
              onPointerUp={handleMembersTablePointerUp}
              onPointerCancel={handleMembersTablePointerCancel}
              onLostPointerCapture={finishMembersTableDrag}
              onClickCapture={handleMembersTableClickCapture}
            >
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Hội viên</th>
                    <th>Mã thẻ</th>
                    <th>Gói tập</th>
                    <th>Ngày bắt đầu</th>
                    <th>Ngày hết hạn</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => {
                    const badge = getStatusBadge(member.status);
                    return (
                      <tr key={member.id}>
                        <td>
                          <div className="member-cell">
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="member-avatar"
                            />
                            <div className="member-info">
                              <div className="member-name">{member.name}</div>
                              <div className="member-email">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="card-id">{member.cardId}</span>
                        </td>
                        <td>{member.package}</td>
                        <td>{member.startDate}</td>
                        <td>{member.endDate}</td>
                        <td>
                          <span className={`status-badge ${badge.class}`}>
                            {badge.text}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="action-btn edit"
                              title="Chỉnh sửa"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="action-btn renew"
                              title="Gia hạn"
                            >
                              <i className="fas fa-sync"></i>
                            </button>
                            <button className="action-btn delete" title="Xóa">
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="side-panel">
          {/* Packages Card */}
          <div className="card packages-card">
            <div className="card-header">
              <h2>
                <i className="fas fa-box-open"></i> Gói tập
              </h2>
            </div>
            <div className="card-body">
              <div className="package-list">
                <div className="package-item">
                  <div className="package-info">
                    <h4>Gói 1 tháng</h4>
                    <p>30 ngày tập luyện</p>
                  </div>
                  <div className="package-price">500K</div>
                </div>
                <div className="package-item">
                  <div className="package-info">
                    <h4>Gói 3 tháng</h4>
                    <p>90 ngày tập luyện</p>
                  </div>
                  <div className="package-price">1.2M</div>
                </div>
                <div className="package-item">
                  <div className="package-info">
                    <h4>Gói 6 tháng</h4>
                    <p>180 ngày tập luyện</p>
                  </div>
                  <div className="package-price">2.0M</div>
                </div>
                <div className="package-item">
                  <div className="package-info">
                    <h4>Gói 12 tháng</h4>
                    <p>365 ngày tập luyện</p>
                  </div>
                  <div className="package-price">3.5M</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
