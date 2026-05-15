import { useEffect, useState, type FormEvent } from "react";
import "./schedule.css";

type ClassType = "yoga" | "gym" | "cardio" | "boxing" | "dance" | "pt";
type ScheduleColor =
  | "blue"
  | "green"
  | "orange"
  | "purple"
  | "pink"
  | "red"
  | "teal"
  | "indigo"
  | "amber"
  | "cyan";
type RoomKey = "room1" | "room2" | "room3" | "room4" | "room5";
type RepeatType = "none" | "daily" | "weekly";
type ClassFilter = "all" | ClassType;
type TrainerFilter = "all" | `${number}`;
type ToastType = "success" | "error";

interface Trainer {
  id: number;
  name: string;
  specialty: string;
}

interface ScheduleItem {
  id: number;
  classType: ClassType;
  className: string;
  trainerId: number;
  room: RoomKey;
  date: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  color: ScheduleColor;
  registered: number;
  note?: string;
  createdAt?: string;
}

interface ScheduleFormData {
  classType: ClassType | "";
  className: string;
  trainerId: string;
  room: RoomKey | "";
  date: string;
  repeatType: RepeatType;
  startTime: string;
  endTime: string;
  maxParticipants: string;
  color: ScheduleColor;
  note: string;
}

const STORAGE_KEY = "gymSchedules";
const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"] as const;
const TIME_SLOTS = Array.from({ length: 16 }, (_, index) => index + 6);
const CLASS_OPTIONS: Array<{ value: ClassType; label: string }> = [
  { value: "yoga", label: "Yoga" },
  { value: "gym", label: "Gym" },
  { value: "cardio", label: "Cardio" },
  { value: "boxing", label: "Boxing" },
  { value: "dance", label: "Dance" },
  { value: "pt", label: "PT 1-1" },
];
const COLOR_OPTIONS: Array<{ value: ScheduleColor; label: string }> = [
  { value: "blue", label: "Xanh dương" },
  { value: "green", label: "Xanh lá" },
  { value: "orange", label: "Cam" },
  { value: "purple", label: "Tím" },
  { value: "pink", label: "Hồng" },
  { value: "red", label: "Đỏ" },
  { value: "teal", label: "Xanh ngọc" },
  { value: "indigo", label: "Chàm" },
  { value: "amber", label: "Vàng hổ phách" },
  { value: "cyan", label: "Xanh cyan" },
];
const ROOM_OPTIONS: Array<{ value: RoomKey; label: string }> = [
  { value: "room1", label: "Phòng 1 - Yoga" },
  { value: "room2", label: "Phòng 2 - Gym" },
  { value: "room3", label: "Phòng 3 - Cardio" },
  { value: "room4", label: "Phòng 4 - Boxing" },
  { value: "room5", label: "Phòng 5 - Dance" },
];
const TRAINERS: Trainer[] = [
  { id: 1, name: "Nguyễn Văn Hùng", specialty: "Yoga, Gym" },
  { id: 2, name: "Trần Thị Mai", specialty: "Yoga, Dance" },
  { id: 3, name: "Lê Minh Tuấn", specialty: "Gym, Boxing" },
  { id: 4, name: "Phạm Thu Hà", specialty: "Cardio, Dance" },
  { id: 5, name: "Hoàng Văn Nam", specialty: "Boxing, Gym" },
  { id: 6, name: "Vũ Thị Lan", specialty: "Yoga, Cardio" },
  { id: 7, name: "Đặng Quốc Việt", specialty: "PT, Gym" },
  { id: 8, name: "Bùi Thị Hương", specialty: "Dance, Cardio" },
];
const CLASS_ICON_MAP: Record<ClassType, string> = {
  yoga: "fa-spa",
  gym: "fa-dumbbell",
  cardio: "fa-heart-pulse",
  boxing: "fa-hand-fist",
  dance: "fa-music",
  pt: "fa-user-ninja",
};
const CLASS_NAME_MAP: Record<ClassType, string> = {
  yoga: "Yoga",
  gym: "Gym",
  cardio: "Cardio",
  boxing: "Boxing",
  dance: "Dance",
  pt: "PT 1-1",
};
const ROOM_NAME_MAP: Record<RoomKey, string> = {
  room1: "Phòng 1 - Yoga",
  room2: "Phòng 2 - Gym",
  room3: "Phòng 3 - Cardio",
  room4: "Phòng 4 - Boxing",
  room5: "Phòng 5 - Dance",
};

