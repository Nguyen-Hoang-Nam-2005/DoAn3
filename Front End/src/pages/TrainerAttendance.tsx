import { useState } from "react";
import TrainerSidebar from "../components/layout/TrainerSidebar";
import TrainerHeader from "../components/layout/TrainerHeader";
import "../styles.css";
import "./trainerAttendance.css";

interface Student {
  id: number;
  name: string;
  avatar: string;
  membershipStatus: string;
  attended: boolean;
  note: string;
}

interface ClassSession {
  id: number;
  name: string;
  time: string;
  room: string;
  date: string;
}

export default function TrainerAttendance() {
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [classes] = useState<ClassSession[]>([
    {
      id: 1,
      name: "Yoga Buổi Sáng",
      time: "07:00-08:00",
      room: "Phòng Yoga",
      date: new Date().toISOString().split("T")[0],
    },
    {
      id: 2,
      name: "HIIT Cardio",
      time: "09:00-10:00",
      room: "Phòng Group Class",
      date: new Date().toISOString().split("T")[0],
    },
    {
      id: 3,
      name: "Strength Training",
      time: "17:00-18:00",
      room: "Phòng Tạ",
      date: new Date().toISOString().split("T")[0],
    },
    {
      id: 4,
      name: "Spinning Class",
      time: "19:00-20:00",
      room: "Phòng Cardio",
      date: new Date().toISOString().split("T")[0],
    },
  ]);

  const [students, setStudents] = useState<Student[]>([
    {
      id: 1,
      name: "Nguyễn Văn A",
      avatar: "👨",
      membershipStatus: "active",
      attended: false,
      note: "",
    },
    {
      id: 2,
      name: "Trần Thị B",
      avatar: "👩",
      membershipStatus: "active",
      attended: false,
      note: "",
    },
    {
      id: 3,
      name: "Lê Hoàng C",
      avatar: "👨",
      membershipStatus: "active",
      attended: false,
      note: "",
    },
    {
      id: 4,
      name: "Phạm Thị D",
      avatar: "👩",
      membershipStatus: "active",
      attended: false,
      note: "",
    },
    {
      id: 5,
      name: "Võ Minh E",
      avatar: "👨",
      membershipStatus: "expiring",
      attended: false,
      note: "",
    },
    {
      id: 6,
      name: "Hoàng Thị F",
      avatar: "👩",
      membershipStatus: "active",
      attended: false,
      note: "",
    },
    {
      id: 7,
      name: "Đặng Văn G",
      avatar: "👨",
      membershipStatus: "active",
      attended: false,
      note: "",
    },
    {
      id: 8,
      name: "Bùi Thị H",
      avatar: "👩",
      membershipStatus: "active",
      attended: false,
      note: "",
    },
  ]);

  const handleAttendanceToggle = (studentId: number) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId
          ? { ...student, attended: !student.attended }
          : student,
      ),
    );
  };

  const handleNoteChange = (studentId: number, note: string) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, note } : student,
      ),
    );
  };

  const handleSelectAll = () => {
    const allAttended = students.every((s) => s.attended);
    setStudents((prev) =>
      prev.map((student) => ({ ...student, attended: !allAttended })),
    );
  };

  const handleSaveAttendance = () => {
    if (!selectedClass) {
      alert("Vui lòng chọn lớp học!");
      return;
    }

    const attendedCount = students.filter((s) => s.attended).length;
    const selectedClassInfo = classes.find((c) => c.id === selectedClass);
    const trainerName =
      localStorage.getItem("trainerName") || "Huấn luyện viên";

    // Save attendance to localStorage
    const ATTENDANCE_KEY = "gymAttendanceRecords";
    const existingRecords = (() => {
      try {
        const raw = localStorage.getItem(ATTENDANCE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    })();

    const newRecord = {
      id: Date.now(),
      classId: selectedClass,
      className: selectedClassInfo?.name || "",
      classTime: selectedClassInfo?.time || "",
      room: selectedClassInfo?.room || "",
      date: attendanceDate,
      trainerName,
      students: students.map((s) => ({
        id: s.id,
        name: s.name,
        attended: s.attended,
        note: s.note,
      })),
      attendedCount,
      totalCount: students.length,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      ATTENDANCE_KEY,
      JSON.stringify([...existingRecords, newRecord]),
    );

    // Dispatch event so member page can see
    window.dispatchEvent(
      new CustomEvent("gymDataUpdated", { detail: { type: "attendance" } }),
    );

    // Also save to backend API
    try {
      fetch("http://localhost:7000/trainer/Attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: attendanceDate,
          className: selectedClassInfo?.name || "",
          students: students.map((s) => ({
            id: s.id,
            name: s.name,
            attended: s.attended,
            note: s.note,
          })),
        }),
      });
    } catch {
      /* ignore */
    }

    alert(
      `Đã lưu điểm danh cho lớp "${selectedClassInfo?.name}"!\n\nCó mặt: ${attendedCount}/${students.length} học viên`,
    );
  };

  const attendedCount = students.filter((s) => s.attended).length;
  const absentCount = students.length - attendedCount;
  const attendanceRate =
    students.length > 0
      ? Math.round((attendedCount / students.length) * 100)
      : 0;

  return (
    <div className="admin-layout">
      <TrainerSidebar />
      <div className="main-content">
        <TrainerHeader />
        <main className="content">
          <div className="trainer-attendance-page">
            {/* Stats Cards */}
            <div className="attendance-stats">
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
                  <h3>{attendedCount}</h3>
                  <p>Có mặt</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon red">
                  <i className="fas fa-user-times"></i>
                </div>
                <div className="stat-info">
                  <h3>{absentCount}</h3>
                  <p>Vắng mặt</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon purple">
                  <i className="fas fa-percentage"></i>
                </div>
                <div className="stat-info">
                  <h3>{attendanceRate}%</h3>
                  <p>Tỷ lệ tham gia</p>
                </div>
              </div>
            </div>

            {/* Class Selection */}
            <div className="card">
              <div className="card-header">
                <h3>
                  <i className="fas fa-clipboard-check"></i> Thông tin điểm danh
                </h3>
              </div>
              <div className="card-body">
                <div className="attendance-controls">
                  <div className="form-group">
                    <label>
                      <i className="fas fa-calendar-alt"></i> Ngày điểm danh
                    </label>
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <i className="fas fa-chalkboard-teacher"></i> Chọn lớp học
                    </label>
                    <select
                      value={selectedClass || ""}
                      onChange={(e) => setSelectedClass(Number(e.target.value))}
                      className="form-control"
                    >
                      <option value="">-- Chọn lớp học --</option>
                      {classes.map((classItem) => (
                        <option key={classItem.id} value={classItem.id}>
                          {classItem.name} ({classItem.time} - {classItem.room})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedClass && (
                  <div className="selected-class-info">
                    <i className="fas fa-info-circle"></i>
                    <span>
                      Đang điểm danh lớp:{" "}
                      <strong>
                        {classes.find((c) => c.id === selectedClass)?.name}
                      </strong>{" "}
                      - {classes.find((c) => c.id === selectedClass)?.time}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Student List */}
            {selectedClass && (
              <div className="card">
                <div className="card-header">
                  <h3>
                    <i className="fas fa-users"></i> Danh sách học viên
                  </h3>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={handleSelectAll}
                  >
                    <i className="fas fa-check-double"></i>
                    {students.every((s) => s.attended)
                      ? "Bỏ chọn tất cả"
                      : "Chọn tất cả"}
                  </button>
                </div>
                <div className="card-body">
                  <div className="attendance-list">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className={`attendance-item ${student.attended ? "attended" : ""}`}
                      >
                        <div className="student-info">
                          <label className="attendance-checkbox">
                            <input
                              type="checkbox"
                              checked={student.attended}
                              onChange={() =>
                                handleAttendanceToggle(student.id)
                              }
                            />
                            <span className="checkmark">
                              <i className="fas fa-check"></i>
                            </span>
                          </label>
                          <div className="student-avatar">{student.avatar}</div>
                          <div className="student-details">
                            <h4>{student.name}</h4>
                            <span
                              className={`membership-badge ${student.membershipStatus}`}
                            >
                              {student.membershipStatus === "active"
                                ? "Đang hoạt động"
                                : "Sắp hết hạn"}
                            </span>
                          </div>
                        </div>
                        <div className="student-note">
                          <input
                            type="text"
                            placeholder="Ghi chú (tùy chọn)..."
                            value={student.note}
                            onChange={(e) =>
                              handleNoteChange(student.id, e.target.value)
                            }
                            className="note-input"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card-footer">
                  <div className="attendance-summary">
                    <span>
                      Đã chọn: <strong>{attendedCount}</strong> /{" "}
                      {students.length} học viên
                    </span>
                  </div>
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handleSaveAttendance}
                  >
                    <i className="fas fa-save"></i>
                    Lưu điểm danh
                  </button>
                </div>
              </div>
            )}

            {!selectedClass && (
              <div className="empty-state">
                <i className="fas fa-clipboard-list"></i>
                <h3>Chọn lớp học để bắt đầu điểm danh</h3>
                <p>Vui lòng chọn ngày và lớp học ở phía trên</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
