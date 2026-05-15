import { useState, useEffect } from "react";
import TrainerSidebar from "../components/layout/TrainerSidebar";
import TrainerHeader from "../components/layout/TrainerHeader";
import "../styles.css";
import "./trainerStudents.css";

interface Student {
  id: number;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  packageName: string;
  sessionsTotal: number;
  sessionsUsed: number;
  sessionsLeft: number;
  startDate: string;
  endDate: string;
  goal: string;
  status: string;
  progress: number;
}

export default function TrainerStudents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);

  // Load students from localStorage (members who have PT subscriptions)
  useEffect(() => {
    const loadStudents = () => {
      try {
        const raw = localStorage.getItem("gymMembers");
        if (raw) {
          const members = JSON.parse(raw);
          if (Array.isArray(members)) {
            const ptStudents: Student[] = members
              .filter(
                (m: any) =>
                  m.subscriptions &&
                  m.subscriptions.some(
                    (s: any) =>
                      s.packageName?.toLowerCase().includes("pt") ||
                      s.packageName?.toLowerCase().includes("buổi"),
                  ),
              )
              .map((m: any, idx: number) => {
                const ptSub = m.subscriptions.find(
                  (s: any) =>
                    s.packageName?.toLowerCase().includes("pt") ||
                    s.packageName?.toLowerCase().includes("buổi"),
                );
                const totalSessions = ptSub?.packageName?.includes("20")
                  ? 20
                  : ptSub?.packageName?.includes("10")
                    ? 10
                    : 5;
                const usedSessions = Math.floor(
                  Math.random() * totalSessions * 0.6,
                );
                return {
                  id: m.id || idx + 1,
                  name: m.name || "Học viên",
                  avatar: m.gender === "female" ? "👩" : "👨",
                  email: m.email || "",
                  phone: m.phone || "",
                  packageName: ptSub?.packageName || "Gói PT",
                  sessionsTotal: totalSessions,
                  sessionsUsed: usedSessions,
                  sessionsLeft: totalSessions - usedSessions,
                  startDate: ptSub?.startDate
                    ? new Date(ptSub.startDate).toLocaleDateString("vi-VN")
                    : "",
                  endDate: ptSub?.endDate
                    ? new Date(ptSub.endDate).toLocaleDateString("vi-VN")
                    : "",
                  goal: "Tăng cơ",
                  status: "active",
                  progress: Math.round((usedSessions / totalSessions) * 100),
                };
              });

            if (ptStudents.length > 0) {
              setStudents(ptStudents);
              return;
            }
          }
        }
      } catch {
        /* ignore */
      }

      // Fallback to default mock data
      setStudents(DEFAULT_STUDENTS);
    };

    loadStudents();

    // Also try API
    const loadFromAPI = async () => {
      try {
        const res = await fetch("http://localhost:7000/trainer/Students");
        if (res.ok) {
          console.log("Trainer students API: connected");
        }
      } catch {
        /* Backend unavailable */
      }
    };
    loadFromAPI();

    // Listen for updates
    window.addEventListener("focus", loadStudents);
    window.addEventListener("gymDataUpdated", loadStudents);
    return () => {
      window.removeEventListener("focus", loadStudents);
      window.removeEventListener("gymDataUpdated", loadStudents);
    };
  }, []);

  const DEFAULT_STUDENTS: Student[] = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      avatar: "👨",
      email: "nguyenvana@email.com",
      phone: "0901234567",
      packageName: "PT 20 buổi",
      sessionsTotal: 20,
      sessionsUsed: 12,
      sessionsLeft: 8,
      startDate: "01/03/2026",
      endDate: "01/06/2026",
      goal: "Tăng cơ",
      status: "active",
      progress: 60,
    },
    {
      id: 2,
      name: "Trần Thị B",
      avatar: "👩",
      email: "tranthib@email.com",
      phone: "0912345678",
      packageName: "PT 30 buổi",
      sessionsTotal: 30,
      sessionsUsed: 18,
      sessionsLeft: 12,
      startDate: "15/02/2026",
      endDate: "15/05/2026",
      goal: "Giảm cân",
      status: "active",
      progress: 60,
    },
    {
      id: 3,
      name: "Lê Hoàng C",
      avatar: "👨",
      email: "lehoangc@email.com",
      phone: "0923456789",
      packageName: "PT 10 buổi",
      sessionsTotal: 10,
      sessionsUsed: 5,
      sessionsLeft: 5,
      startDate: "01/04/2026",
      endDate: "01/05/2026",
      goal: "Tăng sức bền",
      status: "active",
      progress: 50,
    },
    {
      id: 4,
      name: "Phạm Thị D",
      avatar: "👩",
      email: "phamthid@email.com",
      phone: "0934567890",
      packageName: "PT 20 buổi",
      sessionsTotal: 20,
      sessionsUsed: 15,
      sessionsLeft: 5,
      startDate: "10/03/2026",
      endDate: "10/06/2026",
      goal: "Tăng cơ",
      status: "active",
      progress: 75,
    },
    {
      id: 5,
      name: "Võ Minh E",
      avatar: "👨",
      email: "vominhe@email.com",
      phone: "0945678901",
      packageName: "PT 30 buổi",
      sessionsTotal: 30,
      sessionsUsed: 28,
      sessionsLeft: 2,
      startDate: "01/02/2026",
      endDate: "01/05/2026",
      goal: "Giảm mỡ",
      status: "expiring",
      progress: 93,
    },
  ];

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.phone.includes(searchQuery);
    const matchesStatus =
      filterStatus === "all" || student.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetail = (student: Student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { class: "active", text: "Đang tập" },
      expiring: { class: "expiring", text: "Sắp hết" },
      expired: { class: "expired", text: "Hết hạn" },
    };
    return badges[status as keyof typeof badges] || badges.active;
  };

  return (
    <div className="admin-layout">
      <TrainerSidebar />
      <div className="main-content">
        <TrainerHeader />
        <main className="content">
          <div className="trainer-students-page">
            {/* Stats Cards */} {/* Stats Cards */}
            <div className="students-stats">
              <div className="stat-card">
                <div className="stat-icon blue">
                  <i className="fas fa-users"></i>
                </div>
                <div className="stat-info">
                  <h3>{students.length}</h3>
                  <p>Tổng học viên</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon green">
                  <i className="fas fa-user-check"></i>
                </div>
                <div className="stat-info">
                  <h3>
                    {students.filter((s) => s.status === "active").length}
                  </h3>
                  <p>Đang tập</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon orange">
                  <i className="fas fa-dumbbell"></i>
                </div>
                <div className="stat-info">
                  <h3>
                    {students.reduce((sum, s) => sum + s.sessionsLeft, 0)}
                  </h3>
                  <p>Buổi còn lại</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon purple">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="stat-info">
                  <h3>
                    {Math.round(
                      students.reduce((sum, s) => sum + s.progress, 0) /
                        students.length,
                    )}
                    %
                  </h3>
                  <p>Tiến độ TB</p>
                </div>
              </div>
            </div>
            {/* Controls */}
            <div className="students-controls">
              <div className="search-box">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Tìm kiếm học viên..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="filter-buttons">
                <button
                  className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
                  onClick={() => setFilterStatus("all")}
                >
                  Tất cả
                </button>
                <button
                  className={`filter-btn ${filterStatus === "active" ? "active" : ""}`}
                  onClick={() => setFilterStatus("active")}
                >
                  Đang tập
                </button>
                <button
                  className={`filter-btn ${filterStatus === "expiring" ? "active" : ""}`}
                  onClick={() => setFilterStatus("expiring")}
                >
                  Sắp hết
                </button>
                <button
                  className={`filter-btn ${filterStatus === "expired" ? "active" : ""}`}
                  onClick={() => setFilterStatus("expired")}
                >
                  Hết hạn
                </button>
              </div>
            </div>
            {/* Students Grid */}
            <div className="students-grid">
              {filteredStudents.map((student) => {
                const statusBadge = getStatusBadge(student.status);
                return (
                  <div key={student.id} className="student-card">
                    <div className="student-card-header">
                      <div className="student-avatar-large">
                        {student.avatar}
                      </div>
                      <div className="student-basic-info">
                        <h3>{student.name}</h3>
                        <p className="student-goal">
                          <i className="fas fa-bullseye"></i> {student.goal}
                        </p>
                        <span className={`status-badge ${statusBadge.class}`}>
                          {statusBadge.text}
                        </span>
                      </div>
                    </div>

                    <div className="student-card-body">
                      <div className="info-section">
                        <h4>Thông tin liên hệ</h4>
                        <div className="info-item">
                          <i className="fas fa-envelope"></i>
                          <span>{student.email}</span>
                        </div>
                        <div className="info-item">
                          <i className="fas fa-phone"></i>
                          <span>{student.phone}</span>
                        </div>
                      </div>

                      <div className="info-section">
                        <h4>Gói tập</h4>
                        <div className="package-info">
                          <div className="package-name">
                            {student.packageName}
                          </div>
                          <div className="package-dates">
                            {student.startDate} - {student.endDate}
                          </div>
                        </div>
                      </div>

                      <div className="info-section">
                        <h4>Tiến độ</h4>
                        <div className="progress-info">
                          <div className="progress-stats">
                            <div className="progress-stat">
                              <span className="stat-value">
                                {student.sessionsUsed}
                              </span>
                              <span className="stat-label">Đã tập</span>
                            </div>
                            <div className="progress-stat">
                              <span className="stat-value">
                                {student.sessionsLeft}
                              </span>
                              <span className="stat-label">Còn lại</span>
                            </div>
                            <div className="progress-stat">
                              <span className="stat-value">
                                {student.sessionsTotal}
                              </span>
                              <span className="stat-label">Tổng</span>
                            </div>
                          </div>
                          <div className="progress-bar-container">
                            <div
                              className="progress-bar-fill"
                              style={{ width: `${student.progress}%` }}
                            >
                              <span className="progress-percentage">
                                {student.progress}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="student-card-footer">
                      <button
                        className="btn-action primary"
                        onClick={() => handleViewDetail(student)}
                      >
                        <i className="fas fa-eye"></i>
                        Chi tiết
                      </button>
                      <button className="btn-action secondary">
                        <i className="fas fa-calendar-plus"></i>
                        Đặt lịch
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {filteredStudents.length === 0 && (
              <div className="empty-state">
                <i className="fas fa-user-slash"></i>
                <h3>Không tìm thấy học viên</h3>
                <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedStudent && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="modal-content large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                <i className="fas fa-user"></i> Chi tiết học viên
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowDetailModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="student-detail-header">
                <div className="student-avatar-xl">
                  {selectedStudent.avatar}
                </div>
                <div className="student-detail-info">
                  <h2>{selectedStudent.name}</h2>
                  <p className="student-goal-large">
                    <i className="fas fa-bullseye"></i> Mục tiêu:{" "}
                    {selectedStudent.goal}
                  </p>
                  <span
                    className={`status-badge ${getStatusBadge(selectedStudent.status).class}`}
                  >
                    {getStatusBadge(selectedStudent.status).text}
                  </span>
                </div>
              </div>

              <div className="student-detail-grid">
                <div className="detail-section">
                  <h3>Thông tin cá nhân</h3>
                  <div className="detail-row">
                    <span className="label">Email:</span>
                    <span className="value">{selectedStudent.email}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Điện thoại:</span>
                    <span className="value">{selectedStudent.phone}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Gói tập</h3>
                  <div className="detail-row">
                    <span className="label">Gói:</span>
                    <span className="value">{selectedStudent.packageName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Ngày bắt đầu:</span>
                    <span className="value">{selectedStudent.startDate}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Ngày kết thúc:</span>
                    <span className="value">{selectedStudent.endDate}</span>
                  </div>
                </div>

                <div className="detail-section full-width">
                  <h3>Tiến độ tập luyện</h3>
                  <div className="progress-detail">
                    <div className="progress-numbers">
                      <div className="progress-number-item">
                        <div className="number">
                          {selectedStudent.sessionsUsed}
                        </div>
                        <div className="label">Buổi đã tập</div>
                      </div>
                      <div className="progress-number-item">
                        <div className="number">
                          {selectedStudent.sessionsLeft}
                        </div>
                        <div className="label">Buổi còn lại</div>
                      </div>
                      <div className="progress-number-item">
                        <div className="number">
                          {selectedStudent.sessionsTotal}
                        </div>
                        <div className="label">Tổng buổi</div>
                      </div>
                    </div>
                    <div className="progress-bar-large">
                      <div
                        className="progress-fill-large"
                        style={{ width: `${selectedStudent.progress}%` }}
                      >
                        <span>{selectedStudent.progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-modal cancel"
                onClick={() => setShowDetailModal(false)}
              >
                Đóng
              </button>
              <button className="btn-modal confirm">
                <i className="fas fa-calendar-plus"></i>
                Đặt lịch tập
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