const sortSchedules = (items: ScheduleItem[]) =>
  [...items].sort(
    (left, right) =>
      left.date.localeCompare(right.date) ||
      left.startTime.localeCompare(right.startTime) ||
      left.className.localeCompare(right.className),
  );

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateKey = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const getWeekStart = (date: Date) => {
  const weekStart = new Date(date);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  return weekStart;
};

const calculateDuration = (startTime: string, endTime: string) => {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  return endHour * 60 + endMinute - (startHour * 60 + startMinute);
};

const formatWeekLabel = (weekStart: Date) => {
  const formatter = new Intl.DateTimeFormat("vi-VN", {
    day: "numeric",
    month: "short",
  });
  const weekEnd = addDays(weekStart, 6);
  return `${formatter.format(weekStart)} - ${formatter.format(weekEnd)}`;
};

const formatFullDate = (dateKey: string) =>
  parseDateKey(dateKey).toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const createDefaultFormData = (): ScheduleFormData => ({
  classType: "",
  className: "",
  trainerId: "",
  room: "",
  date: formatDateKey(new Date()),
  repeatType: "none",
  startTime: "",
  endTime: "",
  maxParticipants: "20",
  color: "blue",
  note: "",
});

const createSampleSchedules = (referenceDate: Date): ScheduleItem[] => {
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);
  const todayKey = formatDateKey(today);

  return sortSchedules([
    {
      id: 1,
      classType: "yoga",
      className: "Yoga buổi sáng",
      trainerId: 2,
      room: "room1",
      date: todayKey,
      startTime: "06:00",
      endTime: "07:00",
      maxParticipants: 20,
      color: "purple",
      registered: 15,
      note: "Tập trung kéo giãn và thở sâu.",
    },
    {
      id: 2,
      classType: "gym",
      className: "Gym cơ bản",
      trainerId: 3,
      room: "room2",
      date: todayKey,
      startTime: "08:00",
      endTime: "09:30",
      maxParticipants: 15,
      color: "blue",
      registered: 12,
    },
    {
      id: 3,
      classType: "cardio",
      className: "Cardio đốt mỡ",
      trainerId: 4,
      room: "room3",
      date: todayKey,
      startTime: "10:00",
      endTime: "11:00",
      maxParticipants: 25,
      color: "green",
      registered: 20,
    },
    {
      id: 4,
      classType: "boxing",
      className: "Boxing cơ bản",
      trainerId: 5,
      room: "room4",
      date: todayKey,
      startTime: "14:00",
      endTime: "15:30",
      maxParticipants: 12,
      color: "orange",
      registered: 8,
    },
    {
      id: 5,
      classType: "dance",
      className: "Zumba năng lượng",
      trainerId: 8,
      room: "room5",
      date: todayKey,
      startTime: "17:00",
      endTime: "18:00",
      maxParticipants: 30,
      color: "pink",
      registered: 25,
    },
    {
      id: 6,
      classType: "pt",
      className: "PT 1-1 buổi tối",
      trainerId: 7,
      room: "room2",
      date: todayKey,
      startTime: "19:00",
      endTime: "20:00",
      maxParticipants: 1,
      color: "orange",
      registered: 1,
      note: "Theo dõi chỉ số cơ thể sau buổi tập.",
    },
    {
      id: 7,
      classType: "yoga",
      className: "Yoga phục hồi",
      trainerId: 6,
      room: "room1",
      date: formatDateKey(addDays(today, 1)),
      startTime: "06:30",
      endTime: "07:30",
      maxParticipants: 18,
      color: "purple",
      registered: 11,
    },
    {
      id: 8,
      classType: "gym",
      className: "Gym nâng cao",
      trainerId: 3,
      room: "room2",
      date: formatDateKey(addDays(today, 1)),
      startTime: "09:00",
      endTime: "10:30",
      maxParticipants: 10,
      color: "blue",
      registered: 7,
    },
    {
      id: 9,
      classType: "cardio",
      className: "HIIT buổi chiều",
      trainerId: 4,
      room: "room3",
      date: formatDateKey(addDays(today, 2)),
      startTime: "17:00",
      endTime: "18:00",
      maxParticipants: 20,
      color: "green",
      registered: 15,
    },
    {
      id: 10,
      classType: "dance",
      className: "Dance Fitness",
      trainerId: 8,
      room: "room5",
      date: formatDateKey(addDays(today, 3)),
      startTime: "18:30",
      endTime: "19:30",
      maxParticipants: 24,
      color: "pink",
      registered: 16,
    },
  ]);
};

