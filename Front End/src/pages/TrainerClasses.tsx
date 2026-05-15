import { useState, useEffect } from "react";
import TrainerSidebar from "../components/layout/TrainerSidebar";
import TrainerHeader from "../components/layout/TrainerHeader";
import "../styles.css";
import "./trainerClasses.css";

interface ClassItem {
  id: number;
  name: string;
  type: string;
  level: string;
  schedule: string;
  room: string;
  capacity: number;
  registered: number;
  duration: number;
  status: string;
}

export default function TrainerClasses() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    const loadFromAPI = async () => {
      try {
        const res = await fetch("http://localhost:7000/trainer/Schedule");
        if (res.ok) {
          console.log("TrainerClasses: API connected");
        }
      } catch {
        /* Backend unavailable */
      }
    };
    loadFromAPI();
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);

  const [classes] = useState<ClassItem[]>([
    {
      id: 1,
      name: "Yoga Buổi Sáng",
      type: "Yoga",
      level: "Beginner",
      schedule: "T2, T4, T6 - 07:00-08:00",
      room: "Phòng Yoga",
      capacity: 20,
      registered: 18,
      duration: 60,
      status: "active",
    },
    {
      id: 2,
      name: "HIIT Cardio",
      type: "Cardio",
      level: "Intermediate",
      schedule: "T3, T5, T7 - 09:00-10:00",
      room: "Phòng Group Class",
      capacity: 25,
      registered: 22,
      duration: 60,
      status: "active",
    },
    {
      id: 3,
      name: "Strength Training",
      type: "Strength",
      level: "Advanced",
      schedule: "T2, T4, T6 - 17:00-18:00",
      room: "Phòng Tạ",
      capacity: 20,
      registered: 15,
      duration: 60,
      status: "active",
    },
    {
      id: 4,
      name: "Spinning Class",
      type: "Cycling",
      level: "Intermediate",
      schedule: "T2, T3, T5 - 19:00-20:00",
      room: "Phòng Cardio",
      capacity: 25,
      registered: 20,
      duration: 60,
      status: "active",
    },
    {
      id: 5,
      name: "Pilates",
      type: "Pilates",
      level: "Beginner",
      schedule: "T4, T6 - 10:00-11:00",
      room: "Phòng Yoga",
      capacity: 15,
      registered: 12,
      duration: 60,
      status: "active",
    },
    {
      id: 6,
      name: "CrossFit",
      type: "CrossFit",
      level: "Advanced",
      schedule: "T3, T5 - 18:00-19:00",
      room: "Phòng Group Class",
      capacity: 20,
      registered: 18,
      duration: 60,
      status: "active",
    },
  ]);

  const filteredClasses = classes.filter((classItem) => {
    const matchesType = filterType === "all" || classItem.type === filterType;
    const matchesSearch =
      classItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleViewDetail = (classItem: ClassItem) => {
    setSelectedClass(classItem);
    setShowDetailModal(true);
  };

  const getOccupancyPercentage = (registered: number, capacity: number) => {
    return Math.round((registered / capacity) * 100);
  };

  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 90) return "high";
    if (percentage >= 70) return "medium";
    return "low";
  };

  return (
    <div className="admin-layout">
      <TrainerSidebar />
      <div className="main-content">
        <TrainerHeader />
        <main className="content">
          <div className="trainer-classes-page">
            {/* Stats Cards */}
            <div className="classes-stats">
              <div className="stat-card">
                <div className="stat-icon blue">
                  <i className="fas fa-chalkboard-teacher"></i>
                </div>
                <div className="stat-info">
                  <h3>{classes.length}</h3>
                  <p>Tổng số lớp</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon green">
                  <i className="fas fa-users"></i>
                </div>
                <div className="stat-info">
                  <h3>{classes.reduce((sum, c) => sum + c.registered, 0)}</h3>
                  <p>Tổng học viên</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon orange">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="stat-info">
                  <h3>
                    {classes.reduce((sum, c) => sum + c.duration, 0) / 60}h
                  </h3>
                  <p>Giờ dạy/tuần</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon purple">
                  <i className="fas fa-percentage"></i>
                </div>
                <div className="stat-info">
                  <h3>
                    {Math.round(
                      (classes.reduce((sum, c) => sum + c.registered, 0) /
                        classes.reduce((sum, c) => sum + c.capacity, 0)) *
                        100,
                    )}
                    %
                  </h3>
                  <p>Tỷ lệ lấp đầy</p>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="classes-controls">
              <div className="search-box">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Tìm kiếm lớp học..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="filter-buttons">
                <button
                  className={`filter-btn ${filterType === "all" ? "active" : ""}`}
                  onClick={() => setFilterType("all")}
                >
                  Tất cả
                </button>
                <button
                  className={`filter-btn ${filterType === "Yoga" ? "active" : ""}`}
                  onClick={() => setFilterType("Yoga")}
                >
                  Yoga
                </button>
                <button
                  className={`filter-btn ${filterType === "Cardio" ? "active" : ""}`}
                  onClick={() => setFilterType("Cardio")}
                >
                  Cardio
                </button>
                <button
                  className={`filter-btn ${filterType === "Strength" ? "active" : ""}`}
                  onClick={() => setFilterType("Strength")}
                >
                  Strength
                </button>
                <button
                  className={`filter-btn ${filterType === "CrossFit" ? "active" : ""}`}
                  onClick={() => setFilterType("CrossFit")}
                >
                  CrossFit
                </button>
              </div>

              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                  onClick={() => setViewMode("grid")}
                >
                  <i className="fas fa-th"></i>
                </button>
                <button
                  className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                  onClick={() => setViewMode("list")}
                >
                  <i className="fas fa-list"></i>
                </button>
              </div>
            </div>

            {/* Classes Grid/List */}
            <div className={`classes-container ${viewMode}`}>
              {filteredClasses.map((classItem) => {
                const occupancyPercentage = getOccupancyPercentage(
                  classItem.registered,
                  classItem.capacity,
                );
                const occupancyColor = getOccupancyColor(occupancyPercentage);

                return (
                  <div key={classItem.id} className="class-card">
                    <div className="class-card-header">
                      <div className="class-type-badge">{classItem.type}</div>
                      <div
                        className={`class-level ${classItem.level.toLowerCase()}`}
                      >
                        {classItem.level}
                      </div>
                    </div>

                    <div className="class-card-body">
                      <h3>{classItem.name}</h3>
                      <div className="class-info-grid">
                        <div className="info-row">
                          <i className="fas fa-calendar-alt"></i>
                          <span>{classItem.schedule}</span>
                        </div>
                        <div className="info-row">
                          <i className="fas fa-door-open"></i>
                          <span>{classItem.room}</span>
                        </div>
                        <div className="info-row">
                          <i className="fas fa-clock"></i>
                          <span>{classItem.duration} phút</span>
                        </div>
                      </div>

                      <div className="occupancy-info">
                        <div className="occupancy-header">
                          <span>Số lượng học viên</span>
                          <span
                            className={`occupancy-percentage ${occupancyColor}`}
                          >
                            {occupancyPercentage}%
                          </span>
                        </div>
                        <div className="occupancy-bar">
                          <div
                            className={`occupancy-fill ${occupancyColor}`}
                            style={{ width: `${occupancyPercentage}%` }}
                          ></div>
                        </div>
                        <div className="occupancy-numbers">
                          {classItem.registered}/{classItem.capacity} người
                        </div>
                      </div>
                    </div>

                    <div className="class-card-footer">
                      <button
                        className="btn-action primary"
                        onClick={() => handleViewDetail(classItem)}
                      >
                        <i className="fas fa-eye"></i>
                        Chi tiết
                      </button>
                      <button className="btn-action secondary">
                        <i className="fas fa-clipboard-check"></i>
                        Điểm danh
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredClasses.length === 0 && (
              <div className="empty-state">
                <i className="fas fa-search"></i>
                <h3>Không tìm thấy lớp học</h3>
                <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedClass && (
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
                <i className="fas fa-chalkboard-teacher"></i> Chi tiết lớp học
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowDetailModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="class-detail-grid">
                <div className="detail-section">
                  <h3>Thông tin cơ bản</h3>
                  <div className="detail-row">
                    <span className="label">Tên lớp:</span>
                    <span className="value">{selectedClass.name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Loại:</span>
                    <span className="value">{selectedClass.type}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Cấp độ:</span>
                    <span className="value">{selectedClass.level}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Lịch học:</span>
                    <span className="value">{selectedClass.schedule}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Phòng:</span>
                    <span className="value">{selectedClass.room}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Thời lượng:</span>
                    <span className="value">{selectedClass.duration} phút</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Học viên</h3>
                  <div className="students-summary">
                    <div className="summary-item">
                      <div className="summary-number">
                        {selectedClass.registered}
                      </div>
                      <div className="summary-label">Đã đăng ký</div>
                    </div>
                    <div className="summary-item">
                      <div className="summary-number">
                        {selectedClass.capacity - selectedClass.registered}
                      </div>
                      <div className="summary-label">Còn trống</div>
                    </div>
                    <div className="summary-item">
                      <div className="summary-number">
                        {selectedClass.capacity}
                      </div>
                      <div className="summary-label">Sức chứa</div>
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
                <i className="fas fa-clipboard-check"></i>
                Điểm danh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
