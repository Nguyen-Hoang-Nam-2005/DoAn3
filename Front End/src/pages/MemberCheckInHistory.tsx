import { useState, useEffect } from "react";
import MemberSidebar from "../components/layout/MemberSidebar";
import MemberHeader from "../components/layout/MemberHeader";
import "../styles.css";
import "./memberCheckInHistory.css";

interface CheckInRecord {
  id: number;
  date: string;
  checkInTime: string;
  checkOutTime: string | null;
  duration: number | null;
  calories: number;
  notes: string;
}

const CHECKINS_KEY = "gymMemberCheckins";

const DEFAULT_CHECKINS: CheckInRecord[] = [
  {
    id: 1,
    date: "2026-05-14",
    checkInTime: "06:30",
    checkOutTime: "08:00",
    duration: 90,
    calories: 450,
    notes: "Tập cardio và yoga",
  },
  {
    id: 2,
    date: "2026-05-12",
    checkInTime: "18:00",
    checkOutTime: "19:15",
    duration: 75,
    calories: 380,
    notes: "Tập tạ và strength training",
  },
  {
    id: 3,
    date: "2026-05-10",
    checkInTime: "06:30",
    checkOutTime: "07:55",
    duration: 85,
    calories: 420,
    notes: "Yoga và stretching",
  },
  {
    id: 4,
    date: "2026-05-08",
    checkInTime: "19:00",
    checkOutTime: "20:00",
    duration: 60,
    calories: 300,
    notes: "CrossFit",
  },
  {
    id: 5,
    date: "2026-05-06",
    checkInTime: "06:30",
    checkOutTime: "08:00",
    duration: 90,
    calories: 450,
    notes: "Cardio kickboxing",
  },
  {
    id: 6,
    date: "2026-05-04",
    checkInTime: "17:30",
    checkOutTime: "18:45",
    duration: 75,
    calories: 370,
    notes: "Spinning class",
  },
  {
    id: 7,
    date: "2026-05-02",
    checkInTime: "06:30",
    checkOutTime: "07:50",
    duration: 80,
    calories: 400,
    notes: "Morning workout",
  },
  {
    id: 8,
    date: "2026-04-30",
    checkInTime: "18:30",
    checkOutTime: "19:45",
    duration: 75,
    calories: 380,
    notes: "HIIT training",
  },
  {
    id: 9,
    date: "2026-04-28",
    checkInTime: "06:30",
    checkOutTime: "08:00",
    duration: 90,
    calories: 450,
    notes: "Full body workout",
  },
  {
    id: 10,
    date: "2026-04-26",
    checkInTime: "19:00",
    checkOutTime: "20:15",
    duration: 75,
    calories: 390,
    notes: "Strength training",
  },
];

