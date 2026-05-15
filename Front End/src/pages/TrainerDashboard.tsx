import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TrainerSidebar from "../components/layout/TrainerSidebar";
import TrainerHeader from "../components/layout/TrainerHeader";
import "../styles.css";
import "./trainerDashboard.css";

interface ClassToday {
  id: number;
  name: string;
  time: string;
  duration: number;
  registered: number;
  capacity: number;
  room: string;
}

interface PTSession {
  id: number;
  studentName: string;
  time: string;
  duration: number;
  type: string;
  status: string;
}

interface Student {
  id: number;
  name: string;
  avatar: string;
  sessionsLeft: number;
  nextSession: string;
}

export default function TrainerDashboard() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState("");
  const [trainerName, setTrainerName] = useState("Huấn luyện viên");

  const [stats] = useState({
    classesToday: 4,
    ptSessions: 6,
    totalStudents: 28,
  });

  const [classesToday] = useState<ClassToday[]>([
    {
      id: 1,
      name: "Yoga Buổi Sáng",
      time: "07:00 - 08:00",
      duration: 60,
      registered: 18,
      capacity: 20,
      room: "Phòng Yoga",
    },
    {
      id: 2,
      name: "HIIT Cardio",
      time: "09:00 - 10:00",
      duration: 60,
      registered: 22,
      capacity: 25,
      room: "Phòng Group Class",
    },
    {
      id: 3,
      name: "Strength Training",
      time: "17:00 - 18:00",
      duration: 60,
      registered: 15,
      capacity: 20,
      room: "Phòng Tạ",
    },
    {
      id: 4,
      name: "Spinning Class",
      time: "19:00 - 20:00",
      duration: 60,
      registered: 20,
      capacity: 25,
      room: "Phòng Cardio",
    },
  ]);

  const [ptSessions] = useState<PTSession[]>([
    {
      id: 1,
      studentName: "Nguyễn Văn A",
      time: "08:30",
      duration: 60,
      type: "Strength Training",
      status: "confirmed",
    },
    {
      id: 2,
      studentName: "Trần Thị B",
      time: "10:00",
      duration: 60,
      type: "Weight Loss",
      status: "confirmed",
    },
    {
      id: 3,
      studentName: "Lê Hoàng C",
      time: "14:00",
      duration: 60,
      type: "Muscle Building",
      status: "pending",
    },
  ]);

  const [activeStudents] = useState<Student[]>([
    {
      id: 1,
      name: "Nguyễn Văn A",
      avatar: "👨",
      sessionsLeft: 8,
      nextSession: "14/05/2026 - 08:30",
    },
    {
      id: 2,
      name: "Trần Thị B",
      avatar: "👩",
      sessionsLeft: 12,
      nextSession: "14/05/2026 - 10:00",
    },
    {
      id: 3,
      name: "Lê Hoàng C",
      avatar: "👨",
      sessionsLeft: 5,
      nextSession: "14/05/2026 - 14:00",
    },
    {
      id: 4,
      name: "Phạm Thị D",
      avatar: "👩",
      sessionsLeft: 15,
      nextSession: "15/05/2026 - 09:00",
    },
  ]);

  const [weeklySchedule] = useState([
    { day: "T2", classes: 3, pt: 4 },
    { day: "T3", classes: 4, pt: 5 },
    { day: "T4", classes: 3, pt: 6 },
    { day: "T5", classes: 4, pt: 4 },
    { day: "T6", classes: 3, pt: 5 },
    { day: "T7", classes: 2, pt: 3 },
    { day: "CN", classes: 2, pt: 2 },
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

    const storedName = localStorage.getItem("trainerName") || "Huấn luyện viên";
    setTrainerName(storedName);

    // Try loading from API
    const loadFromAPI = async () => {
      try {
        const res = await fetch("http://localhost:7000/trainer/Students");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setStats((prev) => ({ ...prev, totalStudents: data.length }));
          }
        }
      } catch {
        /* Backend unavailable */
      }
    };
    loadFromAPI();
  }, []);

  const getStatusClass = (status: string) => {
    return status === "confirmed" ? "confirmed" : "pending";
  };

  const getStatusText = (status: string) => {
    return status === "confirmed" ? "Đã xác nhận" : "Chờ xác nhận";
  };

  return (
    <div className="admin-layout">
      <TrainerSidebar />
      <div className="main-content">
        <TrainerHeader />
        <main className="content">
          <div className="trainer-dashboard-page">
            {/* Welcome Banner */}
            <div className="trainer-welcome-banner">
              <div className="welcome-content">
                <div className="greeting">
                  <h1>Chào {trainerName}! 💪</h1>
                  <p className="date-text">{currentDate}</p>
                </div>
                <p className="motivational-quote">
                  "Nhiệm vụ của bạn là truyền cảm hứng và giúp học viên đạt được
                  mục tiêu"
                </p>
              </div>
              <div className="quick-stats">
                <div className="quick-stat-item">
                  <div className="stat-number">{stats.classesToday}</div>
                  <div className="stat-label">Lớp hôm nay</div>
                </div>
                <div className="quick-stat-item">
                  <div className="stat-number">{stats.ptSessions}</div>
                  <div className="stat-label">Buổi PT</div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="trainer-stats-grid">
              <div className="trainer-stat-card blue">
                <div className="stat-icon">
                  <i className="fas fa-chalkboard-teacher"></i>
                </div>
                <div className="stat-info">
                  <h3>{stats.classesToday}</h3>
                  <p>Lớp học hôm nay</p>
                </div>
              </div>

              <div className="trainer-stat-card green">
                <div className="stat-icon">
                  <i className="fas fa-user-friends"></i>
                </div>
                <div className="stat-info">
                  <h3>{stats.ptSessions}</h3>
                  <p>Buổi PT hôm nay</p>
                </div>
              </div>

              <div className="trainer-stat-card orange">
                <div className="stat-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="stat-info">
                  <h3>{stats.totalStudents}</h3>
                  <p>Tổng học viên PT</p>
                </div>
              </div>
            </div>

            {/* Main Grid */}
            <div className="trainer-main-grid">
              {/* Left Column */}
              <div className="trainer-left-col">
                {/* Classes Today */}
                <div className="card">
                  <div className="card-header">
                    <h2>
                      <i className="fas fa-chalkboard-teacher"></i> Lớp học hôm
                      nay
                    </h2>
                    <a href="/trainer/classes" className="view-all-link">
                      Xem tất cả <i className="fas fa-arrow-right"></i>
                    </a>
                  </div>
                  <div className="card-body">
                    <div className="classes-today-list">
                      {classesToday.map((classItem) => (
                        <div key={classItem.id} className="class-today-item">
                          <div className="class-time-badge">
                            <i className="fas fa-clock"></i>
                            {classItem.time}
                          </div>
                          <div className="class-info">
                            <h4>{classItem.name}</h4>
                            <div className="class-details">
                              <span>
                                <i className="fas fa-door-open"></i>{" "}
                                {classItem.room}
                              </span>
                              <span>
                                <i className="fas fa-users"></i>{" "}
                                {classItem.registered}/{classItem.capacity}
                              </span>
                            </div>
                          </div>
                          <button className="btn-attendance">
                            <i className="fas fa-clipboard-check"></i>
                            Điểm danh
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Weekly Schedule Chart */}
                <div className="card">
                  <div className="card-header">
                    <h2>
                      <i className="fas fa-chart-bar"></i> Lịch dạy tuần này
                    </h2>
                  </div>
                  <div className="card-body">
                    <div className="weekly-schedule-chart">
                      {weeklySchedule.map((day, index) => (
                        <div key={index} className="schedule-day">
                          <div className="schedule-bars">
                            <div
                              className="schedule-bar classes"
                              style={{ height: `${day.classes * 20}px` }}
                              title={`${day.classes} lớp học`}
                            >
                              <span className="bar-value">{day.classes}</span>
                            </div>
                            <div
                              className="schedule-bar pt"
                              style={{ height: `${day.pt * 15}px` }}
                              title={`${day.pt} buổi PT`}
                            >
                              <span className="bar-value">{day.pt}</span>
                            </div>
                          </div>
                          <span className="day-label">{day.day}</span>
                        </div>
                      ))}
                    </div>
                    <div className="chart-legend">
                      <span className="legend-item">
                        <span className="legend-color classes"></span> Lớp học
                      </span>
                      <span className="legend-item">
                        <span className="legend-color pt"></span> PT
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="trainer-right-col">
                {/* PT Sessions Today */}
                <div className="card">
                  <div className="card-header">
                    <h2>
                      <i className="fas fa-dumbbell"></i> Buổi PT hôm nay
                    </h2>
                    <a href="/trainer/students" className="view-all-link">
                      Xem tất cả <i className="fas fa-arrow-right"></i>
                    </a>
                  </div>
                  <div className="card-body">
                    <div className="pt-sessions-list">
                      {ptSessions.map((session) => (
                        <div key={session.id} className="pt-session-item">
                          <div className="session-avatar">
                            <i className="fas fa-user-circle"></i>
                          </div>
                          <div className="session-info">
                            <h4>{session.studentName}</h4>
                            <p className="session-type">{session.type}</p>
                            <div className="session-meta">
                              <span>
                                <i className="fas fa-clock"></i> {session.time}
                              </span>
                              <span>
                                <i className="fas fa-hourglass-half"></i>{" "}
                                {session.duration} phút
                              </span>
                            </div>
                          </div>
                          <span
                            className={`session-status ${getStatusClass(session.status)}`}
                          >
                            {getStatusText(session.status)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Active Students */}
                <div className="card">
                  <div className="card-header">
                    <h2>
                      <i className="fas fa-users"></i> Học viên đang tập
                    </h2>
                    <a href="/trainer/students" className="view-all-link">
                      Xem tất cả <i className="fas fa-arrow-right"></i>
                    </a>
                  </div>
                  <div className="card-body">
                    <div className="active-students-list">
                      {activeStudents.map((student) => (
                        <div key={student.id} className="student-item">
                          <div className="student-avatar">{student.avatar}</div>
                          <div className="student-info">
                            <h4>{student.name}</h4>
                            <p className="sessions-left">
                              Còn {student.sessionsLeft} buổi
                            </p>
                            <p className="next-session">
                              <i className="fas fa-calendar"></i>{" "}
                              {student.nextSession}
                            </p>
                          </div>
                          <button className="btn-view-profile">
                            <i className="fas fa-eye"></i>
                          </button>
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
    </div>
  );
}
