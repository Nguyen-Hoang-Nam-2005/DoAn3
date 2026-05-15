import { useState, useEffect } from "react";
import TrainerSidebar from "../components/layout/TrainerSidebar";
import TrainerHeader from "../components/layout/TrainerHeader";
import "../styles.css";
import "./trainerProfile.css";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  username: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  specialization: string;
  experience: string;
  certification: string;
  bio: string;
  avatar: string;
}

export default function TrainerProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    name: "Huấn luyện viên",
    email: "trainer@fitzone.com",
    phone: "0987654321",
    username: "trainer",
    dateOfBirth: "1990-03-20",
    gender: "male",
    address: "456 Đường XYZ, Quận 3, TP.HCM",
    specialization: "Yoga, Cardio, Strength Training",
    experience: "5 năm",
    certification: "ACE Certified Personal Trainer, Yoga Alliance RYT-200",
    bio: "Tôi là một huấn luyện viên đam mê giúp mọi người đạt được mục tiêu sức khỏe và thể chất của họ.",
    avatar: "",
  });

  const [editedProfile, setEditedProfile] = useState<ProfileData>(profile);

  useEffect(() => {
    const trainerName =
      localStorage.getItem("trainerName") || "Huấn luyện viên";

    // Try loading from API
    const loadFromAPI = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (
          token &&
          !token.startsWith("demo-") &&
          !token.startsWith("local-")
        ) {
          const maNV = localStorage.getItem("userId");
          if (maNV) {
            const res = await fetch(
              `http://localhost:7000/admin/NhanVien/${maNV}`,
            );
            if (res.ok) {
              const data = await res.json();
              if (data.hoTen) {
                const apiProfile = {
                  name: data.hoTen,
                  email: data.email || "trainer@fitzone.com",
                  phone: data.soDienThoai || "",
                  username: "trainer",
                  dateOfBirth: "",
                  gender: data.gioiTinh === "F" ? "female" : "male",
                  address: data.diaChi || "",
                  specialization: data.chuyenMon || "",
                  experience: "",
                  certification: "",
                  bio: "",
                  avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.hoTen)}&background=8b5cf6&color=fff&size=200`,
                };
                setProfile(apiProfile);
                setEditedProfile(apiProfile);
                return;
              }
            }
          }
        }
      } catch {
        /* Backend unavailable */
      }

      // Fallback
      const defaultProfile = {
        name: trainerName,
        email: "trainer@fitzone.com",
        phone: "0987654321",
        username: "trainer",
        dateOfBirth: "1990-03-20",
        gender: "male",
        address: "456 Đường XYZ, Quận 3, TP.HCM",
        specialization: "Yoga, Cardio, Strength Training",
        experience: "5 năm",
        certification: "ACE Certified Personal Trainer, Yoga Alliance RYT-200",
        bio: "Tôi là một huấn luyện viên đam mê giúp mọi người đạt được mục tiêu sức khỏe và thể chất của họ.",
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(trainerName)}&background=8b5cf6&color=fff&size=200`,
      };
      setProfile(defaultProfile);
      setEditedProfile(defaultProfile);
    };
    loadFromAPI();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleSave = () => {
    setProfile(editedProfile);
    localStorage.setItem("trainerName", editedProfile.name);
    setIsEditing(false);
    alert("Cập nhật thông tin thành công!");
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setEditedProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedProfile((prev) => ({
          ...prev,
          avatar: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const displayProfile = isEditing ? editedProfile : profile;

  return (
    <div className="admin-layout">
      <TrainerSidebar />
      <div className="main-content">
        <TrainerHeader />
        <main className="content">
          <div className="profile-page">
            {/* Page Header */}
            <div className="page-header">
              <div className="page-title">
                <h1>
                  <i className="fas fa-user-circle"></i> Hồ sơ của tôi
                </h1>
                <p>Quản lý thông tin cá nhân và chuyên môn</p>
              </div>
              <div className="page-actions">
                {!isEditing ? (
                  <button className="btn btn-primary" onClick={handleEdit}>
                    <i className="fas fa-edit"></i> Chỉnh sửa
                  </button>
                ) : (
                  <>
                    <button className="btn btn-outline" onClick={handleCancel}>
                      <i className="fas fa-times"></i> Hủy
                    </button>
                    <button className="btn btn-primary" onClick={handleSave}>
                      <i className="fas fa-save"></i> Lưu thay đổi
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Profile Content */}
            <div className="profile-grid">
              {/* Left Column - Avatar & Quick Info */}
              <div className="profile-sidebar">
                <div className="card">
                  <div className="card-body text-center">
                    <div className="profile-avatar-wrapper">
                      <img
                        src={displayProfile.avatar}
                        alt={displayProfile.name}
                        className="profile-avatar-large"
                      />
                      {isEditing && (
                        <label className="avatar-upload-btn">
                          <i className="fas fa-camera"></i>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            style={{ display: "none" }}
                          />
                        </label>
                      )}
                    </div>
                    <h2 className="profile-name">{displayProfile.name}</h2>
                    <p className="profile-email">{displayProfile.email}</p>
                    <div className="profile-badges">
                      <span className="badge badge-success">
                        <i className="fas fa-check-circle"></i> Đã xác thực
                      </span>
                      <span className="badge badge-purple">
                        <i className="fas fa-award"></i> Huấn luyện viên
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="card">
                  <div className="card-header">
                    <h3>
                      <i className="fas fa-chart-line"></i> Thống kê
                    </h3>
                  </div>
                  <div className="card-body">
                    <div className="quick-stat">
                      <div className="stat-icon blue">
                        <i className="fas fa-calendar-check"></i>
                      </div>
                      <div className="stat-info">
                        <p>Ngày bắt đầu</p>
                        <strong>01/01/2020</strong>
                      </div>
                    </div>
                    <div className="quick-stat">
                      <div className="stat-icon green">
                        <i className="fas fa-users"></i>
                      </div>
                      <div className="stat-info">
                        <p>Học viên</p>
                        <strong>45 người</strong>
                      </div>
                    </div>
                    <div className="quick-stat">
                      <div className="stat-icon orange">
                        <i className="fas fa-chalkboard-teacher"></i>
                      </div>
                      <div className="stat-info">
                        <p>Lớp học</p>
                        <strong>12 lớp</strong>
                      </div>
                    </div>
                    <div className="quick-stat">
                      <div className="stat-icon purple">
                        <i className="fas fa-star"></i>
                      </div>
                      <div className="stat-info">
                        <p>Đánh giá</p>
                        <strong>4.8/5.0</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Profile Details */}
              <div className="profile-main">
                {/* Personal Information */}
                <div className="card">
                  <div className="card-header">
                    <h3>
                      <i className="fas fa-user"></i> Thông tin cá nhân
                    </h3>
                  </div>
                  <div className="card-body">
                    <div className="form-grid">
                      <div className="form-group">
                        <label>
                          <i className="fas fa-user"></i> Họ và tên
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="name"
                            value={editedProfile.name}
                            onChange={handleChange}
                            className="form-control"
                          />
                        ) : (
                          <div className="form-value">{profile.name}</div>
                        )}
                      </div>

                      <div className="form-group">
                        <label>
                          <i className="fas fa-envelope"></i> Email
                        </label>
                        {isEditing ? (
                          <input
                            type="email"
                            name="email"
                            value={editedProfile.email}
                            onChange={handleChange}
                            className="form-control"
                          />
                        ) : (
                          <div className="form-value">{profile.email}</div>
                        )}
                      </div>

                      <div className="form-group">
                        <label>
                          <i className="fas fa-phone"></i> Số điện thoại
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            name="phone"
                            value={editedProfile.phone}
                            onChange={handleChange}
                            className="form-control"
                          />
                        ) : (
                          <div className="form-value">{profile.phone}</div>
                        )}
                      </div>

                      <div className="form-group">
                        <label>
                          <i className="fas fa-id-badge"></i> Tên đăng nhập
                        </label>
                        <div className="form-value">{profile.username}</div>
                      </div>

                      <div className="form-group">
                        <label>
                          <i className="fas fa-birthday-cake"></i> Ngày sinh
                        </label>
                        {isEditing ? (
                          <input
                            type="date"
                            name="dateOfBirth"
                            value={editedProfile.dateOfBirth}
                            onChange={handleChange}
                            className="form-control"
                          />
                        ) : (
                          <div className="form-value">
                            {new Date(profile.dateOfBirth).toLocaleDateString(
                              "vi-VN",
                            )}
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label>
                          <i className="fas fa-venus-mars"></i> Giới tính
                        </label>
                        {isEditing ? (
                          <select
                            name="gender"
                            value={editedProfile.gender}
                            onChange={handleChange}
                            className="form-control"
                          >
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                            <option value="other">Khác</option>
                          </select>
                        ) : (
                          <div className="form-value">
                            {profile.gender === "male"
                              ? "Nam"
                              : profile.gender === "female"
                                ? "Nữ"
                                : "Khác"}
                          </div>
                        )}
                      </div>

                      <div className="form-group full-width">
                        <label>
                          <i className="fas fa-map-marker-alt"></i> Địa chỉ
                        </label>
                        {isEditing ? (
                          <textarea
                            name="address"
                            value={editedProfile.address}
                            onChange={handleChange}
                            className="form-control"
                            rows={2}
                          />
                        ) : (
                          <div className="form-value">{profile.address}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="card">
                  <div className="card-header">
                    <h3>
                      <i className="fas fa-briefcase"></i> Thông tin chuyên môn
                    </h3>
                  </div>
                  <div className="card-body">
                    <div className="form-grid">
                      <div className="form-group">
                        <label>
                          <i className="fas fa-dumbbell"></i> Chuyên môn
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="specialization"
                            value={editedProfile.specialization}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="VD: Yoga, Cardio, Strength Training"
                          />
                        ) : (
                          <div className="form-value">
                            {profile.specialization}
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label>
                          <i className="fas fa-clock"></i> Kinh nghiệm
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="experience"
                            value={editedProfile.experience}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="VD: 5 năm"
                          />
                        ) : (
                          <div className="form-value">{profile.experience}</div>
                        )}
                      </div>

                      <div className="form-group full-width">
                        <label>
                          <i className="fas fa-certificate"></i> Chứng chỉ
                        </label>
                        {isEditing ? (
                          <textarea
                            name="certification"
                            value={editedProfile.certification}
                            onChange={handleChange}
                            className="form-control"
                            rows={2}
                            placeholder="VD: ACE Certified Personal Trainer"
                          />
                        ) : (
                          <div className="form-value">
                            {profile.certification}
                          </div>
                        )}
                      </div>

                      <div className="form-group full-width">
                        <label>
                          <i className="fas fa-info-circle"></i> Giới thiệu bản
                          thân
                        </label>
                        {isEditing ? (
                          <textarea
                            name="bio"
                            value={editedProfile.bio}
                            onChange={handleChange}
                            className="form-control"
                            rows={4}
                            placeholder="Giới thiệu về bản thân và phong cách huấn luyện..."
                          />
                        ) : (
                          <div className="form-value">{profile.bio}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Settings */}
                <div className="card">
                  <div className="card-header">
                    <h3>
                      <i className="fas fa-shield-alt"></i> Bảo mật
                    </h3>
                  </div>
                  <div className="card-body">
                    <div className="security-item">
                      <div className="security-info">
                        <h4>
                          <i className="fas fa-key"></i> Mật khẩu
                        </h4>
                        <p>Thay đổi mật khẩu định kỳ để bảo mật tài khoản</p>
                      </div>
                      <button className="btn btn-outline">
                        <i className="fas fa-edit"></i> Đổi mật khẩu
                      </button>
                    </div>
                    <div className="security-item">
                      <div className="security-info">
                        <h4>
                          <i className="fas fa-mobile-alt"></i> Xác thực 2 bước
                        </h4>
                        <p>Tăng cường bảo mật với xác thực 2 yếu tố</p>
                      </div>
                      <button className="btn btn-outline">
                        <i className="fas fa-toggle-off"></i> Bật
                      </button>
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
