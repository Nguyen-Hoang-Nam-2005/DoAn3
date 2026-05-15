import { useState, useEffect } from "react";
import TrainerSidebar from "../components/layout/TrainerSidebar";
import TrainerHeader from "../components/layout/TrainerHeader";
import "../styles.css";
import "./trainerSchedule.css";

interface ScheduleEvent {
  id: number;
  title: string;
  type: string;
  time: string;
  duration: number;
  room: string;
  students: number;
  capacity: number;
  color: string;
}

interface DaySchedule {
  day: string;
  date: string;
  events: ScheduleEvent[];
}

export default function TrainerSchedule() {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [viewMode, setViewMode] = useState<"week" | "day">("week");

  useEffect(() => {
    const loadFromAPI = async () => {
      try {
        const res = await fetch("http://localhost:7000/trainer/Schedule");
        if (res.ok) {
          console.log("TrainerSchedule: API connected");
        }
      } catch {
        /* Backend unavailable */
      }
    };
    loadFromAPI();
  }, []);
  const [selectedDay, setSelectedDay] = useState(0);

  // Generate week dates
  const getWeekDates = (weekOffset: number) => {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDay + 1 + weekOffset * 7);

    const weekDates: DaySchedule[] = [];
    const dayNames = [
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
      "Chủ Nhật",
    ];

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push({
        day: dayNames[i],
        date: date.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        }),
        events: getEventsForDay(i),
      });
    }

    return weekDates;
  };

  const getEventsForDay = (dayIndex: number): ScheduleEvent[] => {
    const schedules: { [key: number]: ScheduleEvent[] } = {
      0: [
        // Thứ Hai
        {
          id: 1,
          title: "Yoga Buổi Sáng",
          type: "Yoga",
          time: "07:00",
          duration: 60,
          room: "Phòng Yoga",
          students: 18,
          capacity: 20,
          color: "#8b5cf6",
        },
        {
          id: 2,
          title: "Strength Training",
          type: "Strength",
          time: "17:00",
          duration: 60,
          room: "Phòng Tạ",
          students: 15,
          capacity: 20,
          color: "#ef4444",
        },
        {
          id: 3,
          title: "PT - Nguyễn Văn A",
          type: "Personal",
          time: "19:00",
          duration: 60,
          room: "Khu PT",
          students: 1,
          capacity: 1,
          color: "#f59e0b",
        },
      ],
      1: [
        // Thứ Ba
        {
          id: 4,
          title: "HIIT Cardio",
          type: "Cardio",
          time: "09:00",
          duration: 60,
          room: "Phòng Group Class",
          students: 22,
          capacity: 25,
          color: "#10b981",
        },
        {
          id: 5,
          title: "Spinning Class",
          type: "Cycling",
          time: "19:00",
          duration: 60,
          room: "Phòng Cardio",
          students: 20,
          capacity: 25,
          color: "#3b82f6",
        },
      ],
      2: [
        // Thứ Tư
        {
          id: 6,
          title: "Yoga Buổi Sáng",
          type: "Yoga",
          time: "07:00",
          duration: 60,
          room: "Phòng Yoga",
          students: 18,
          capacity: 20,
          color: "#8b5cf6",
        },
        {
          id: 7,
          title: "PT - Trần Thị B",
          type: "Personal",
          time: "15:00",
          duration: 60,
          room: "Khu PT",
          students: 1,
          capacity: 1,
          color: "#f59e0b",
        },
        {
          id: 8,
          title: "CrossFit",
          type: "CrossFit",
          time: "18:00",
          duration: 60,
          room: "Phòng Group Class",
          students: 18,
          capacity: 20,
          color: "#ec4899",
        },
      ],
      3: [
        // Thứ Năm
        {
          id: 9,
          title: "Pilates",
          type: "Pilates",
          time: "10:00",
          duration: 60,
          room: "Phòng Yoga",
          students: 12,
          capacity: 15,
          color: "#8b5cf6",
        },
        {
          id: 10,
          title: "Strength Training",
          type: "Strength",
          time: "17:00",
          duration: 60,
          room: "Phòng Tạ",
          students: 15,
          capacity: 20,
          color: "#ef4444",
        },
      ],
      4: [
        // Thứ Sáu
        {
          id: 11,
          title: "Yoga Buổi Sáng",
          type: "Yoga",
          time: "07:00",
          duration: 60,
          room: "Phòng Yoga",
          students: 18,
          capacity: 20,
          color: "#8b5cf6",
        },
        {
          id: 12,
          title: "HIIT Cardio",
          type: "Cardio",
          time: "09:00",
          duration: 60,
          room: "Phòng Group Class",
          students: 22,
          capacity: 25,
          color: "#10b981",
        },
        {
          id: 13,
          title: "CrossFit",
          type: "CrossFit",
          time: "18:00",
          duration: 60,
          room: "Phòng Group Class",
          students: 18,
          capacity: 20,
          color: "#ec4899",
        },
      ],
      5: [
        // Thứ Bảy
        {
          id: 14,
          title: "Spinning Class",
          type: "Cycling",
          time: "08:00",
          duration: 60,
          room: "Phòng Cardio",
          students: 20,
          capacity: 25,
          color: "#3b82f6",
        },
        {
          id: 15,
          title: "PT - Lê Hoàng C",
          type: "Personal",
          time: "10:00",
          duration: 60,
          room: "Khu PT",
          students: 1,
          capacity: 1,
          color: "#f59e0b",
        },
      ],
      6: [
        // Chủ Nhật
        {
          id: 16,
          title: "Yoga Thư Giãn",
          type: "Yoga",
          time: "09:00",
          duration: 60,
          room: "Phòng Yoga",
          students: 15,
          capacity: 20,
          color: "#8b5cf6",
        },
      ],
    };

    return schedules[dayIndex] || [];
  };

  const weekSchedule = getWeekDates(currentWeek);

  const handlePreviousWeek = () => {
    setCurrentWeek((prev) => prev - 1);
  };

  const handleNextWeek = () => {
    setCurrentWeek((prev) => prev + 1);
  };

  const handleToday = () => {
    setCurrentWeek(0);
  };

  const totalClasses = weekSchedule.reduce(
    (sum, day) => sum + day.events.length,
    0,
  );
  const totalHours = weekSchedule.reduce(
    (sum, day) => sum + day.events.reduce((s, e) => s + e.duration, 0) / 60,
    0,
  );
  const totalStudents = weekSchedule.reduce(
    (sum, day) => sum + day.events.reduce((s, e) => s + e.students, 0),
    0,
  );

  return (
    <div className="admin-layout">
      <TrainerSidebar />
      <div className="main-content">
        <TrainerHeader />
        <main className="content">
          <div className="trainer-schedule-page">
            {/* Stats Cards */}
            <div className="schedule-stats">
              <div className="stat-card">
                <div className="stat-icon blue">
                  <i className="fas fa-chalkboard-teacher"></i>
                </div>
                <div className="stat-info">
                  <h3>{totalClasses}</h3>
                  <p>Lớp học tuần này</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon green">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="stat-info">
                  <h3>{totalHours}h</h3>
                  <p>Tổng giờ dạy</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon purple">
                  <i className="fas fa-users"></i>
                </div>
                <div className="stat-info">
                  <h3>{totalStudents}</h3>
                  <p>Tổng học viên</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon orange">
                  <i className="fas fa-calendar-check"></i>
                </div>
                <div className="stat-info">
                  <h3>
                    {weekSchedule.filter((d) => d.events.length > 0).length}/7
                  </h3>
                  <p>Ngày có lịch</p>
                </div>
              </div>
            </div>

            {/* Schedule Controls */}
            <div className="card">
              <div className="card-body">
                <div className="schedule-controls">
                  <div className="week-navigation">
                    <button
                      className="btn btn-outline btn-icon"
                      onClick={handlePreviousWeek}
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    <button className="btn btn-primary" onClick={handleToday}>
                      <i className="fas fa-calendar-day"></i>
                      Hôm nay
                    </button>
                    <button
                      className="btn btn-outline btn-icon"
                      onClick={handleNextWeek}
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                    <span className="week-label">
                      {currentWeek === 0
                        ? "Tuần này"
                        : currentWeek > 0
                          ? `${currentWeek} tuần sau`
                          : `${Math.abs(currentWeek)} tuần trước`}
                    </span>
                  </div>

                  <div className="view-toggle">
                    <button
                      className={`view-btn ${viewMode === "week" ? "active" : ""}`}
                      onClick={() => setViewMode("week")}
                    >
                      <i className="fas fa-calendar-week"></i>
                      Tuần
                    </button>
                    <button
                      className={`view-btn ${viewMode === "day" ? "active" : ""}`}
                      onClick={() => setViewMode("day")}
                    >
                      <i className="fas fa-calendar-day"></i>
                      Ngày
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Week View */}
            {viewMode === "week" && (
              <div className="schedule-grid">
                {weekSchedule.map((daySchedule, index) => (
                  <div key={index} className="day-column">
                    <div className="day-header">
                      <div className="day-name">{daySchedule.day}</div>
                      <div className="day-date">{daySchedule.date}</div>
                      <div className="day-count">
                        {daySchedule.events.length} lớp
                      </div>
                    </div>
                    <div className="day-events">
                      {daySchedule.events.length > 0 ? (
                        daySchedule.events.map((event) => (
                          <div
                            key={event.id}
                            className="event-card"
                            style={{ borderLeftColor: event.color }}
                          >
                            <div className="event-time">
                              <i className="fas fa-clock"></i>
                              {event.time}
                            </div>
                            <div className="event-title">{event.title}</div>
                            <div className="event-details">
                              <span>
                                <i className="fas fa-door-open"></i>
                                {event.room}
                              </span>
                              <span>
                                <i className="fas fa-users"></i>
                                {event.students}/{event.capacity}
                              </span>
                            </div>
                            <div
                              className="event-type"
                              style={{ backgroundColor: event.color }}
                            >
                              {event.type}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-events">
                          <i className="fas fa-calendar-times"></i>
                          <span>Không có lịch</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Day View */}
            {viewMode === "day" && (
              <div className="day-view">
                <div className="day-selector">
                  {weekSchedule.map((day, index) => (
                    <button
                      key={index}
                      className={`day-tab ${selectedDay === index ? "active" : ""}`}
                      onClick={() => setSelectedDay(index)}
                    >
                      <div className="tab-day">{day.day}</div>
                      <div className="tab-date">{day.date}</div>
                    </button>
                  ))}
                </div>

                <div className="day-timeline">
                  {weekSchedule[selectedDay].events.length > 0 ? (
                    weekSchedule[selectedDay].events.map((event) => (
                      <div key={event.id} className="timeline-event">
                        <div className="timeline-time">
                          <div className="time-label">{event.time}</div>
                          <div className="time-duration">
                            {event.duration} phút
                          </div>
                        </div>
                        <div
                          className="timeline-content"
                          style={{ borderLeftColor: event.color }}
                        >
                          <div className="timeline-header">
                            <h3>{event.title}</h3>
                            <span
                              className="timeline-badge"
                              style={{ backgroundColor: event.color }}
                            >
                              {event.type}
                            </span>
                          </div>
                          <div className="timeline-details">
                            <div className="detail-item">
                              <i className="fas fa-door-open"></i>
                              <span>{event.room}</span>
                            </div>
                            <div className="detail-item">
                              <i className="fas fa-users"></i>
                              <span>
                                {event.students}/{event.capacity} học viên
                              </span>
                            </div>
                            <div className="detail-item">
                              <i className="fas fa-clock"></i>
                              <span>{event.duration} phút</span>
                            </div>
                          </div>
                          <div className="timeline-actions">
                            <button className="btn btn-sm btn-outline">
                              <i className="fas fa-eye"></i>
                              Chi tiết
                            </button>
                            <button className="btn btn-sm btn-primary">
                              <i className="fas fa-clipboard-check"></i>
                              Điểm danh
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-day">
                      <i className="fas fa-calendar-times"></i>
                      <h3>Không có lịch dạy</h3>
                      <p>Bạn không có lớp học nào trong ngày này</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
