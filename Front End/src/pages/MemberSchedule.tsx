import { useState, useEffect } from "react";
import MemberSidebar from "../components/layout/MemberSidebar";
import MemberHeader from "../components/layout/MemberHeader";
import "../styles.css";
import "./memberSchedule.css";

interface ClassSchedule {
  id: number;
  name: string;
  trainer: string;
  time: string;
  duration: number;
  capacity: number;
  enrolled: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  type: string;
  description: string;
  isEnrolled: boolean;
}

interface DaySchedule {
  day: string;
  date: string;
  classes: ClassSchedule[];
}

export default function MemberSchedule() {
  const [selectedDay, setSelectedDay] = useState(0);
  const [filterLevel, setFilterLevel] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showBookPTModal, setShowBookPTModal] = useState(false);
  const [ptBookings, setPtBookings] = useState<any[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [ptForm, setPtForm] = useState({
    trainer: "",
    date: "",
    time: "",
    note: "",
  });
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  // Load PT bookings from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("gymPTBookings");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const userId = Number(localStorage.getItem("userId") || "1");
          setPtBookings(parsed.filter((b: any) => b.memberId === userId));
        }
      }
    } catch {
      /* ignore */
    }

    // Load attendance history
    try {
      const raw = localStorage.getItem("gymAttendanceRecords");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Show all attendance records (for demo - in production would filter by member)
          const records = parsed.map((record: any) => ({
            ...record,
            attendedStudents:
              record.students?.filter((s: any) => s.attended) || [],
          }));
          setAttendanceHistory(records.slice(-10).reverse());
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const trainers = [
    { id: 1, name: "Nguyễn Thị Lan", specialty: "Yoga, Pilates" },
    { id: 2, name: "Trần Văn Mạnh", specialty: "Boxing, Cardio" },
    { id: 3, name: "Lê Hoàng Nam", specialty: "Strength, CrossFit" },
    { id: 4, name: "Phạm Thị Hương", specialty: "Dance, Zumba" },
    { id: 5, name: "Đỗ Văn Cường", specialty: "HIIT, CrossFit" },
  ];

  const timeSlots = [
    "06:00 - 07:00",
    "07:00 - 08:00",
    "08:00 - 09:00",
    "09:00 - 10:00",
    "10:00 - 11:00",
    "14:00 - 15:00",
    "15:00 - 16:00",
    "16:00 - 17:00",
    "17:00 - 18:00",
    "18:00 - 19:00",
    "19:00 - 20:00",
    "20:00 - 21:00",
  ];

  const handleBookPT = () => {
    if (!ptForm.trainer || !ptForm.date || !ptForm.time) {
      setToast({ msg: "Vui lòng điền đầy đủ thông tin!", type: "error" });
      return;
    }
    const userId = Number(localStorage.getItem("userId") || "1");
    const memberName = localStorage.getItem("memberName") || "Hội viên";
    const newBooking = {
      id: Date.now(),
      memberId: userId,
      memberName,
      trainerName: ptForm.trainer,
      date: ptForm.date,
      time: ptForm.time,
      note: ptForm.note,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    const allBookings = (() => {
      try {
        const raw = localStorage.getItem("gymPTBookings");
        if (raw) return JSON.parse(raw);
      } catch {
        /* ignore */
      }
      return [];
    })();

    const updated = [...allBookings, newBooking];
    localStorage.setItem("gymPTBookings", JSON.stringify(updated));
    setPtBookings(updated.filter((b: any) => b.memberId === userId));
    setShowBookPTModal(false);
    setPtForm({ trainer: "", date: "", time: "", note: "" });
    setToast({ msg: "Đặt lịch PT thành công! 🎉", type: "success" });
    window.dispatchEvent(
      new CustomEvent("gymDataUpdated", { detail: { type: "pt" } }),
    );
  };

  const handleCancelPT = (bookingId: number) => {
    if (!confirm("Bạn có chắc muốn hủy lịch PT này?")) return;
    const allBookings = (() => {
      try {
        const raw = localStorage.getItem("gymPTBookings");
        if (raw) return JSON.parse(raw);
      } catch {
        /* ignore */
      }
      return [];
    })();
    const updated = allBookings.filter((b: any) => b.id !== bookingId);
    localStorage.setItem("gymPTBookings", JSON.stringify(updated));
    const userId = Number(localStorage.getItem("userId") || "1");
    setPtBookings(updated.filter((b: any) => b.memberId === userId));
    setToast({ msg: "Đã hủy lịch PT!", type: "success" });
  };

  const weekSchedule: DaySchedule[] = [
    {
      day: "Thứ Hai",
      date: "19/05/2026",
      classes: [
        {
          id: 1,
          name: "Yoga Buổi Sáng",
          trainer: "Nguyễn Thị Lan",
          time: "06:00 - 07:00",
          duration: 60,
          capacity: 20,
          enrolled: 15,
          level: "Beginner",
          type: "Yoga",
          description: "Lớp yoga nhẹ nhàng giúp khởi động cơ thể buổi sáng",
          isEnrolled: true,
        },
        {
          id: 2,
          name: "Cardio Kickboxing",
          trainer: "Trần Văn Mạnh",
          time: "18:00 - 19:00",
          duration: 60,
          capacity: 25,
          enrolled: 20,
          level: "Intermediate",
          type: "Cardio",
          description: "Đốt cháy calories với kickboxing năng động",
          isEnrolled: false,
        },
        {
          id: 3,
          name: "Strength Training",
          trainer: "Lê Hoàng Nam",
          time: "19:30 - 20:30",
          duration: 60,
          capacity: 15,
          enrolled: 12,
          level: "Advanced",
          type: "Strength",
          description: "Tập luyện sức mạnh với tạ và thiết bị chuyên nghiệp",
          isEnrolled: true,
        },
      ],
    },
    {
      day: "Thứ Ba",
      date: "20/05/2026",
      classes: [
        {
          id: 4,
          name: "Zumba Dance",
          trainer: "Phạm Thị Hương",
          time: "06:30 - 07:30",
          duration: 60,
          capacity: 30,
          enrolled: 25,
          level: "Beginner",
          type: "Dance",
          description: "Nhảy Zumba vui vẻ, giảm cân hiệu quả",
          isEnrolled: false,
        },
        {
          id: 5,
          name: "CrossFit",
          trainer: "Đỗ Văn Cường",
          time: "17:00 - 18:00",
          duration: 60,
          capacity: 20,
          enrolled: 18,
          level: "Advanced",
          type: "CrossFit",
          description: "Luyện tập cường độ cao với CrossFit",
          isEnrolled: true,
        },
        {
          id: 6,
          name: "Pilates",
          trainer: "Nguyễn Thị Lan",
          time: "19:00 - 20:00",
          duration: 60,
          capacity: 15,
          enrolled: 10,
          level: "Intermediate",
          type: "Pilates",
          description: "Tăng cường sức mạnh cốt lõi với Pilates",
          isEnrolled: false,
        },
      ],
    },
    {
      day: "Thứ Tư",
      date: "21/05/2026",
      classes: [
        {
          id: 7,
          name: "Spinning",
          trainer: "Trần Văn Mạnh",
          time: "06:00 - 07:00",
          duration: 60,
          capacity: 25,
          enrolled: 22,
          level: "Intermediate",
          type: "Cycling",
          description: "Đạp xe trong nhà với cường độ cao",
          isEnrolled: true,
        },
        {
          id: 8,
          name: "Body Combat",
          trainer: "Lê Hoàng Nam",
          time: "18:30 - 19:30",
          duration: 60,
          capacity: 20,
          enrolled: 16,
          level: "Intermediate",
          type: "Combat",
          description: "Kết hợp võ thuật và cardio",
          isEnrolled: false,
        },
      ],
    },
    {
      day: "Thứ Năm",
      date: "22/05/2026",
      classes: [
        {
          id: 9,
          name: "Yoga Flow",
          trainer: "Nguyễn Thị Lan",
          time: "06:30 - 07:30",
          duration: 60,
          capacity: 20,
          enrolled: 18,
          level: "Intermediate",
          type: "Yoga",
          description: "Yoga động với các tư thế liên kết",
          isEnrolled: true,
        },
        {
          id: 10,
          name: "HIIT Training",
          trainer: "Đỗ Văn Cường",
          time: "18:00 - 19:00",
          duration: 60,
          capacity: 25,
          enrolled: 23,
          level: "Advanced",
          type: "HIIT",
          description: "Tập luyện cường độ cao ngắt quãng",
          isEnrolled: true,
        },
      ],
    },
    {
      day: "Thứ Sáu",
      date: "23/05/2026",
      classes: [
        {
          id: 11,
          name: "Stretching & Recovery",
          trainer: "Phạm Thị Hương",
          time: "06:00 - 07:00",
          duration: 60,
          capacity: 15,
          enrolled: 12,
          level: "Beginner",
          type: "Recovery",
          description: "Giãn cơ và phục hồi sau tuần tập luyện",
          isEnrolled: false,
        },
        {
          id: 12,
          name: "Boxing Fundamentals",
          trainer: "Trần Văn Mạnh",
          time: "19:00 - 20:00",
          duration: 60,
          capacity: 20,
          enrolled: 15,
          level: "Beginner",
          type: "Boxing",
          description: "Học các kỹ thuật boxing cơ bản",
          isEnrolled: false,
        },
      ],
    },
    {
      day: "Thứ Bảy",
      date: "24/05/2026",
      classes: [
        {
          id: 13,
          name: "Weekend Warrior",
          trainer: "Lê Hoàng Nam",
          time: "08:00 - 09:30",
          duration: 90,
          capacity: 30,
          enrolled: 28,
          level: "Intermediate",
          type: "Mixed",
          description: "Lớp tổng hợp cuối tuần cho mọi cấp độ",
          isEnrolled: true,
        },
        {
          id: 14,
          name: "Aqua Aerobics",
          trainer: "Phạm Thị Hương",
          time: "10:00 - 11:00",
          duration: 60,
          capacity: 20,
          enrolled: 16,
          level: "Beginner",
          type: "Aqua",
          description: "Aerobic dưới nước nhẹ nhàng cho khớp",
          isEnrolled: false,
        },
      ],
    },
    {
      day: "Chủ Nhật",
      date: "25/05/2026",
      classes: [
        {
          id: 15,
          name: "Sunday Yoga",
          trainer: "Nguyễn Thị Lan",
          time: "08:00 - 09:30",
          duration: 90,
          capacity: 25,
          enrolled: 20,
          level: "Beginner",
          type: "Yoga",
          description: "Yoga thư giãn cho ngày Chủ Nhật",
          isEnrolled: true,
        },
        {
          id: 16,
          name: "Family Fitness",
          trainer: "Đỗ Văn Cường",
          time: "10:00 - 11:00",
          duration: 60,
          capacity: 40,
          enrolled: 35,
          level: "Beginner",
          type: "Family",
          description: "Lớp tập cho cả gia đình",
          isEnrolled: false,
        },
      ],
    },
  ];

  const currentSchedule = weekSchedule[selectedDay];

  const filteredClasses = currentSchedule.classes.filter((cls) => {
    const matchesLevel = filterLevel === "all" || cls.level === filterLevel;
    const matchesType = filterType === "all" || cls.type === filterType;
    const matchesSearch =
      searchQuery === "" ||
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.trainer.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesLevel && matchesType && matchesSearch;
  });

  const handleEnroll = (classId: number) => {
    // USE LOCAL DATA ONLY - Update state directly
    const updatedSchedule = [...weekSchedule];
    updatedSchedule[selectedDay].classes = updatedSchedule[
      selectedDay
    ].classes.map((cls) =>
      cls.id === classId
        ? { ...cls, isEnrolled: true, enrolled: cls.enrolled + 1 }
        : cls,
    );
    alert(`Đăng ký lớp học thành công!`);
    // In real app, would update state here
  };

  const handleUnenroll = (classId: number) => {
    if (confirm("Bạn có chắc muốn hủy đăng ký lớp này?")) {
      // USE LOCAL DATA ONLY - Update state directly
      const updatedSchedule = [...weekSchedule];
      updatedSchedule[selectedDay].classes = updatedSchedule[
        selectedDay
      ].classes.map((cls) =>
        cls.id === classId
          ? { ...cls, isEnrolled: false, enrolled: cls.enrolled - 1 }
          : cls,
      );
      alert(`Đã hủy đăng ký lớp học!`);
      // In real app, would update state here
    }
  };

  const getLevelBadge = (level: string) => {
    const badges = {
      Beginner: { class: "success", text: "Cơ bản" },
      Intermediate: { class: "warning", text: "Trung cấp" },
      Advanced: { class: "danger", text: "Nâng cao" },
    };
    return badges[level as keyof typeof badges] || badges.Beginner;
  };

  const getAvailabilityColor = (enrolled: number, capacity: number) => {
    const percentage = (enrolled / capacity) * 100;
    if (percentage >= 90) return "danger";
    if (percentage >= 70) return "warning";
    return "success";
  };

  return (
    <div className="admin-layout">
      <MemberSidebar />
      <div className="main-content">
        <MemberHeader />
        <main className="content">
          <div className="schedule-page">
            {/* Page Header */}
            <div className="page-header">
              <div className="page-title">
                <h1>
                  <i className="fas fa-calendar-alt"></i> Lịch tập
                </h1>
                <p>Xem và đăng ký các lớp tập luyện trong tuần</p>
              </div>
              <div className="page-actions">
                <button className="btn btn-outline">
                  <i className="fas fa-calendar-check"></i> Lớp của tôi
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowBookPTModal(true)}
                >
                  <i className="fas fa-user-plus"></i> Đặt lịch PT
                </button>
              </div>
            </div>

            {/* Toast */}
            {toast && (
              <div
                className="schedule-toast"
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
                }}
              >
                <i
                  className={`fas fa-${toast.type === "success" ? "check-circle" : "exclamation-circle"}`}
                ></i>
                {toast.msg}
              </div>
            )}

            {/* PT Bookings Section */}
            {ptBookings.length > 0 && (
              <div
                className="pt-bookings-section"
                style={{ marginBottom: "1.5rem" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "1rem",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "1.125rem",
                      fontWeight: 700,
                      color: "#1f2937",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <i
                      className="fas fa-user-clock"
                      style={{ color: "#6366f1" }}
                    ></i>{" "}
                    Lịch PT của tôi ({ptBookings.length})
                  </h3>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowBookPTModal(true)}
                  >
                    <i className="fas fa-plus"></i> Đặt thêm
                  </button>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  {ptBookings.map((booking: any) => (
                    <div
                      key={booking.id}
                      style={{
                        background: "white",
                        borderRadius: "12px",
                        padding: "1.25rem",
                        border: "1px solid #e5e7eb",
                        borderLeft: "4px solid #6366f1",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "0.75rem",
                        }}
                      >
                        <div>
                          <strong
                            style={{ color: "#1f2937", fontSize: "0.9375rem" }}
                          >
                            {booking.trainerName}
                          </strong>
                          <span
                            style={{
                              display: "block",
                              fontSize: "0.8125rem",
                              color: "#6b7280",
                              marginTop: "0.125rem",
                            }}
                          >
                            Huấn luyện viên
                          </span>
                        </div>
                        <span
                          style={{
                            padding: "0.25rem 0.625rem",
                            borderRadius: "12px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            background: "#d1fae5",
                            color: "#059669",
                          }}
                        >
                          Đã xác nhận
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "1rem",
                          fontSize: "0.8125rem",
                          color: "#4b5563",
                          marginBottom: "0.75rem",
                        }}
                      >
                        <span>
                          <i
                            className="fas fa-calendar"
                            style={{
                              marginRight: "0.375rem",
                              color: "#9ca3af",
                            }}
                          ></i>
                          {new Date(booking.date).toLocaleDateString("vi-VN")}
                        </span>
                        <span>
                          <i
                            className="fas fa-clock"
                            style={{
                              marginRight: "0.375rem",
                              color: "#9ca3af",
                            }}
                          ></i>
                          {booking.time}
                        </span>
                      </div>
                      {booking.note && (
                        <p
                          style={{
                            fontSize: "0.8125rem",
                            color: "#6b7280",
                            margin: "0 0 0.75rem",
                            fontStyle: "italic",
                          }}
                        >
                          "{booking.note}"
                        </p>
                      )}
                      <button
                        onClick={() => handleCancelPT(booking.id)}
                        style={{
                          padding: "0.375rem 0.75rem",
                          border: "1px solid #fecaca",
                          borderRadius: "6px",
                          background: "#fef2f2",
                          color: "#dc2626",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        <i className="fas fa-times"></i> Hủy lịch
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attendance History from PT */}
            {attendanceHistory.length > 0 && (
              <div style={{ marginBottom: "1.5rem" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "1rem",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "1.125rem",
                      fontWeight: 700,
                      color: "#1f2937",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <i
                      className="fas fa-clipboard-check"
                      style={{ color: "#10b981" }}
                    ></i>{" "}
                    Lịch sử điểm danh PT ({attendanceHistory.length})
                  </h3>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  {attendanceHistory.map((record: any) => (
                    <div
                      key={record.id}
                      style={{
                        background: "white",
                        borderRadius: "12px",
                        padding: "1.25rem",
                        border: "1px solid #e5e7eb",
                        borderLeft: "4px solid #10b981",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "0.75rem",
                        }}
                      >
                        <div>
                          <strong
                            style={{ color: "#1f2937", fontSize: "0.9375rem" }}
                          >
                            {record.className}
                          </strong>
                          <span
                            style={{
                              display: "block",
                              fontSize: "0.8125rem",
                              color: "#6b7280",
                              marginTop: "0.125rem",
                            }}
                          >
                            HLV: {record.trainerName}
                          </span>
                        </div>
                        <span
                          style={{
                            padding: "0.25rem 0.625rem",
                            borderRadius: "12px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            background: "#d1fae5",
                            color: "#059669",
                          }}
                        >
                          ✓ {record.attendedCount}/{record.totalCount} có mặt
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "1rem",
                          fontSize: "0.8125rem",
                          color: "#4b5563",
                        }}
                      >
                        <span>
                          <i
                            className="fas fa-calendar"
                            style={{
                              marginRight: "0.375rem",
                              color: "#9ca3af",
                            }}
                          ></i>
                          {new Date(record.date).toLocaleDateString("vi-VN")}
                        </span>
                        <span>
                          <i
                            className="fas fa-clock"
                            style={{
                              marginRight: "0.375rem",
                              color: "#9ca3af",
                            }}
                          ></i>
                          {record.classTime}
                        </span>
                        <span>
                          <i
                            className="fas fa-door-open"
                            style={{
                              marginRight: "0.375rem",
                              color: "#9ca3af",
                            }}
                          ></i>
                          {record.room}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="schedule-stats">
              <div className="stat-card">
                <div className="stat-card-top">
                  <div className="stat-icon-wrap blue">
                    <i className="fas fa-calendar-check"></i>
                  </div>
                  <span className="stat-badge blue-badge">↑ 12%</span>
                </div>
                <div className="stat-value blue-text">8</div>
                <div className="stat-label">Lớp đã đăng ký</div>
                <div className="stat-progress-wrap">
                  <div
                    className="stat-progress-bar blue-bar"
                    style={{ width: "64%" }}
                  ></div>
                </div>
                <div className="stat-goal">Mục tiêu: 12 lớp/tháng</div>
              </div>

              <div className="stat-card">
                <div className="stat-card-top">
                  <div className="stat-icon-wrap green">
                    <i className="fas fa-clock"></i>
                  </div>
                  <span className="stat-badge green-badge">↑ 8%</span>
                </div>
                <div className="stat-value green-text">12h</div>
                <div className="stat-label">Tổng thời gian</div>
                <div className="stat-progress-wrap">
                  <div
                    className="stat-progress-bar green-bar"
                    style={{ width: "48%" }}
                  ></div>
                </div>
                <div className="stat-goal">Mục tiêu: 25 giờ/tháng</div>
              </div>

              <div className="stat-card">
                <div className="stat-card-top">
                  <div className="stat-icon-wrap orange">
                    <i className="fas fa-fire"></i>
                  </div>
                  <span className="stat-badge orange-badge">↑ 15%</span>
                </div>
                <div className="stat-value orange-text">~4,800</div>
                <div className="stat-label">Calories dự kiến</div>
                <div className="stat-progress-wrap">
                  <div
                    className="stat-progress-bar orange-bar"
                    style={{ width: "55%" }}
                  ></div>
                </div>
                <div className="stat-goal">Mục tiêu: 8,000 kcal</div>
              </div>

              <div className="stat-card">
                <div className="stat-card-top">
                  <div className="stat-icon-wrap purple">
                    <i className="fas fa-trophy"></i>
                  </div>
                  <span className="stat-badge purple-badge">↑ 20%</span>
                </div>
                <div className="stat-value purple-text">5</div>
                <div className="stat-label">Huấn luyện viên</div>
                <div className="stat-progress-wrap">
                  <div
                    className="stat-progress-bar purple-bar"
                    style={{ width: "83%" }}
                  ></div>
                </div>
                <div className="stat-goal">Còn 1 HLV nữa</div>
              </div>
            </div>

            {/* Day Selector */}
            <div className="card">
              <div className="card-body">
                <div className="day-selector">
                  {weekSchedule.map((day, index) => (
                    <button
                      key={index}
                      className={`day-btn ${selectedDay === index ? "active" : ""}`}
                      onClick={() => setSelectedDay(index)}
                    >
                      <div className="day-name">{day.day}</div>
                      <div className="day-date">{day.date}</div>
                      <div className="day-count">
                        {day.classes.filter((c) => c.isEnrolled).length}/
                        {day.classes.length}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="card">
              <div className="card-body">
                <div className="schedule-filters">
                  <div className="filter-group">
                    <label>
                      <i className="fas fa-search"></i> Tìm kiếm
                    </label>
                    <input
                      type="text"
                      placeholder="Tên lớp hoặc huấn luyện viên..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="filter-input"
                    />
                  </div>
                  <div className="filter-group">
                    <label>
                      <i className="fas fa-layer-group"></i> Cấp độ
                    </label>
                    <select
                      value={filterLevel}
                      onChange={(e) => setFilterLevel(e.target.value)}
                      className="filter-select"
                    >
                      <option value="all">Tất cả</option>
                      <option value="Beginner">Cơ bản</option>
                      <option value="Intermediate">Trung cấp</option>
                      <option value="Advanced">Nâng cao</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>
                      <i className="fas fa-dumbbell"></i> Loại
                    </label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="filter-select"
                    >
                      <option value="all">Tất cả</option>
                      <option value="Yoga">Yoga</option>
                      <option value="Cardio">Cardio</option>
                      <option value="Strength">Strength</option>
                      <option value="Dance">Dance</option>
                      <option value="CrossFit">CrossFit</option>
                      <option value="HIIT">HIIT</option>
                      <option value="Boxing">Boxing</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Classes List */}
            <div className="classes-grid">
              {filteredClasses.length === 0 ? (
                <div className="card">
                  <div className="card-body text-center">
                    <div className="empty-state">
                      <i className="fas fa-calendar-times"></i>
                      <h3>Không tìm thấy lớp học</h3>
                      <p>Thử thay đổi bộ lọc hoặc chọn ngày khác</p>
                    </div>
                  </div>
                </div>
              ) : (
                filteredClasses.map((cls) => {
                  const levelBadge = getLevelBadge(cls.level);
                  const availabilityColor = getAvailabilityColor(
                    cls.enrolled,
                    cls.capacity,
                  );

                  return (
                    <div key={cls.id} className="class-card">
                      <div className="class-header">
                        <div className="class-title">
                          <h3>{cls.name}</h3>
                          <span className={`level-badge ${levelBadge.class}`}>
                            {levelBadge.text}
                          </span>
                        </div>
                        {cls.isEnrolled && (
                          <span className="enrolled-badge">
                            <i className="fas fa-check-circle"></i> Đã đăng ký
                          </span>
                        )}
                      </div>

                      <div className="class-info">
                        <div className="info-item">
                          <i className="fas fa-user-tie"></i>
                          <span>{cls.trainer}</span>
                        </div>
                        <div className="info-item">
                          <i className="fas fa-clock"></i>
                          <span>{cls.time}</span>
                        </div>
                        <div className="info-item">
                          <i className="fas fa-hourglass-half"></i>
                          <span>{cls.duration} phút</span>
                        </div>
                        <div className="info-item">
                          <i className="fas fa-tag"></i>
                          <span>{cls.type}</span>
                        </div>
                      </div>

                      <p className="class-description">{cls.description}</p>

                      <div className="class-footer">
                        <div className="availability">
                          <div className="availability-bar">
                            <div
                              className={`availability-fill ${availabilityColor}`}
                              style={{
                                width: `${(cls.enrolled / cls.capacity) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="availability-text">
                            {cls.enrolled}/{cls.capacity} chỗ
                          </span>
                        </div>

                        {cls.isEnrolled ? (
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => handleUnenroll(cls.id)}
                          >
                            <i className="fas fa-times"></i> Hủy đăng ký
                          </button>
                        ) : cls.enrolled >= cls.capacity ? (
                          <button className="btn btn-outline btn-sm" disabled>
                            <i className="fas fa-lock"></i> Đã đầy
                          </button>
                        ) : (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleEnroll(cls.id)}
                          >
                            <i className="fas fa-plus"></i> Đăng ký
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </main>
      </div>

      {/* PT Booking Modal */}
      {showBookPTModal && (
        <div
          className="modal"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(15,23,42,0.6)",
              backdropFilter: "blur(4px)",
              zIndex: 1001,
            }}
            onClick={() => setShowBookPTModal(false)}
          ></div>
          <div
            style={{
              position: "relative",
              zIndex: 1002,
              background: "white",
              borderRadius: "16px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              maxWidth: "500px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "#1f2937",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                }}
              >
                <i
                  className="fas fa-user-clock"
                  style={{ color: "#6366f1" }}
                ></i>{" "}
                Đặt lịch PT
              </h2>
              <button
                onClick={() => setShowBookPTModal(false)}
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#f3f4f6",
                  color: "#6b7280",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div style={{ padding: "1.5rem", overflowY: "auto" }}>
              <div style={{ marginBottom: "1.25rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: "0.5rem",
                  }}
                >
                  <i
                    className="fas fa-user-tie"
                    style={{ marginRight: "0.375rem", color: "#6366f1" }}
                  ></i>{" "}
                  Chọn huấn luyện viên
                </label>
                <select
                  value={ptForm.trainer}
                  onChange={(e) =>
                    setPtForm({ ...ptForm, trainer: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    fontSize: "0.875rem",
                  }}
                >
                  <option value="">-- Chọn HLV --</option>
                  {trainers.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name} ({t.specialty})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: "1.25rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: "0.5rem",
                  }}
                >
                  <i
                    className="fas fa-calendar"
                    style={{ marginRight: "0.375rem", color: "#6366f1" }}
                  ></i>{" "}
                  Chọn ngày
                </label>
                <input
                  type="date"
                  value={ptForm.date}
                  onChange={(e) =>
                    setPtForm({ ...ptForm, date: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    fontSize: "0.875rem",
                  }}
                />
              </div>
              <div style={{ marginBottom: "1.25rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: "0.5rem",
                  }}
                >
                  <i
                    className="fas fa-clock"
                    style={{ marginRight: "0.375rem", color: "#6366f1" }}
                  ></i>{" "}
                  Chọn khung giờ
                </label>
                <select
                  value={ptForm.time}
                  onChange={(e) =>
                    setPtForm({ ...ptForm, time: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    fontSize: "0.875rem",
                  }}
                >
                  <option value="">-- Chọn giờ --</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: "1.25rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: "0.5rem",
                  }}
                >
                  <i
                    className="fas fa-sticky-note"
                    style={{ marginRight: "0.375rem", color: "#6366f1" }}
                  ></i>{" "}
                  Ghi chú (tùy chọn)
                </label>
                <textarea
                  value={ptForm.note}
                  onChange={(e) =>
                    setPtForm({ ...ptForm, note: e.target.value })
                  }
                  placeholder="VD: Muốn tập trung vào phần thân trên..."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    fontSize: "0.875rem",
                    resize: "vertical",
                  }}
                />
              </div>
              <div
                style={{
                  background: "#eef2ff",
                  border: "1px solid #c7d2fe",
                  borderRadius: "10px",
                  padding: "0.875rem 1rem",
                  fontSize: "0.8125rem",
                  color: "#3730a3",
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "flex-start",
                }}
              >
                <i
                  className="fas fa-info-circle"
                  style={{ marginTop: "0.1rem" }}
                ></i>
                <span>
                  Lịch PT sẽ được xác nhận ngay. HLV sẽ liên hệ bạn trước buổi
                  tập 30 phút.
                </span>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "0.75rem",
                padding: "1.25rem 1.5rem",
                borderTop: "1px solid #f1f5f9",
                background: "#fafbfc",
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => setShowBookPTModal(false)}
              >
                Hủy
              </button>
              <button className="btn btn-primary" onClick={handleBookPT}>
                <i className="fas fa-check"></i> Xác nhận đặt lịch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