const loadInitialSchedules = (): ScheduleItem[] => {
  if (typeof window === "undefined") {
    return createSampleSchedules(new Date());
  }

  try {
    const savedSchedules = window.localStorage.getItem(STORAGE_KEY);
    if (!savedSchedules) {
      return createSampleSchedules(new Date());
    }

    const parsedSchedules = JSON.parse(savedSchedules) as unknown;
    if (!Array.isArray(parsedSchedules) || parsedSchedules.length === 0) {
      return createSampleSchedules(new Date());
    }

    return sortSchedules(parsedSchedules as ScheduleItem[]);
  } catch {
    return createSampleSchedules(new Date());
  }
};

export default function Schedule() {
  const [schedules, setSchedules] =
    useState<ScheduleItem[]>(loadInitialSchedules);
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    getWeekStart(new Date()),
  );
  const [filterClass, setFilterClass] = useState<ClassFilter>("all");
  const [filterTrainer, setFilterTrainer] = useState<TrainerFilter>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(
    null,
  );
  const [formData, setFormData] = useState<ScheduleFormData>(
    createDefaultFormData,
  );
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  useEffect(() => {
    // Try loading schedules from API
    const loadFromAPI = async () => {
      try {
        const res = await fetch("http://localhost:7000/admin/Dashboard");
        if (res.ok) {
          console.log("Schedule: Backend connected");
        }
      } catch {
        /* Backend unavailable */
      }
    };
    loadFromAPI();
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayKey = formatDateKey(today);
  const weekEnd = addDays(currentWeekStart, 6);
  const weekLabel = formatWeekLabel(currentWeekStart);
  const filteredSchedules = schedules.filter((schedule) => {
    const classMatches =
      filterClass === "all" || schedule.classType === filterClass;
    const trainerMatches =
      filterTrainer === "all" || schedule.trainerId === Number(filterTrainer);

    return classMatches && trainerMatches;
  });
  const todaySchedules = sortSchedules(
    filteredSchedules.filter((schedule) => schedule.date === todayKey),
  );
  const weekSchedules = schedules.filter((schedule) => {
    const scheduleDate = parseDateKey(schedule.date);
    return scheduleDate >= currentWeekStart && scheduleDate <= weekEnd;
  });
  const selectedSchedule =
    selectedScheduleId === null
      ? null
      : (schedules.find((schedule) => schedule.id === selectedScheduleId) ??
        null);
  const todayClasses = schedules.filter(
    (schedule) => schedule.date === todayKey,
  );
  const totalRegistered = todayClasses.reduce(
    (total, schedule) => total + schedule.registered,
    0,
  );
  const activeTrainerCount = new Set(
    weekSchedules.map((schedule) => schedule.trainerId),
  ).size;
  const weeklyHours = Math.round(
    weekSchedules.reduce((total, schedule) => {
      return total + calculateDuration(schedule.startTime, schedule.endTime);
    }, 0) / 60,
  );
  const hasActiveFilter = filterClass !== "all" || filterTrainer !== "all";

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const openAddModal = () => {
    setFormData(createDefaultFormData());
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setFormData(createDefaultFormData());
  };

  const handleWeekChange = (direction: number) => {
    setCurrentWeekStart((previousWeek) => addDays(previousWeek, direction * 7));
  };

  const handleDeleteSchedule = () => {
    if (!selectedSchedule) {
      return;
    }

    if (window.confirm("Bạn có chắc muốn xóa lịch tập này?")) {
      setSchedules((currentSchedules) =>
        currentSchedules.filter(
          (schedule) => schedule.id !== selectedSchedule.id,
        ),
      );
      setSelectedScheduleId(null);
      showToast("Đã xóa lịch tập thành công!", "success");
    }
  };

  const handleAddSchedule = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !formData.classType ||
      !formData.className.trim() ||
      !formData.trainerId ||
      !formData.room ||
      !formData.date ||
      !formData.startTime ||
      !formData.endTime
    ) {
      showToast("Vui lòng điền đầy đủ thông tin!", "error");
      return;
    }

    if (formData.startTime >= formData.endTime) {
      showToast("Giờ kết thúc phải sau giờ bắt đầu!", "error");
      return;
    }

    const trainerId = Number(formData.trainerId);
    const maxParticipants = Number(formData.maxParticipants);
    if (!Number.isFinite(trainerId) || !Number.isFinite(maxParticipants)) {
      showToast("Dữ liệu lịch tập chưa hợp lệ!", "error");
      return;
    }

    const repeatDates = [formData.date];
    if (formData.repeatType === "daily") {
      for (let index = 1; index <= 30; index += 1) {
        repeatDates.push(
          formatDateKey(addDays(parseDateKey(formData.date), index)),
        );
      }
    }

    if (formData.repeatType === "weekly") {
      for (let index = 1; index <= 4; index += 1) {
        repeatDates.push(
          formatDateKey(addDays(parseDateKey(formData.date), index * 7)),
        );
      }
    }

    const conflictedDate = repeatDates.find((date) =>
      schedules.some((schedule) => {
        if (schedule.date !== date || schedule.room !== formData.room) {
          return false;
        }

        return !(
          formData.endTime <= schedule.startTime ||
          formData.startTime >= schedule.endTime
        );
      }),
    );

    if (conflictedDate) {
      showToast(
        `Phòng đã có lịch trong khung giờ này (${formatFullDate(conflictedDate)}).`,
        "error",
      );
      return;
    }

    const scheduleSeed = Date.now();
    const newSchedules = repeatDates.map((date, index) => ({
      id: scheduleSeed + index,
      classType: formData.classType as ClassType,
      className: formData.className.trim(),
      trainerId,
      room: formData.room as RoomKey,
      date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      maxParticipants,
      color: formData.color,
      registered: 0,
      note: formData.note.trim(),
      createdAt: new Date().toISOString(),
    }));

    setSchedules((currentSchedules) =>
      sortSchedules([...currentSchedules, ...newSchedules]),
    );
    closeAddModal();
    showToast("Đã thêm lịch tập thành công!", "success");
  };

  return (
    <div className="schedule-page">
      <div className="page-header">
        <div className="page-title">
          <h1>
            <i className="fas fa-calendar-alt"></i> Quản lý lịch tập
          </h1>
          <p>Quản lý lịch học các lớp và buổi tập PT theo giao diện cũ</p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={openAddModal}
          >
            <i className="fas fa-plus"></i>
            <span>Thêm lịch tập</span>
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <i className="fas fa-calendar-check"></i>
          </div>
          <div className="stat-info">
            <p>Lớp học hôm nay</p>
            <h3>{todayClasses.length}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-info">
            <p>Học viên đăng ký</p>
            <h3>{totalRegistered}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <i className="fas fa-user-ninja"></i>
          </div>
          <div className="stat-info">
            <p>PT hoạt động</p>
            <h3>{activeTrainerCount}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-info">
            <p>Giờ tập tuần này</p>
            <h3>{weeklyHours}</h3>
          </div>
        </div>
      </div>

      <div className="calendar-controls">
        <div className="calendar-nav">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleWeekChange(-1)}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <h2>{weekLabel}</h2>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleWeekChange(1)}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setCurrentWeekStart(getWeekStart(new Date()))}
          >
            Hôm nay
          </button>
        </div>

        <div className="calendar-filters">
          <div className="calendar-filter-control">
            <select
              value={filterClass}
              onChange={(event) =>
                setFilterClass(event.target.value as ClassFilter)
              }
            >
              <option value="all">Tất cả lớp</option>
              {CLASS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <i className="fas fa-chevron-down" aria-hidden="true"></i>
          </div>
          <div className="calendar-filter-control">
            <select
              value={filterTrainer}
              onChange={(event) =>
                setFilterTrainer(event.target.value as TrainerFilter)
              }
            >
              <option value="all">Tất cả PT</option>
              {TRAINERS.map((trainer) => (
                <option key={trainer.id} value={trainer.id}>
                  {trainer.name}
                </option>
              ))}
            </select>
            <i className="fas fa-chevron-down" aria-hidden="true"></i>
          </div>
        </div>
      </div>

      <div className="card calendar-card">
        <div className="calendar-grid">
          <div className="calendar-header">
            <div className="time-column">Giờ</div>
            {DAY_LABELS.map((dayLabel, index) => {
              const currentDate = addDays(currentWeekStart, index);
              const currentDateKey = formatDateKey(currentDate);
              const isToday = currentDateKey === todayKey;

              return (
                <div
                  key={dayLabel}
                  className={`day-column ${isToday ? "today" : ""}`}
                >
                  <span>{dayLabel}</span>
                  <span className="day-date">
                    {currentDate.getDate()}/{currentDate.getMonth() + 1}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="calendar-body">
            {TIME_SLOTS.map((hour) => (
              <div key={hour} className="time-row">
                <div className="time-cell">
                  {String(hour).padStart(2, "0")}:00
                </div>
                {DAY_LABELS.map((dayLabel, dayIndex) => {
                  const currentDate = addDays(currentWeekStart, dayIndex);
                  const currentDateKey = formatDateKey(currentDate);
                  const isTodayColumn = currentDateKey === todayKey;
                  const cellSchedules = filteredSchedules
                    .filter((schedule) => {
                      const startHour = Number(schedule.startTime.slice(0, 2));
                      return (
                        schedule.date === currentDateKey && startHour === hour
                      );
                    })
                    .sort((left, right) =>
                      left.startTime.localeCompare(right.startTime),
                    );

                  return (
                    <div
                      key={`${dayLabel}-${hour}`}
                      className={`day-cell ${isTodayColumn ? "today-column" : ""}`}
                    >
                      {cellSchedules.map((schedule) => {
                        const trainer = TRAINERS.find(
                          (item) => item.id === schedule.trainerId,
                        );

                        return (
                          <button
                            key={schedule.id}
                            type="button"
                            className={`schedule-event ${schedule.color}`}
                            onClick={() => setSelectedScheduleId(schedule.id)}
                          >
                            <div className="event-title">
                              {schedule.className}
                            </div>
                            <div className="event-time">
                              {schedule.startTime} - {schedule.endTime}
                            </div>
                            <div className="event-trainer">
                              {trainer?.name ?? "Chưa có PT"}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card today-schedule-card">
        <div className="card-header">
          <h2>
            <i className="fas fa-list"></i>{" "}
            {hasActiveFilter ? "Lịch phù hợp hôm nay" : "Lịch tập hôm nay"}
          </h2>
        </div>
        <div className="card-body">
          {todaySchedules.length === 0 ? (
            <div className="empty-schedule">
              <i className="fas fa-calendar-times"></i>
              <h3>Không có lịch phù hợp hôm nay</h3>
              <p>Thử đổi bộ lọc hoặc thêm lịch tập mới để hiển thị tại đây.</p>
            </div>
          ) : (
            <div className="schedule-list">
              {todaySchedules.map((schedule) => {
                const trainer = TRAINERS.find(
                  (item) => item.id === schedule.trainerId,
                );
                const duration = calculateDuration(
                  schedule.startTime,
                  schedule.endTime,
                );

                return (
                  <button
                    key={schedule.id}
                    type="button"
                    className="schedule-item"
                    onClick={() => setSelectedScheduleId(schedule.id)}
                  >
                    <div className="schedule-time">
                      <div className="time">{schedule.startTime}</div>
                      <div className="duration">{duration} phút</div>
                    </div>
                    <div className="schedule-info">
                      <h4>{schedule.className}</h4>
                      <p>
                        <span>
                          <i className="fas fa-user-ninja"></i>{" "}
                          {trainer?.name ?? "Chưa có PT"}
                        </span>
                        <span>
                          <i className="fas fa-map-marker-alt"></i>{" "}
                          {ROOM_NAME_MAP[schedule.room]}
                        </span>
                      </p>
                    </div>
                    <span className={`schedule-badge ${schedule.classType}`}>
                      {CLASS_NAME_MAP[schedule.classType]}
                    </span>
                    <div className="schedule-participants">
                      <i className="fas fa-users"></i>
                      <span>
                        {schedule.registered}/{schedule.maxParticipants}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="modal schedule-modal">
          <div className="modal-overlay" onClick={closeAddModal}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                <i className="fas fa-calendar-plus"></i> Thêm lịch tập mới
              </h2>
              <button
                type="button"
                className="close-btn"
                onClick={closeAddModal}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleAddSchedule}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="classType">
                      <i className="fas fa-dumbbell"></i> Loại lớp
                    </label>
                    <select
                      id="classType"
                      value={formData.classType}
                      onChange={(event) =>
                        setFormData((currentData) => ({
                          ...currentData,
                          classType: event.target
                            .value as ScheduleFormData["classType"],
                        }))
                      }
                      required
                    >
                      <option value="">Chọn loại lớp</option>
                      {CLASS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="className">
                      <i className="fas fa-heading"></i> Tên lớp
                    </label>
                    <input
                      id="className"
                      type="text"
                      placeholder="VD: Yoga buổi sáng"
                      value={formData.className}
                      onChange={(event) =>
                        setFormData((currentData) => ({
                          ...currentData,
                          className: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="trainerId">
                      <i className="fas fa-user-ninja"></i> Huấn luyện viên
                    </label>
                    <select
                      id="trainerId"
                      value={formData.trainerId}
                      onChange={(event) =>
                        setFormData((currentData) => ({
                          ...currentData,
                          trainerId: event.target.value,
                        }))
                      }
                      required
                    >
                      <option value="">Chọn PT</option>
                      {TRAINERS.map((trainer) => (
                        <option key={trainer.id} value={trainer.id}>
                          {trainer.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="room">
                      <i className="fas fa-map-marker-alt"></i> Phòng tập
                    </label>
                    <select
                      id="room"
                      value={formData.room}
                      onChange={(event) =>
                        setFormData((currentData) => ({
                          ...currentData,
                          room: event.target.value as ScheduleFormData["room"],
                        }))
                      }
                      required
                    >
                      <option value="">Chọn phòng</option>
                      {ROOM_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="scheduleDate">
                      <i className="fas fa-calendar"></i> Ngày
                    </label>
                    <input
                      id="scheduleDate"
                      type="date"
                      value={formData.date}
                      onChange={(event) =>
                        setFormData((currentData) => ({
                          ...currentData,
                          date: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="repeatType">
                      <i className="fas fa-redo"></i> Lặp lại
                    </label>
                    <select
                      id="repeatType"
                      value={formData.repeatType}
                      onChange={(event) =>
                        setFormData((currentData) => ({
                          ...currentData,
                          repeatType: event.target.value as RepeatType,
                        }))
                      }
                    >
                      <option value="none">Không lặp</option>
                      <option value="daily">Hàng ngày</option>
                      <option value="weekly">Hàng tuần</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="startTime">
                      <i className="fas fa-clock"></i> Giờ bắt đầu
                    </label>
                    <input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(event) =>
                        setFormData((currentData) => ({
                          ...currentData,
                          startTime: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="endTime">
                      <i className="fas fa-clock"></i> Giờ kết thúc
                    </label>
                    <input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(event) =>
                        setFormData((currentData) => ({
                          ...currentData,
                          endTime: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="maxParticipants">
                      <i className="fas fa-users"></i> Số lượng tối đa
                    </label>
                    <input
                      id="maxParticipants"
                      type="number"
                      min="1"
                      max="50"
                      value={formData.maxParticipants}
                      onChange={(event) =>
                        setFormData((currentData) => ({
                          ...currentData,
                          maxParticipants: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="classColor">
                      <i className="fas fa-palette"></i> Màu hiển thị
                    </label>
                    <select
                      id="classColor"
                      value={formData.color}
                      onChange={(event) =>
                        setFormData((currentData) => ({
                          ...currentData,
                          color: event.target.value as ScheduleColor,
                        }))
                      }
                    >
                      {COLOR_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="scheduleNote">
                    <i className="fas fa-sticky-note"></i> Ghi chú
                  </label>
                  <textarea
                    id="scheduleNote"
                    rows={3}
                    placeholder="Ghi chú thêm..."
                    value={formData.note}
                    onChange={(event) =>
                      setFormData((currentData) => ({
                        ...currentData,
                        note: event.target.value,
                      }))
                    }
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeAddModal}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-save"></i> Lưu lịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedSchedule && (
        <div className="modal schedule-modal">
          <div
            className="modal-overlay"
            onClick={() => setSelectedScheduleId(null)}
          ></div>
          <div className="modal-content modal-sm">
            <div className="modal-header">
              <h2>
                <i className="fas fa-calendar-day"></i> Chi tiết lịch tập
              </h2>
              <button
                type="button"
                className="close-btn"
                onClick={() => setSelectedScheduleId(null)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="schedule-detail">
                <div className="schedule-detail-header">
                  <div
                    className={`schedule-detail-icon ${selectedSchedule.classType}`}
                  >
                    <i
                      className={`fas ${CLASS_ICON_MAP[selectedSchedule.classType]}`}
                    ></i>
                  </div>
                  <div className="schedule-detail-title">
                    <h3>{selectedSchedule.className}</h3>
                    <p>{CLASS_NAME_MAP[selectedSchedule.classType]}</p>
                  </div>
                </div>

                <div className="schedule-detail-info">
                  <div className="detail-row">
                    <i className="fas fa-calendar"></i>
                    <span>{formatFullDate(selectedSchedule.date)}</span>
                  </div>
                  <div className="detail-row">
                    <i className="fas fa-clock"></i>
                    <span>
                      {selectedSchedule.startTime} - {selectedSchedule.endTime}{" "}
                      (
                      {calculateDuration(
                        selectedSchedule.startTime,
                        selectedSchedule.endTime,
                      )}{" "}
                      phút)
                    </span>
                  </div>
                  <div className="detail-row">
                    <i className="fas fa-user-ninja"></i>
                    <span>
                      {
                        TRAINERS.find(
                          (trainer) =>
                            trainer.id === selectedSchedule.trainerId,
                        )?.name
                      }
                    </span>
                  </div>
                  <div className="detail-row">
                    <i className="fas fa-award"></i>
                    <span>
                      {
                        TRAINERS.find(
                          (trainer) =>
                            trainer.id === selectedSchedule.trainerId,
                        )?.specialty
                      }
                    </span>
                  </div>
                  <div className="detail-row">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{ROOM_NAME_MAP[selectedSchedule.room]}</span>
                  </div>
                  <div className="detail-row">
                    <i className="fas fa-users"></i>
                    <span>
                      {selectedSchedule.registered}/
                      {selectedSchedule.maxParticipants} học viên
                    </span>
                  </div>
                  {selectedSchedule.note ? (
                    <div className="detail-row">
                      <i className="fas fa-sticky-note"></i>
                      <span>{selectedSchedule.note}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedScheduleId(null)}
              >
                Đóng
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteSchedule}
              >
                <i className="fas fa-trash"></i> Xóa
              </button>
              <button type="button" className="btn btn-primary" disabled>
                <i className="fas fa-edit"></i> Sửa sau
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast schedule-toast ${toast.type}`}>
          <i
            className={`fas ${
              toast.type === "success"
                ? "fa-check-circle"
                : "fa-exclamation-circle"
            }`}
          ></i>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
