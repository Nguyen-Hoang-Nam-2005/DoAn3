import React, { useEffect, useState } from "react";
import "./trainers.css";

type TrainerStatus = "active" | "inactive";
type Gender = "male" | "female";
type Specialty = "fitness" | "yoga" | "boxing" | "cardio" | "strength";

interface Trainer {
  id: number;
  name: string;
  phone: string;
  email: string;
  gender: Gender;
  specialty: Specialty;
  experience: number;
  bio: string;
  rating: number;
  clients: number;
  status: TrainerStatus;
}

interface TrainerFormData {
  name: string;
  phone: string;
  email: string;
  gender: Gender | "";
  specialty: Specialty | "";
  experience: string;
  bio: string;
  status: TrainerStatus;
}

const specialtyLabels: Record<Specialty, string> = {
  fitness: "Fitness",
  yoga: "Yoga",
  boxing: "Boxing",
  cardio: "Cardio",
  strength: "Strength Training",
};

const createDefaultFormData = (): TrainerFormData => ({
  name: "",
  phone: "",
  email: "",
  gender: "",
  specialty: "",
  experience: "",
  bio: "",
  status: "active",
});

const getAvatarUrl = (name: string, gender: Gender) => {
  const avatarBackground = gender === "male" ? "3b82f6" : "ec4899";

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name,
  )}&background=${avatarBackground}&color=fff&size=80`;
};

const getStatusText = (status: TrainerStatus) =>
  status === "active" ? "Đang làm việc" : "Nghỉ phép";

const TRAINERS_STORAGE_KEY = "gymTrainers";

const Trainers: React.FC = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [formData, setFormData] = useState<TrainerFormData>(
    createDefaultFormData(),
  );

  useEffect(() => {
    // Try API first
    const loadFromAPI = async () => {
      try {
        const res = await fetch("http://localhost:7000/admin/NhanVien");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            console.log("Loaded trainers from API:", data.length);
          }
        }
      } catch {
        /* Backend unavailable */
      }
    };
    loadFromAPI();
    loadTrainers();
  }, []);

  useEffect(() => {
    const searchInput = document.querySelector<HTMLInputElement>(
      ".header .search-box input",
    );

    if (!searchInput) return;

    const previousPlaceholder = searchInput.placeholder;
    const handleInput = (event: Event) => {
      const target = event.target as HTMLInputElement;
      setSearchTerm(target.value);
    };

    searchInput.placeholder = "Tìm kiếm PT...";
    searchInput.value = searchTerm;
    searchInput.addEventListener("input", handleInput);

    return () => {
      searchInput.removeEventListener("input", handleInput);
      searchInput.placeholder = previousPlaceholder;
      searchInput.value = "";
    };
  }, []);

  useEffect(() => {
    const searchInput = document.querySelector<HTMLInputElement>(
      ".header .search-box input",
    );

    if (searchInput && searchInput.value !== searchTerm) {
      searchInput.value = searchTerm;
    }
  }, [searchTerm]);

  const loadTrainers = () => {
    const rawStoredTrainers = localStorage.getItem(TRAINERS_STORAGE_KEY);

    if (rawStoredTrainers !== null) {
      try {
        const parsedTrainers = JSON.parse(rawStoredTrainers) as Trainer[];

        if (Array.isArray(parsedTrainers)) {
          setTrainers(parsedTrainers);
          return;
        }
      } catch {
        localStorage.removeItem(TRAINERS_STORAGE_KEY);
      }
    }

    const mockTrainers: Trainer[] = [
      {
        id: 1,
        name: "Trần Văn Hùng",
        phone: "0901234567",
        email: "hung.tran@fitzone.com",
        gender: "male",
        specialty: "fitness",
        experience: 5,
        bio: "Chuyên gia fitness với 5 năm kinh nghiệm, từng đào tạo nhiều vận động viên chuyên nghiệp.",
        rating: 4.8,
        clients: 25,
        status: "active",
      },
      {
        id: 2,
        name: "Nguyễn Thị Mai",
        phone: "0912345678",
        email: "mai.nguyen@fitzone.com",
        gender: "female",
        specialty: "yoga",
        experience: 7,
        bio: "Giảng viên Yoga quốc tế, chứng chỉ RYT-500.",
        rating: 4.9,
        clients: 30,
        status: "active",
      },
      {
        id: 3,
        name: "Lê Minh Tuấn",
        phone: "0923456789",
        email: "tuan.le@fitzone.com",
        gender: "male",
        specialty: "boxing",
        experience: 8,
        bio: "Cựu võ sĩ boxing chuyên nghiệp, HLV đội tuyển quốc gia.",
        rating: 4.7,
        clients: 18,
        status: "active",
      },
      {
        id: 4,
        name: "Phạm Thị Lan",
        phone: "0934567890",
        email: "lan.pham@fitzone.com",
        gender: "female",
        specialty: "cardio",
        experience: 4,
        bio: "Chuyên gia cardio và giảm cân, đã giúp hơn 100 học viên đạt mục tiêu.",
        rating: 4.6,
        clients: 22,
        status: "active",
      },
      {
        id: 5,
        name: "Hoàng Văn Nam",
        phone: "0945678901",
        email: "nam.hoang@fitzone.com",
        gender: "male",
        specialty: "strength",
        experience: 6,
        bio: "HLV strength training, chuyên về tăng cơ và sức mạnh.",
        rating: 4.5,
        clients: 15,
        status: "inactive",
      },
      {
        id: 6,
        name: "Vũ Thị Hương",
        phone: "0956789012",
        email: "huong.vu@fitzone.com",
        gender: "female",
        specialty: "yoga",
        experience: 3,
        bio: "Giảng viên Yoga trẻ đầy nhiệt huyết, chuyên về Yoga trị liệu.",
        rating: 4.4,
        clients: 12,
        status: "active",
      },
    ];

    localStorage.setItem(TRAINERS_STORAGE_KEY, JSON.stringify(mockTrainers));
    setTrainers(mockTrainers);
  };

  const saveTrainers = (nextTrainers: Trainer[]) => {
    setTrainers(nextTrainers);
    localStorage.setItem(TRAINERS_STORAGE_KEY, JSON.stringify(nextTrainers));
  };

  const resetForm = () => {
    setFormData(createDefaultFormData());
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedTrainer(null);
    resetForm();
  };

  const handleAddTrainer = (e: React.FormEvent) => {
    e.preventDefault();

    const gender = formData.gender;
    const specialty = formData.specialty;

    if (!gender || !specialty) return;

    const nextId =
      trainers.reduce((maxId, trainer) => Math.max(maxId, trainer.id), 0) + 1;

    const newTrainer: Trainer = {
      id: nextId,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      gender,
      specialty,
      experience: Number.parseInt(formData.experience, 10),
      bio: formData.bio.trim(),
      rating: 4.5,
      clients: 0,
      status: formData.status,
    };

    saveTrainers([...trainers, newTrainer]);
    closeAddModal();
  };

  const handleEditTrainer = (e: React.FormEvent) => {
    e.preventDefault();

    const gender = formData.gender;
    const specialty = formData.specialty;

    if (!selectedTrainer || !gender || !specialty) return;

    saveTrainers(
      trainers.map((trainer) =>
        trainer.id === selectedTrainer.id
          ? {
              ...trainer,
              name: formData.name.trim(),
              phone: formData.phone.trim(),
              email: formData.email.trim(),
              gender,
              specialty,
              experience: Number.parseInt(formData.experience, 10),
              bio: formData.bio.trim(),
              status: formData.status,
            }
          : trainer,
      ),
    );

    closeEditModal();
  };

  const handleDeleteTrainer = (trainer: Trainer) => {
    if (
      !window.confirm(`Bạn có chắc muốn xóa huấn luyện viên "${trainer.name}"?`)
    ) {
      return;
    }

    saveTrainers(
      trainers.filter((currentTrainer) => currentTrainer.id !== trainer.id),
    );
  };

  const handleToggleTrainerStatus = (trainer: Trainer) => {
    saveTrainers(
      trainers.map((currentTrainer) =>
        currentTrainer.id === trainer.id
          ? {
              ...currentTrainer,
              status:
                currentTrainer.status === "active" ? "inactive" : "active",
            }
          : currentTrainer,
      ),
    );
  };

  const openEditModal = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setFormData({
      name: trainer.name,
      phone: trainer.phone,
      email: trainer.email,
      gender: trainer.gender,
      specialty: trainer.specialty,
      experience: trainer.experience.toString(),
      bio: trainer.bio,
      status: trainer.status,
    });
    setShowEditModal(true);
  };

  const filteredTrainers = trainers.filter((trainer) => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    const matchesSearch =
      normalizedSearchTerm.length === 0 ||
      trainer.name.toLowerCase().includes(normalizedSearchTerm) ||
      trainer.email.toLowerCase().includes(normalizedSearchTerm) ||
      trainer.phone.includes(normalizedSearchTerm);

    const matchesSpecialty =
      filterSpecialty === "all" || trainer.specialty === filterSpecialty;

    const matchesStatus =
      filterStatus === "all" || trainer.status === filterStatus;

    return matchesSearch && matchesSpecialty && matchesStatus;
  });

  const stats = {
    total: trainers.length,
    active: trainers.filter((trainer) => trainer.status === "active").length,
    totalClients: trainers.reduce((sum, trainer) => sum + trainer.clients, 0),
    avgRating:
      trainers.length > 0
        ? (
            trainers.reduce((sum, trainer) => sum + trainer.rating, 0) /
            trainers.length
          ).toFixed(1)
        : "0",
  };

  return (
    <div className="trainers-page">
      <div className="page-header">
        <div className="page-title">
          <h1>
            <i className="fas fa-user-ninja"></i> Quản lý Huấn luyện viên
          </h1>
          <p>Danh sách PT trong hệ thống</p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <i className="fas fa-plus"></i> Thêm PT
          </button>
        </div>
      </div>

      <div className="stats-summary">
        <div className="summary-item">
          <div className="summary-icon blue">
            <i className="fas fa-users"></i>
          </div>
          <div className="summary-content">
            <span className="summary-value">{stats.total}</span>
            <span className="summary-label">Tổng PT</span>
          </div>
        </div>
        <div className="summary-item active">
          <div className="summary-icon green">
            <i className="fas fa-user-check"></i>
          </div>
          <div className="summary-content">
            <span className="summary-value">{stats.active}</span>
            <span className="summary-label">Đang làm việc</span>
          </div>
        </div>
        <div className="summary-item warning">
          <div className="summary-icon orange">
            <i className="fas fa-user-graduate"></i>
          </div>
          <div className="summary-content">
            <span className="summary-value">{stats.totalClients}</span>
            <span className="summary-label">Học viên</span>
          </div>
        </div>
        <div className="summary-item info">
          <div className="summary-icon purple">
            <i className="fas fa-star"></i>
          </div>
          <div className="summary-content">
            <span className="summary-value">{stats.avgRating}</span>
            <span className="summary-label">Đánh giá TB</span>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <select
          value={filterSpecialty}
          onChange={(e) => setFilterSpecialty(e.target.value)}
        >
          <option value="all">Tất cả chuyên môn</option>
          <option value="fitness">Fitness</option>
          <option value="yoga">Yoga</option>
          <option value="boxing">Boxing</option>
          <option value="cardio">Cardio</option>
          <option value="strength">Strength Training</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang làm việc</option>
          <option value="inactive">Nghỉ phép</option>
        </select>
      </div>

      <div className="trainers-grid">
        {filteredTrainers.length > 0 ? (
          filteredTrainers.map((trainer) => (
            <article
              key={trainer.id}
              className={`trainer-card ${trainer.status === "inactive" ? "inactive" : ""}`}
            >
              <div className="trainer-header">
                <span className={`trainer-status ${trainer.status}`}>
                  {getStatusText(trainer.status)}
                </span>
                <img
                  src={getAvatarUrl(trainer.name, trainer.gender)}
                  alt={trainer.name}
                  className="trainer-avatar"
                />
                <h3 className="trainer-name">{trainer.name}</h3>
                <span className="trainer-specialty">
                  {specialtyLabels[trainer.specialty]}
                </span>
              </div>

              <div className="trainer-body">
                <div className="trainer-info">
                  <div className="info-item">
                    <i className="fas fa-phone"></i>
                    <span>{trainer.phone}</span>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-envelope"></i>
                    <span>{trainer.email}</span>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-briefcase"></i>
                    <span>{trainer.experience} năm kinh nghiệm</span>
                  </div>
                </div>

                {trainer.bio && <p className="trainer-bio">{trainer.bio}</p>}

                <div className="trainer-stats">
                  <div className="stat-item">
                    <div className="stat-number">{trainer.clients}</div>
                    <div className="stat-label">Học viên</div>
                  </div>
                  <div className="stat-item">
                    <div className="rating">
                      {Array.from({ length: 5 }, (_, index) => (
                        <i
                          key={`${trainer.id}-star-${index + 1}`}
                          className={`fas fa-star ${
                            index + 1 <= Math.round(trainer.rating)
                              ? ""
                              : "empty"
                          }`}
                        ></i>
                      ))}
                      <span className="rating-value">{trainer.rating}</span>
                    </div>
                    <div className="stat-label">Đánh giá</div>
                  </div>
                </div>
              </div>

              <div className="trainer-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => openEditModal(trainer)}
                >
                  <i className="fas fa-edit"></i> Sửa
                </button>
                <button
                  type="button"
                  className={`btn ${
                    trainer.status === "active" ? "btn-warning" : "btn-success"
                  } btn-sm`}
                  onClick={() => handleToggleTrainerStatus(trainer)}
                >
                  <i
                    className={`fas fa-${
                      trainer.status === "active" ? "pause" : "play"
                    }`}
                  ></i>
                  {trainer.status === "active" ? "Nghỉ phép" : "Làm việc"}
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm trainer-delete-btn"
                  onClick={() => handleDeleteTrainer(trainer)}
                  title={`Xóa ${trainer.name}`}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="empty-state">
            <i className="fas fa-user-ninja"></i>
            <h3>Chưa có huấn luyện viên</h3>
            <p>Nhấn "Thêm PT" để thêm huấn luyện viên mới</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="modal">
          <div className="modal-overlay" onClick={closeAddModal}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                <i className="fas fa-user-plus"></i> Thêm Huấn luyện viên
              </h2>
              <button className="close-btn" onClick={closeAddModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleAddTrainer}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <i className="fas fa-user"></i> Họ và tên
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      placeholder="Nhập họ tên"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <i className="fas fa-phone"></i> Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      required
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <i className="fas fa-envelope"></i> Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                      placeholder="Nhập email"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <i className="fas fa-venus-mars"></i> Giới tính
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gender: e.target.value as Gender | "",
                        })
                      }
                      required
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <i className="fas fa-dumbbell"></i> Chuyên môn
                    </label>
                    <select
                      value={formData.specialty}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specialty: e.target.value as Specialty | "",
                        })
                      }
                      required
                    >
                      <option value="">Chọn chuyên môn</option>
                      <option value="fitness">Fitness</option>
                      <option value="yoga">Yoga</option>
                      <option value="boxing">Boxing</option>
                      <option value="cardio">Cardio</option>
                      <option value="strength">Strength Training</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>
                      <i className="fas fa-certificate"></i> Kinh nghiệm (năm)
                    </label>
                    <input
                      type="number"
                      value={formData.experience}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          experience: e.target.value,
                        })
                      }
                      required
                      min="0"
                      placeholder="VD: 3"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <i className="fas fa-align-left"></i> Giới thiệu
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    rows={3}
                    placeholder="Mô tả ngắn về PT..."
                  />
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
                  <i className="fas fa-save"></i> Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedTrainer && (
        <div className="modal">
          <div className="modal-overlay" onClick={closeEditModal}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                <i className="fas fa-edit"></i> Chỉnh sửa PT
              </h2>
              <button className="close-btn" onClick={closeEditModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleEditTrainer}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <i className="fas fa-user"></i> Họ và tên
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <i className="fas fa-phone"></i> Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <i className="fas fa-envelope"></i> Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <i className="fas fa-dumbbell"></i> Chuyên môn
                    </label>
                    <select
                      value={formData.specialty}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specialty: e.target.value as Specialty | "",
                        })
                      }
                      required
                    >
                      <option value="fitness">Fitness</option>
                      <option value="yoga">Yoga</option>
                      <option value="boxing">Boxing</option>
                      <option value="cardio">Cardio</option>
                      <option value="strength">Strength Training</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <i className="fas fa-certificate"></i> Kinh nghiệm (năm)
                    </label>
                    <input
                      type="number"
                      value={formData.experience}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          experience: e.target.value,
                        })
                      }
                      required
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <i className="fas fa-toggle-on"></i> Trạng thái
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as TrainerStatus,
                        })
                      }
                    >
                      <option value="active">Đang làm việc</option>
                      <option value="inactive">Nghỉ phép</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <i className="fas fa-align-left"></i> Giới thiệu
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeEditModal}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-save"></i> Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trainers;