export default function MemberCheckInHistory() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [checkinHistory, setCheckinHistory] = useState<CheckInRecord[]>([]);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [currentCheckinId, setCurrentCheckinId] = useState<number | null>(null);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  // Load check-in history
  useEffect(() => {
    const loadFromAPI = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (
          token &&
          !token.startsWith("demo-") &&
          !token.startsWith("local-")
        ) {
          const res = await fetch(
            "http://localhost:7000/user/Activity/checkins",
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              const mapped: CheckInRecord[] = data.map((c: any) => ({
                id: c.maDiemDanh,
                date: new Date(c.thoiGianVao).toISOString().split("T")[0],
                checkInTime: new Date(c.thoiGianVao).toLocaleTimeString(
                  "vi-VN",
                  { hour: "2-digit", minute: "2-digit" },
                ),
                checkOutTime: c.thoiGianRa
                  ? new Date(c.thoiGianRa).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : null,
                duration: c.thoiGianRa
                  ? Math.round(
                      (new Date(c.thoiGianRa).getTime() -
                        new Date(c.thoiGianVao).getTime()) /
                        60000,
                    )
                  : null,
                calories: c.thoiGianRa
                  ? Math.round(
                      ((new Date(c.thoiGianRa).getTime() -
                        new Date(c.thoiGianVao).getTime()) /
                        60000) *
                        5.5,
                    )
                  : 0,
                notes: c.ghiChu || "",
              }));
              setCheckinHistory(mapped);
              return;
            }
          }
        }
      } catch {
        /* Backend unavailable */
      }

      // Fallback to localStorage
      const userId = Number(localStorage.getItem("userId") || "1");
      try {
        const raw = localStorage.getItem(CHECKINS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const userCheckins = parsed.filter(
              (c: any) => c.memberId === userId || !c.memberId,
            );
            setCheckinHistory(userCheckins);
            const today = new Date().toISOString().split("T")[0];
            const activeCheckin = userCheckins.find(
              (c: any) => c.date === today && !c.checkOutTime,
            );
            if (activeCheckin) {
              setIsCheckedIn(true);
              setCurrentCheckinId(activeCheckin.id);
            }
            return;
          }
        }
      } catch {
        /* ignore */
      }
      setCheckinHistory(DEFAULT_CHECKINS);
      localStorage.setItem(CHECKINS_KEY, JSON.stringify(DEFAULT_CHECKINS));
    };
    loadFromAPI();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const handleCheckIn = () => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const userId = Number(localStorage.getItem("userId") || "1");

    const newRecord: CheckInRecord = {
      id: Date.now(),
      date: today,
      checkInTime: time,
      checkOutTime: null,
      duration: null,
      calories: 0,
      notes: "",
    };

    const updated = [newRecord, ...checkinHistory];
    setCheckinHistory(updated);
    setIsCheckedIn(true);
    setCurrentCheckinId(newRecord.id);

    // Save with memberId
    const allCheckins = (() => {
      try {
        const raw = localStorage.getItem(CHECKINS_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    })();
    localStorage.setItem(
      CHECKINS_KEY,
      JSON.stringify([{ ...newRecord, memberId: userId }, ...allCheckins]),
    );

    // Also call API
    try {
      const token = localStorage.getItem("authToken");
      if (token && !token.startsWith("demo-") && !token.startsWith("local-")) {
        fetch("http://localhost:7000/user/Activity/checkin", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      /* ignore */
    }

    setToast({ msg: `Check-in thành công lúc ${time}! 💪`, type: "success" });
  };

  const handleCheckOut = () => {
    if (!currentCheckinId) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const updated = checkinHistory.map((c) => {
      if (c.id === currentCheckinId) {
        const checkinDate = new Date(`${c.date}T${c.checkInTime}`);
        const duration = Math.round(
          (now.getTime() - checkinDate.getTime()) / 60000,
        );
        const calories = Math.round(duration * 5.5);
        return { ...c, checkOutTime: time, duration, calories };
      }
      return c;
    });

    setCheckinHistory(updated);
    setIsCheckedIn(false);
    setCurrentCheckinId(null);

    // Update localStorage
    const allCheckins = (() => {
      try {
        const raw = localStorage.getItem(CHECKINS_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    })();
    const updatedAll = allCheckins.map((c: any) => {
      if (c.id === currentCheckinId) {
        const checkinDate = new Date(`${c.date}T${c.checkInTime}`);
        const duration = Math.round(
          (now.getTime() - checkinDate.getTime()) / 60000,
        );
        const calories = Math.round(duration * 5.5);
        return { ...c, checkOutTime: time, duration, calories };
      }
      return c;
    });
    localStorage.setItem(CHECKINS_KEY, JSON.stringify(updatedAll));

    // Also call API
    try {
      const token = localStorage.getItem("authToken");
      if (token && !token.startsWith("demo-") && !token.startsWith("local-")) {
        fetch("http://localhost:7000/user/Activity/checkout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      /* ignore */
    }

    setToast({ msg: `Check-out thành công lúc ${time}! 🎉`, type: "success" });
  };

  // Tính toán thống kê
  const totalSessions = checkinHistory.length;
  const totalMinutes = checkinHistory.reduce(
    (sum, record) => sum + (record.duration || 0),
    0,
  );
  const totalCalories = checkinHistory.reduce(
    (sum, record) => sum + record.calories,
    0,
  );
  const avgDuration =
    totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

  // Lọc theo tháng/năm
  const filteredHistory = checkinHistory.filter((record) => {
    const recordDate = new Date(record.date);
    return (
      recordDate.getMonth() === selectedMonth &&
      recordDate.getFullYear() === selectedYear
    );
  });

  // Nhóm theo tuần
  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const groupedByWeek = filteredHistory.reduce(
    (acc, record) => {
      const date = new Date(record.date);
      const week = getWeekNumber(date);
      if (!acc[week]) acc[week] = [];
      acc[week].push(record);
      return acc;
    },
    {} as Record<number, CheckInRecord[]>,
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      full: date.toLocaleDateString("vi-VN"),
    };
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}p`;
    }
    return `${mins} phút`;
  };

  const months = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  const years = [2024, 2025, 2026];

  return (
    <div className="admin-layout">
      <MemberSidebar />
      <div className="main-content">
        <MemberHeader />
        <main className="content">
          <div className="checkin-history-page">
            {/* Page Header */}
            <div className="page-header">
              <div className="page-title">
                <h1>
                  <i className="fas fa-history"></i> Lịch sử check-in
                </h1>
                <p>Xem lại lịch sử tập luyện và thống kê của bạn</p>
              </div>
              <div className="page-actions">
                <div className="view-mode-toggle">
                  <button
                    className={`btn ${viewMode === "list" ? "btn-primary" : "btn-outline"}`}
                    onClick={() => setViewMode("list")}
                  >
                    <i className="fas fa-list"></i> Danh sách
                  </button>
                  <button
                    className={`btn ${viewMode === "calendar" ? "btn-primary" : "btn-outline"}`}
                    onClick={() => setViewMode("calendar")}
                  >
                    <i className="fas fa-calendar"></i> Lịch
                  </button>
                </div>
                {isCheckedIn ? (
                  <button
                    className="btn btn-danger"
                    onClick={handleCheckOut}
                    style={{ background: "#ef4444" }}
                  >
                    <i className="fas fa-sign-out-alt"></i> Check-out
                  </button>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={handleCheckIn}
                    style={{ background: "#10b981", borderColor: "#10b981" }}
                  >
                    <i className="fas fa-sign-in-alt"></i> Check-in ngay
                  </button>
                )}
              </div>
            </div>

            {/* Toast */}
            {toast && (
              <div
                style={{
                  position: "fixed",
                  top: "1.5rem",
                  right: "1.5rem",
                  zIndex: 9999,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "1rem 1.5rem",
                  borderRadius: "12px",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  background: toast.type === "success" ? "#10b981" : "#ef4444",
                  color: "white",
                  animation: "slideInRight 0.3s ease",
                }}
              >
                <i
                  className={`fas fa-${toast.type === "success" ? "check-circle" : "exclamation-circle"}`}
                ></i>
                {toast.msg}
              </div>
            )}

            {/* Active Check-in Banner */}
            {isCheckedIn && (
              <div
                style={{
                  marginBottom: "1.5rem",
                  padding: "1rem 1.5rem",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  borderRadius: "12px",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      background: "#fff",
                      animation: "pulse 2s infinite",
                    }}
                  ></div>
                  <span style={{ fontWeight: 600 }}>
                    Bạn đang check-in tại phòng tập
                  </span>
                </div>
                <button
                  onClick={handleCheckOut}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "rgba(255,255,255,0.2)",
                    border: "1px solid rgba(255,255,255,0.4)",
                    borderRadius: "8px",
                    color: "white",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: "0.8125rem",
                  }}
                >
                  <i className="fas fa-sign-out-alt"></i> Check-out
                </button>
              </div>
            )}

            {/* Statistics Cards */}
            <div className="stats-grid">
              <div className="stat-card blue">
                <div className="stat-icon">
                  <i className="fas fa-calendar-check"></i>
                </div>
                <div className="stat-info">
                  <h3>{totalSessions}</h3>
                  <p>Tổng buổi tập</p>
                  <span className="stat-trend positive">
                    <i className="fas fa-arrow-up"></i> +12% so với tháng trước
                  </span>
                </div>
              </div>

              <div className="stat-card green">
                <div className="stat-icon">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="stat-info">
                  <h3>
                    {Math.round(totalMinutes / 60)}h {totalMinutes % 60}p
                  </h3>
                  <p>Tổng thời gian</p>
                  <span className="stat-trend positive">
                    <i className="fas fa-arrow-up"></i> +8% so với tháng trước
                  </span>
                </div>
              </div>

              <div className="stat-card orange">
                <div className="stat-icon">
                  <i className="fas fa-fire"></i>
                </div>
                <div className="stat-info">
                  <h3>{totalCalories.toLocaleString()}</h3>
                  <p>Calories đốt cháy</p>
                  <span className="stat-trend positive">
                    <i className="fas fa-arrow-up"></i> +15% so với tháng trước
                  </span>
                </div>
              </div>

              <div className="stat-card purple">
                <div className="stat-icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="stat-info">
                  <h3>{avgDuration} phút</h3>
                  <p>Trung bình/buổi</p>
                  <span className="stat-trend neutral">
                    <i className="fas fa-minus"></i> Không đổi
                  </span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="card">
              <div className="card-body">
                <div className="filters-row">
                  <div className="filter-group">
                    <label>
                      <i className="fas fa-calendar-alt"></i> Tháng
                    </label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="filter-select"
                    >
                      {months.map((month, index) => (
                        <option key={index} value={index}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>
                      <i className="fas fa-calendar"></i> Năm
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="filter-select"
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="filter-actions">
                    <button className="btn btn-outline">
                      <i className="fas fa-filter"></i> Lọc nâng cao
                    </button>
                    <button className="btn btn-outline">
                      <i className="fas fa-redo"></i> Đặt lại
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Check-in History */}
            {viewMode === "list" ? (
              <div className="checkin-list">
                {filteredHistory.length === 0 ? (
                  <div className="card">
                    <div className="card-body text-center">
                      <div className="empty-state">
                        <i className="fas fa-calendar-times"></i>
                        <h3>Chưa có lịch sử check-in</h3>
                        <p>Bạn chưa có buổi tập nào trong tháng này</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  Object.keys(groupedByWeek)
                    .sort((a, b) => Number(b) - Number(a))
                    .map((week) => (
                      <div key={week} className="week-group">
                        <div className="week-header">
                          <h3>
                            <i className="fas fa-calendar-week"></i> Tuần {week}
                          </h3>
                          <span className="week-stats">
                            {groupedByWeek[Number(week)].length} buổi tập •{" "}
                            {groupedByWeek[Number(week)].reduce(
                              (sum, r) => sum + (r.duration || 0),
                              0,
                            )}{" "}
                            phút
                          </span>
                        </div>

                        <div className="checkin-cards">
                          {groupedByWeek[Number(week)].map((record) => {
                            const dateInfo = formatDate(record.date);
                            return (
                              <div key={record.id} className="checkin-card">
                                <div className="checkin-date">
                                  <div className="date-badge">
                                    <span className="day">{dateInfo.day}</span>
                                    <span className="date-num">
                                      {dateInfo.date}
                                    </span>
                                    <span className="month">
                                      Tháng {dateInfo.month}
                                    </span>
                                  </div>
                                </div>

                                <div className="checkin-details">
                                  <div className="checkin-time">
                                    <div className="time-item">
                                      <i className="fas fa-sign-in-alt text-success"></i>
                                      <div>
                                        <label>Check-in</label>
                                        <strong>{record.checkInTime}</strong>
                                      </div>
                                    </div>
                                    <div className="time-arrow">
                                      <i className="fas fa-arrow-right"></i>
                                    </div>
                                    <div className="time-item">
                                      <i className="fas fa-sign-out-alt text-danger"></i>
                                      <div>
                                        <label>Check-out</label>
                                        <strong>
                                          {record.checkOutTime ||
                                            "Chưa check-out"}
                                        </strong>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="checkin-stats">
                                    <div className="stat-item">
                                      <i className="fas fa-clock"></i>
                                      <span>
                                        {formatDuration(record.duration)}
                                      </span>
                                    </div>
                                    <div className="stat-item">
                                      <i className="fas fa-fire"></i>
                                      <span>{record.calories} cal</span>
                                    </div>
                                  </div>

                                  {record.notes && (
                                    <div className="checkin-notes">
                                      <i className="fas fa-sticky-note"></i>
                                      <span>{record.notes}</span>
                                    </div>
                                  )}
                                </div>

                                <div className="checkin-actions">
                                  <button
                                    className="btn-icon"
                                    title="Xem chi tiết"
                                  >
                                    <i className="fas fa-eye"></i>
                                  </button>
                                  <button
                                    className="btn-icon"
                                    title="Chỉnh sửa"
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                )}
              </div>
            ) : (
              <div className="card">
                <div className="card-body">
                  <div className="calendar-view">
                    <div
                      className="calendar-grid"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
                        gap: "4px",
                      }}
                    >
                      {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((d) => (
                        <div
                          key={d}
                          style={{
                            textAlign: "center",
                            padding: "0.5rem",
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            color: "#6b7280",
                          }}
                        >
                          {d}
                        </div>
                      ))}
                      {(() => {
                        const firstDay = new Date(
                          selectedYear,
                          selectedMonth,
                          1,
                        ).getDay();
                        const daysInMonth = new Date(
                          selectedYear,
                          selectedMonth + 1,
                          0,
                        ).getDate();
                        const cells = [];
                        for (let i = 0; i < firstDay; i++) {
                          cells.push(
                            <div
                              key={`empty-${i}`}
                              style={{ padding: "0.5rem" }}
                            ></div>,
                          );
                        }
                        for (let day = 1; day <= daysInMonth; day++) {
                          const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                          const hasCheckin = checkinHistory.some(
                            (c) => c.date === dateStr,
                          );
                          const isToday =
                            dateStr === new Date().toISOString().split("T")[0];
                          cells.push(
                            <div
                              key={day}
                              style={{
                                textAlign: "center",
                                padding: "0.625rem 0.25rem",
                                borderRadius: "8px",
                                fontSize: "0.875rem",
                                fontWeight: isToday ? 700 : 500,
                                background: hasCheckin
                                  ? "#d1fae5"
                                  : isToday
                                    ? "#eef2ff"
                                    : "transparent",
                                border: isToday
                                  ? "2px solid #6366f1"
                                  : hasCheckin
                                    ? "1px solid #a7f3d0"
                                    : "1px solid transparent",
                                color: hasCheckin
                                  ? "#059669"
                                  : isToday
                                    ? "#6366f1"
                                    : "#374151",
                                cursor: "default",
                              }}
                            >
                              {day}
                              {hasCheckin && (
                                <div
                                  style={{
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: "50%",
                                    background: "#10b981",
                                    margin: "2px auto 0",
                                  }}
                                ></div>
                              )}
                            </div>,
                          );
                        }
                        return cells;
                      })()}
                    </div>
                    <div
                      style={{
                        marginTop: "1rem",
                        display: "flex",
                        gap: "1.5rem",
                        fontSize: "0.8125rem",
                        color: "#6b7280",
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.375rem",
                        }}
                      >
                        <span
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "4px",
                            background: "#d1fae5",
                            border: "1px solid #a7f3d0",
                          }}
                        ></span>{" "}
                        Có tập
                      </span>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.375rem",
                        }}
                      >
                        <span
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "4px",
                            background: "#eef2ff",
                            border: "2px solid #6366f1",
                          }}
                        ></span>{" "}
                        Hôm nay
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
