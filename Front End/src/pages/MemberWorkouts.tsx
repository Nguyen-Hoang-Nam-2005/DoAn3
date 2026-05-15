import { useState, useEffect } from "react";
import MemberSidebar from "../components/layout/MemberSidebar";
import MemberHeader from "../components/layout/MemberHeader";
import "../styles.css";
import "./memberWorkouts.css";

interface Exercise {
  id: number;
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  duration?: string;
  completed: boolean;
}

interface WorkoutPlan {
  id: number;
  name: string;
  description: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: number; // minutes
  calories: number;
  exercises: Exercise[];
  daysPerWeek: number;
  createdBy: string;
  isActive: boolean;
}

export default function MemberWorkouts() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Try loading workouts from API
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
            "http://localhost:7000/user/Activity/workouts",
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if (res.ok) {
            console.log("Workouts: API connected");
          }
        }
      } catch {
        /* Backend unavailable */
      }
    };
    loadFromAPI();
  }, []);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock workout plans
  const workoutPlans: WorkoutPlan[] = [
    {
      id: 1,
      name: "Full Body Strength",
      description: "Tập toàn thân tăng cường sức mạnh với tạ",
      category: "Strength",
      difficulty: "Intermediate",
      duration: 60,
      calories: 400,
      daysPerWeek: 3,
      createdBy: "Lê Hoàng Nam",
      isActive: true,
      exercises: [
        {
          id: 1,
          name: "Squat",
          sets: 4,
          reps: "8-10",
          weight: "60kg",
          completed: true,
        },
        {
          id: 2,
          name: "Bench Press",
          sets: 4,
          reps: "8-10",
          weight: "50kg",
          completed: true,
        },
        {
          id: 3,
          name: "Deadlift",
          sets: 3,
          reps: "6-8",
          weight: "80kg",
          completed: false,
        },
        {
          id: 4,
          name: "Pull-ups",
          sets: 3,
          reps: "Max",
          completed: false,
        },
        {
          id: 5,
          name: "Plank",
          sets: 3,
          duration: "60s",
          completed: false,
        },
      ],
    },
    {
      id: 2,
      name: "Cardio HIIT",
      description: "Đốt cháy mỡ với bài tập cường độ cao",
      category: "Cardio",
      difficulty: "Advanced",
      duration: 30,
      calories: 350,
      daysPerWeek: 4,
      createdBy: "Trần Văn Mạnh",
      isActive: false,
      exercises: [
        {
          id: 6,
          name: "Burpees",
          sets: 4,
          reps: "15",
          completed: false,
        },
        {
          id: 7,
          name: "Mountain Climbers",
          sets: 4,
          duration: "45s",
          completed: false,
        },
        {
          id: 8,
          name: "Jump Squats",
          sets: 4,
          reps: "20",
          completed: false,
        },
        {
          id: 9,
          name: "High Knees",
          sets: 4,
          duration: "30s",
          completed: false,
        },
      ],
    },
    {
      id: 3,
      name: "Yoga Flow",
      description: "Tăng cường sự linh hoạt và thư giãn",
      category: "Flexibility",
      difficulty: "Beginner",
      duration: 45,
      calories: 150,
      daysPerWeek: 5,
      createdBy: "Nguyễn Thị Lan",
      isActive: false,
      exercises: [
        {
          id: 10,
          name: "Sun Salutation",
          sets: 3,
          reps: "5 rounds",
          completed: false,
        },
        {
          id: 11,
          name: "Warrior Pose",
          sets: 2,
          duration: "60s each side",
          completed: false,
        },
        {
          id: 12,
          name: "Tree Pose",
          sets: 2,
          duration: "45s each side",
          completed: false,
        },
        {
          id: 13,
          name: "Child's Pose",
          sets: 1,
          duration: "3 minutes",
          completed: false,
        },
      ],
    },
    {
      id: 4,
      name: "Upper Body Focus",
      description: "Tập trung phát triển cơ thân trên",
      category: "Strength",
      difficulty: "Intermediate",
      duration: 50,
      calories: 320,
      daysPerWeek: 2,
      createdBy: "Lê Hoàng Nam",
      isActive: false,
      exercises: [
        {
          id: 14,
          name: "Dumbbell Press",
          sets: 4,
          reps: "10-12",
          weight: "20kg",
          completed: false,
        },
        {
          id: 15,
          name: "Lat Pulldown",
          sets: 4,
          reps: "10-12",
          weight: "40kg",
          completed: false,
        },
        {
          id: 16,
          name: "Shoulder Press",
          sets: 3,
          reps: "10",
          weight: "15kg",
          completed: false,
        },
        {
          id: 17,
          name: "Bicep Curls",
          sets: 3,
          reps: "12",
          weight: "12kg",
          completed: false,
        },
      ],
    },
  ];

  const categories = [
    { value: "all", label: "Tất cả", icon: "fas fa-th" },
    { value: "Strength", label: "Sức mạnh", icon: "fas fa-dumbbell" },
    { value: "Cardio", label: "Cardio", icon: "fas fa-running" },
    { value: "Flexibility", label: "Linh hoạt", icon: "fas fa-spa" },
    { value: "Custom", label: "Tùy chỉnh", icon: "fas fa-edit" },
  ];

  const filteredPlans =
    selectedCategory === "all"
      ? workoutPlans
      : workoutPlans.filter((plan) => plan.category === selectedCategory);

  const activePlan = workoutPlans.find((plan) => plan.isActive);
  const completedExercises = activePlan
    ? activePlan.exercises.filter((ex) => ex.completed).length
    : 0;
  const totalExercises = activePlan ? activePlan.exercises.length : 0;
  const progress =
    totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  const getDifficultyBadge = (difficulty: string) => {
    const badges = {
      Beginner: { class: "success", text: "Cơ bản" },
      Intermediate: { class: "warning", text: "Trung cấp" },
      Advanced: { class: "danger", text: "Nâng cao" },
    };
    return badges[difficulty as keyof typeof badges] || badges.Beginner;
  };

  const toggleExerciseComplete = (exerciseId: number) => {
    // In real app, would update state
    console.log("Toggle exercise:", exerciseId);
  };

  return (
    <div className="admin-layout">
      <MemberSidebar />
      <div className="main-content">
        <MemberHeader />
        <main className="content">
          <div className="workouts-page">
            {/* Page Header */}
            <div className="page-header">
              <div className="page-title">
                <h1>
                  <i className="fas fa-dumbbell"></i> Bài tập của tôi
                </h1>
                <p>Quản lý và theo dõi các bài tập cá nhân</p>
              </div>
              <div className="page-actions">
                <button
                  className="btn btn-outline"
                  onClick={() => setShowCreateModal(true)}
                >
                  <i className="fas fa-plus"></i> Tạo bài tập mới
                </button>
                <button className="btn btn-primary">
                  <i className="fas fa-play"></i> Bắt đầu tập
                </button>
              </div>
            </div>

            {/* Active Workout Progress */}
            {activePlan && (
              <div className="active-workout-card">
                <div className="active-workout-header">
                  <div className="workout-info">
                    <span className="active-badge">
                      <i className="fas fa-circle"></i> Đang tập
                    </span>
                    <h2>{activePlan.name}</h2>
                    <p>{activePlan.description}</p>
                  </div>
                  <div className="workout-progress-circle">
                    <svg viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="8"
                        strokeDasharray={`${progress * 2.827} 282.7`}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="progress-text">
                      <strong>{Math.round(progress)}%</strong>
                      <span>Hoàn thành</span>
                    </div>
                  </div>
                </div>

                <div className="active-workout-exercises">
                  <h3>
                    <i className="fas fa-list-check"></i> Bài tập hôm nay (
                    {completedExercises}/{totalExercises})
                  </h3>
                  <div className="exercises-list">
                    {activePlan.exercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className={`exercise-item ${exercise.completed ? "completed" : ""}`}
                      >
                        <div className="exercise-checkbox">
                          <input
                            type="checkbox"
                            checked={exercise.completed}
                            onChange={() => toggleExerciseComplete(exercise.id)}
                          />
                        </div>
                        <div className="exercise-details">
                          <strong>{exercise.name}</strong>
                          <span className="exercise-specs">
                            {exercise.sets} sets
                            {exercise.reps && ` × ${exercise.reps} reps`}
                            {exercise.weight && ` @ ${exercise.weight}`}
                            {exercise.duration && ` × ${exercise.duration}`}
                          </span>
                        </div>
                        {exercise.completed && (
                          <i className="fas fa-check-circle text-success"></i>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="workout-actions">
                    <button className="btn btn-outline">
                      <i className="fas fa-pause"></i> Tạm dừng
                    </button>
                    <button className="btn btn-success">
                      <i className="fas fa-check"></i> Hoàn thành buổi tập
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Filters and View Mode */}
            <div className="workouts-controls">
              <div className="category-filters">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    className={`category-btn ${selectedCategory === cat.value ? "active" : ""}`}
                    onClick={() => setSelectedCategory(cat.value)}
                  >
                    <i className={cat.icon}></i>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
              <div className="view-mode-toggle">
                <button
                  className={`btn-icon ${viewMode === "grid" ? "active" : ""}`}
                  onClick={() => setViewMode("grid")}
                  title="Lưới"
                >
                  <i className="fas fa-th"></i>
                </button>
                <button
                  className={`btn-icon ${viewMode === "list" ? "active" : ""}`}
                  onClick={() => setViewMode("list")}
                  title="Danh sách"
                >
                  <i className="fas fa-list"></i>
                </button>
              </div>
            </div>

            {/* Workout Plans */}
            <div className={`workouts-${viewMode}`}>
              {filteredPlans.length === 0 ? (
                <div className="card">
                  <div className="card-body text-center">
                    <div className="empty-state">
                      <i className="fas fa-dumbbell"></i>
                      <h3>Chưa có bài tập</h3>
                      <p>Tạo bài tập mới hoặc chọn danh mục khác</p>
                      <button
                        className="btn btn-primary"
                        onClick={() => setShowCreateModal(true)}
                      >
                        <i className="fas fa-plus"></i> Tạo bài tập đầu tiên
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                filteredPlans.map((plan) => (
                  <div key={plan.id} className="workout-card">
                    {plan.isActive && (
                      <div className="workout-active-badge">
                        <i className="fas fa-circle"></i> Đang tập
                      </div>
                    )}
                    <div className="workout-card-header">
                      <h3>{plan.name}</h3>
                      <span
                        className={`difficulty-badge ${getDifficultyBadge(plan.difficulty).class}`}
                      >
                        {getDifficultyBadge(plan.difficulty).text}
                      </span>
                    </div>
                    <p className="workout-description">{plan.description}</p>

                    <div className="workout-stats">
                      <div className="stat">
                        <i className="fas fa-clock"></i>
                        <span>{plan.duration} phút</span>
                      </div>
                      <div className="stat">
                        <i className="fas fa-fire"></i>
                        <span>{plan.calories} cal</span>
                      </div>
                      <div className="stat">
                        <i className="fas fa-calendar-week"></i>
                        <span>{plan.daysPerWeek}x/tuần</span>
                      </div>
                      <div className="stat">
                        <i className="fas fa-list"></i>
                        <span>{plan.exercises.length} bài</span>
                      </div>
                    </div>

                    <div className="workout-trainer">
                      <i className="fas fa-user-tie"></i>
                      <span>HLV: {plan.createdBy}</span>
                    </div>

                    <div className="workout-card-actions">
                      <button className="btn btn-outline btn-sm">
                        <i className="fas fa-eye"></i> Xem chi tiết
                      </button>
                      {!plan.isActive && (
                        <button className="btn btn-primary btn-sm">
                          <i className="fas fa-play"></i> Bắt đầu
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
