import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MemberSidebar from "../components/layout/MemberSidebar";
import MemberHeader from "../components/layout/MemberHeader";
import "../styles.css";
import "./memberDashboard.css";

interface MembershipInfo {
  packageName: string;
  startDate: string;
  endDate: string;
  daysLeft: number;
  status: "active" | "expiring" | "expired";
}

interface CheckInRecord {
  id: number;
  date: string;
  time: string;
  type: "in" | "out";
}

interface WorkoutSession {
  id: number;
  date: string;
  exercises: string;
  duration: number;
  calories: number;
}

interface UpcomingClass {
  id: number;
  name: string;
  trainer: string;
  time: string;
  date: string;
  duration: number;
  participants: number;
  maxParticipants: number;
}

interface Achievement {
  id: number;
  title: string;
  icon: string;
  date: string;
  description: string;
}

export default function MemberDashboard() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState("");
  const [memberName, setMemberName] = useState("Hội viên");
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<UpcomingClass | null>(
    null,
  );
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  const [registeredClasses, setRegisteredClasses] = useState<number[]>([]);

  const [membership, setMembership] = useState<MembershipInfo>({
    packageName: "Gói 3 tháng",
    startDate: "01/01/2026",
    endDate: "01/04/2026",
    daysLeft: 48,
    status: "active",
  });

  const [recentCheckIns] = useState<CheckInRecord[]>([
    { id: 1, date: "13/05/2026", time: "06:30", type: "in" },
    { id: 2, date: "13/05/2026", time: "08:15", type: "out" },
    { id: 3, date: "12/05/2026", time: "17:00", type: "in" },
    { id: 4, date: "12/05/2026", time: "18:45", type: "out" },
    { id: 5, date: "11/05/2026", time: "06:45", type: "in" },
  ]);

  const [workoutSessions] = useState<WorkoutSession[]>([
    {
      id: 1,
      date: "13/05/2026",
      exercises: "Chest & Triceps",
      duration: 75,
      calories: 420,
    },
    {
      id: 2,
      date: "12/05/2026",
      exercises: "Back & Biceps",
      duration: 80,
      calories: 450,
    },
    {
      id: 3,
      date: "11/05/2026",
      exercises: "Legs & Shoulders",
      duration: 90,
      calories: 520,
    },
  ]);

  const [upcomingClasses] = useState<UpcomingClass[]>([
    {
      id: 1,
      name: "Yoga Buổi Sáng",
      trainer: "Nguyễn Thị Lan",
      time: "07:00",
      date: "15/05/2026",
      duration: 60,
      participants: 12,
      maxParticipants: 15,
    },
    {
      id: 2,
      name: "HIIT Cardio",
      trainer: "Trần Văn Nam",
      time: "18:30",
      date: "15/05/2026",
      duration: 45,
      participants: 18,
      maxParticipants: 20,
    },
    {
      id: 3,
      name: "Spinning Class",
      trainer: "Lê Minh Tuấn",
      time: "19:30",
      date: "16/05/2026",
      duration: 50,
      participants: 8,
      maxParticipants: 12,
    },
  ]);

  const [achievements] = useState<Achievement[]>([
    {
      id: 1,
      title: "Streak 7 ngày",
      icon: "fa-fire",
      date: "13/05/2026",
      description: "Check-in liên tục 7 ngày",
    },
    {
      id: 2,
      title: "Đốt cháy 10,000 cal",
      icon: "fa-trophy",
      date: "10/05/2026",
      description: "Hoàn thành mục tiêu tháng",
    },
    {
      id: 3,
      title: "Người mới xuất sắc",
      icon: "fa-star",
      date: "05/05/2026",
      description: "Hoàn thành 10 buổi tập đầu tiên",
    },
  ]);

  const [weeklyProgress] = useState([
    { day: "T2", value: 85 },
    { day: "T3", value: 90 },
    { day: "T4", value: 75 },
    { day: "T5", value: 95 },
    { day: "T6", value: 80 },
    { day: "T7", value: 70 },
    { day: "CN", value: 60 },
  ]);

  useEffect(() => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setCurrentDate(date.toLocaleDateString("vi-VN", options));

    // Get member name from localStorage
    const storedName = localStorage.getItem("memberName") || "Hội viên";
    setMemberName(storedName);

    // Try loading membership from API
    const loadFromAPI = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (
          token &&
          !token.startsWith("demo-") &&
          !token.startsWith("local-")
        ) {
          const res = await fetch(
            "http://localhost:7000/user/Memberships/active",
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if (res.ok) {
            const data = await res.json();
            if (data) {
              setMembership({
                packageName: data.tenGoiTap || "Gói tập",
                startDate: data.ngayBatDau
                  ? new Date(data.ngayBatDau).toLocaleDateString("vi-VN")
                  : "",
                endDate: data.ngayKetThuc
                  ? new Date(data.ngayKetThuc).toLocaleDateString("vi-VN")
                  : "",
                daysRemaining: Math.max(
                  0,
                  Math.ceil(
                    (new Date(data.ngayKetThuc).getTime() - Date.now()) /
                      86400000,
                  ),
                ),
                status:
                  new Date(data.ngayKetThuc) > new Date()
                    ? "active"
                    : "expired",
              });
            }
          }
        }
      } catch {
        /* Backend unavailable */
      }
    };
    loadFromAPI();
  }, []);

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { class: "active", text: "Còn hạn" },
      expiring: { class: "expiring", text: "Sắp hết hạn" },
      expired: { class: "expired", text: "Hết hạn" },
    };
    return badges[status as keyof typeof badges] || badges.active;
  };

  const statusBadge = getStatusBadge(membership.status);

  // Handle Quick Check-in
  const handleQuickCheckIn = () => {
    setShowCheckInModal(true);
  };

  const confirmCheckIn = () => {
    setCheckInSuccess(true);
    setTimeout(() => {
      setShowCheckInModal(false);
      setCheckInSuccess(false);
      // Reload page to show new check-in
      window.location.reload();
    }, 2000);
  };

  // Handle Class Registration
  const handleRegisterClass = (classItem: UpcomingClass) => {
    setSelectedClass(classItem);
    setShowClassModal(true);
  };

  const confirmClassRegistration = () => {
    if (selectedClass) {
      setRegisteredClasses([...registeredClasses, selectedClass.id]);
      setShowClassModal(false);
      setSelectedClass(null);
      alert(`Đã đăng ký thành công lớp "${selectedClass.name}"!`);
    }
  };

  // Handle Navigation
  const handleNavigateToSchedule = () => {
    navigate("/member/schedule");
  };

  const handleNavigateToWorkouts = () => {
    navigate("/member/workouts");
  };

  const handleNavigateToMembership = () => {
    navigate("/member/membership");
  };

  const handleRenewMembership = () => {
    navigate("/member/membership");
  };

  const handleChangeMembership = () => {
    navigate("/member/membership");
  };

  return (
    <div className="admin-layout">
      <MemberSidebar />
      <div className="main-content">
        <MemberHeader />
        <main className="content">
          <div className="dashboard-page">
            {/* Welcome Banner */}
            <div className="welcome-banner-improved">
              <div className="welcome-content">
                <div className="greeting">
                  <h1>Chào {memberName}! 👋</h1>
                  <p className="date-text">{currentDate}</p>
                </div>
                <p className="motivational-quote">
                  "Thành công là tổng của những nỗ lực nhỏ lặp đi lặp lại mỗi
                  ngày"
                </p>
              </div>
              <div className="quick-actions">
                <button
                  className="quick-action-btn primary"
                  onClick={handleQuickCheckIn}
                >
                  <i className="fas fa-qrcode"></i>
                  <span>Check-in</span>
                </button>
                <button
                  className="quick-action-btn secondary"
                  onClick={handleNavigateToSchedule}
                >
                  <i className="fas fa-calendar-plus"></i>
                  <span>Đặt lịch</span>
                </button>
                <button
                  className="quick-action-btn tertiary"
                  onClick={handleNavigateToWorkouts}
                >
                  <i className="fas fa-dumbbell"></i>
                  <span>Bài tập</span>
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid-improved">
              <div className="stat-card-improved blue">
                <div className="stat-header">
                  <div className="stat-icon">
                    <i className="fas fa-calendar-check"></i>
                  </div>
                  <div className="stat-trend up">
                    <i className="fas fa-arrow-up"></i> 15%
                  </div>
                </div>
                <div className="stat-body">
                  <h3>18</h3>
                  <p>Check-in tháng này</p>
                  <div className="stat-progress">
                    <div
                      className="progress-bar"
                      style={{ width: "72%" }}
                    ></div>
                  </div>
                  <span className="stat-subtitle">Mục tiêu: 25 lần</span>
                </div>
              </div>

              <div className="stat-card-improved green">
                <div className="stat-header">
                  <div className="stat-icon">
                    <i className="fas fa-fire"></i>
                  </div>
                  <div className="stat-trend up">
                    <i className="fas fa-arrow-up"></i> 22%
                  </div>
                </div>
                <div className="stat-body">
                  <h3>8,450</h3>
                  <p>Calories đốt cháy</p>
                  <div className="stat-progress">
                    <div
                      className="progress-bar"
                      style={{ width: "84%" }}
                    ></div>
                  </div>
                  <span className="stat-subtitle">Mục tiêu: 10,000 cal</span>
                </div>
              </div>

              <div className="stat-card-improved orange">
                <div className="stat-header">
                  <div className="stat-icon">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="stat-trend up">
                    <i className="fas fa-arrow-up"></i> 10%
                  </div>
                </div>
                <div className="stat-body">
                  <h3>24.5h</h3>
                  <p>Thời gian tập</p>
                  <div className="stat-progress">
                    <div
                      className="progress-bar"
                      style={{ width: "61%" }}
                    ></div>
                  </div>
                  <span className="stat-subtitle">Mục tiêu: 40 giờ</span>
                </div>
              </div>

              <div className="stat-card-improved purple">
                <div className="stat-header">
                  <div className="stat-icon">
                    <i className="fas fa-trophy"></i>
                  </div>
                  <div className="stat-trend up">
                    <i className="fas fa-arrow-up"></i> 80%
                  </div>
                </div>
                <div className="stat-body">
                  <h3>12/15</h3>
                  <p>Mục tiêu hoàn thành</p>
                  <div className="stat-progress">
                    <div
                      className="progress-bar"
                      style={{ width: "80%" }}
                    ></div>
                  </div>
                  <span className="stat-subtitle">Còn 3 mục tiêu</span>
                </div>
              </div>
            </div>

            {/* Main Grid */}
            <div className="dashboard-grid">
              {/* Left Column */}
              <div className="dashboard-left">
                {/* Membership Card */}
                <div className="card membership-card-improved">
                  <div className="membership-gradient">
                    <div className="membership-header-improved">
                      <div>
                        <h3>{membership.packageName}</h3>
                        <span className={`status-badge ${statusBadge.class}`}>
                          {statusBadge.text}
                        </span>
                      </div>
                      <div className="membership-icon">
                        <i className="fas fa-id-card"></i>
                      </div>
                    </div>
                    <div className="membership-dates">
                      <div className="date-item">
                        <span className="date-label">Ngày bắt đầu</span>
                        <span className="date-value">
                          {membership.startDate}
                        </span>
                      </div>
                      <div className="date-item">
                        <span className="date-label">Ngày hết hạn</span>
                        <span className="date-value">{membership.endDate}</span>
                      </div>
                    </div>
                    <div className="days-left">
                      <div className="days-circle">
                        <span className="days-number">
                          {membership.daysLeft}
                        </span>
                        <span className="days-text">ngày</span>
                      </div>
                      <span className="days-label">Còn lại</span>
                    </div>
                  </div>
                  <div className="membership-actions-improved">
                    <button
                      className="btn-membership primary"
                      onClick={handleRenewMembership}
                    >
                      <i className="fas fa-sync"></i> Gia hạn ngay
                    </button>
                    <button
                      className="btn-membership secondary"
                      onClick={handleChangeMembership}
                    >
                      <i className="fas fa-exchange-alt"></i> Đổi gói
                    </button>
                  </div>
                </div>

                {/* Weekly Progress Chart */}
                <div className="card">
                  <div className="card-header">
                    <h2>
                      <i className="fas fa-chart-line"></i> Tiến độ tuần này
                    </h2>
                  </div>
                  <div className="card-body">
                    <div className="weekly-chart">
                      {weeklyProgress.map((day, index) => (
                        <div key={index} className="chart-bar">
                          <div className="bar-container">
                            <div
                              className="bar-fill"
                              style={{ height: `${day.value}%` }}
                            >
                              <span className="bar-value">{day.value}%</span>
                            </div>
                          </div>
                          <span className="bar-label">{day.day}</span>
                        </div>
                      ))}
                    </div>
                    <div className="chart-legend">
                      <span>
                        <i className="fas fa-circle"></i> Hoàn thành mục tiêu
                        hàng ngày
                      </span>
                    </div>
                  </div>
                </div>

                {/* Achievements */}
                <div className="card">
                  <div className="card-header">
                    <h2>
                      <i className="fas fa-medal"></i> Thành tích gần đây
                    </h2>
                  </div>
                  <div className="card-body">
                    <div className="achievements-list">
                      {achievements.map((achievement) => (
                        <div key={achievement.id} className="achievement-item">
                          <div className="achievement-icon">
                            <i className={`fas ${achievement.icon}`}></i>
                          </div>
                          <div className="achievement-info">
                            <h4>{achievement.title}</h4>
                            <p>{achievement.description}</p>
                            <span className="achievement-date">
                              <i className="fas fa-calendar"></i>{" "}
                              {achievement.date}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="dashboard-right">
                {/* Upcoming Classes */}
                <div className="card">
                  <div className="card-header">
                    <h2>
                      <i className="fas fa-calendar-alt"></i> Lớp học sắp tới
                    </h2>
                    <a href="/member/schedule" className="view-all-link">
                      Xem tất cả <i className="fas fa-arrow-right"></i>
                    </a>
                  </div>
                  <div className="card-body">
                    <div className="classes-list">
                      {upcomingClasses.map((classItem) => (
                        <div key={classItem.id} className="class-item">
                          <div className="class-time">
                            <div className="time-badge">
                              <i className="fas fa-clock"></i>
                              {classItem.time}
                            </div>
                            <span className="class-date">{classItem.date}</span>
                          </div>
                          <div className="class-details">
                            <h4>{classItem.name}</h4>
                            <p>
                              <i className="fas fa-user"></i>{" "}
                              {classItem.trainer}
                            </p>
                            <div className="class-meta">
                              <span>
                                <i className="fas fa-hourglass-half"></i>{" "}
                                {classItem.duration} phút
                              </span>
                              <span>
                                <i className="fas fa-users"></i>{" "}
                                {classItem.participants}/
                                {classItem.maxParticipants}
                              </span>
                            </div>
                          </div>
                          <button
                            className={`btn-register ${registeredClasses.includes(classItem.id) ? "registered" : ""}`}
                            onClick={() => handleRegisterClass(classItem)}
                            disabled={registeredClasses.includes(classItem.id)}
                          >
                            <i
                              className={`fas fa-${registeredClasses.includes(classItem.id) ? "check" : "plus"}`}
                            ></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Check-ins */}
                <div className="card">
                  <div className="card-header">
                    <h2>
                      <i className="fas fa-history"></i> Check-in gần đây
                    </h2>
                    <a href="/member/checkin-history" className="view-all-link">
                      Xem tất cả <i className="fas fa-arrow-right"></i>
                    </a>
                  </div>
                  <div className="card-body">
                    <div className="checkin-list">
                      {recentCheckIns.map((record) => (
                        <div key={record.id} className="checkin-item">
                          <div
                            className={`checkin-icon ${record.type === "in" ? "in" : "out"}`}
                          >
                            <i
                              className={`fas fa-${record.type === "in" ? "sign-in-alt" : "sign-out-alt"}`}
                            ></i>
                          </div>
                          <div className="checkin-info">
                            <div className="checkin-type">
                              {record.type === "in" ? "Check-in" : "Check-out"}
                            </div>
                            <div className="checkin-time">
                              {record.date} - {record.time}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Workout Sessions */}
                <div className="card">
                  <div className="card-header">
                    <h2>
                      <i className="fas fa-dumbbell"></i> Buổi tập gần đây
                    </h2>
                    <a href="/member/workouts" className="view-all-link">
                      Xem tất cả <i className="fas fa-arrow-right"></i>
                    </a>
                  </div>
                  <div className="card-body">
                    <div className="workout-list">
                      {workoutSessions.map((session) => (
                        <div key={session.id} className="workout-item">
                          <div className="workout-date">
                            <i className="fas fa-calendar"></i>
                            {session.date}
                          </div>
                          <div className="workout-details">
                            <h4>{session.exercises}</h4>
                            <div className="workout-stats">
                              <span>
                                <i className="fas fa-clock"></i>{" "}
                                {session.duration} phút
                              </span>
                              <span>
                                <i className="fas fa-fire"></i>{" "}
                                {session.calories} cal
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Check-in Modal */}
      {showCheckInModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCheckInModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {!checkInSuccess ? (
              <>
                <div className="modal-header">
                  <h2>
                    <i className="fas fa-qrcode"></i> Check-in nhanh
                  </h2>
                  <button
                    className="modal-close"
                    onClick={() => setShowCheckInModal(false)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="modal-body">
                  <div className="checkin-qr">
                    <div className="qr-placeholder">
                      <i className="fas fa-qrcode"></i>
                      <p>Quét mã QR tại cổng</p>
                    </div>
                  </div>
                  <div className="checkin-info-modal">
                    <p>
                      <strong>Thời gian:</strong>{" "}
                      {new Date().toLocaleTimeString("vi-VN")}
                    </p>
                    <p>
                      <strong>Ngày:</strong>{" "}
                      {new Date().toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn-modal cancel"
                    onClick={() => setShowCheckInModal(false)}
                  >
                    Hủy
                  </button>
                  <button
                    className="btn-modal confirm"
                    onClick={confirmCheckIn}
                  >
                    <i className="fas fa-check"></i> Xác nhận Check-in
                  </button>
                </div>
              </>
            ) : (
              <div className="success-message">
                <div className="success-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h2>Check-in thành công!</h2>
                <p>Chúc bạn có buổi tập luyện hiệu quả</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Class Registration Modal */}
      {showClassModal && selectedClass && (
        <div className="modal-overlay" onClick={() => setShowClassModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className="fas fa-calendar-plus"></i> Đăng ký lớp học
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowClassModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="class-detail-modal">
                <h3>{selectedClass.name}</h3>
                <div className="class-info-grid">
                  <div className="info-item">
                    <i className="fas fa-user"></i>
                    <div>
                      <span className="info-label">Huấn luyện viên</span>
                      <span className="info-value">
                        {selectedClass.trainer}
                      </span>
                    </div>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-clock"></i>
                    <div>
                      <span className="info-label">Thời gian</span>
                      <span className="info-value">
                        {selectedClass.time} - {selectedClass.date}
                      </span>
                    </div>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-hourglass-half"></i>
                    <div>
                      <span className="info-label">Thời lượng</span>
                      <span className="info-value">
                        {selectedClass.duration} phút
                      </span>
                    </div>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-users"></i>
                    <div>
                      <span className="info-label">Số lượng</span>
                      <span className="info-value">
                        {selectedClass.participants}/
                        {selectedClass.maxParticipants} người
                      </span>
                    </div>
                  </div>
                </div>
                <div className="class-note">
                  <i className="fas fa-info-circle"></i>
                  <p>
                    Vui lòng đến trước 10 phút để chuẩn bị. Bạn có thể hủy đăng
                    ký trước 2 giờ.
                  </p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-modal cancel"
                onClick={() => setShowClassModal(false)}
              >
                Hủy
              </button>
              <button
                className="btn-modal confirm"
                onClick={confirmClassRegistration}
              >
                <i className="fas fa-check"></i> Xác nhận đăng ký
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
