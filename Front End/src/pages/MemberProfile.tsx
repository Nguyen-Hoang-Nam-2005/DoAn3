import { useState, useEffect } from "react";
import MemberSidebar from "../components/layout/MemberSidebar";
import MemberHeader from "../components/layout/MemberHeader";
// import { profileApi } from "../services/api"; // DISABLED - Using local data
import "../styles.css";
import "./memberProfile.css";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  username: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  avatar: string;
}

export default function MemberProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    name: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    phone: "0987654321",
    username: "nguyenvana",
    dateOfBirth: "1995-05-15",
    gender: "male",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    emergencyContact: "Nguyễn Thị B",
    emergencyPhone: "0912345678",
    avatar: "",
  });

  const [editedProfile, setEditedProfile] = useState<ProfileData>(profile);

  useEffect(() => {
    // Try API first
    const loadFromAPI = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (
          token &&
          !token.startsWith("demo-") &&
          !token.startsWith("local-")
        ) {
          const res = await fetch("http://localhost:7000/user/Profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            const apiProfile = {
              name: data.hoTen || "Hội viên",
              email: data.email || "",
              phone: data.soDienThoai || "",
              username: "",
              dateOfBirth: data.ngaySinh
                ? new Date(data.ngaySinh).toISOString().split("T")[0]
                : "",
              gender: data.gioiTinh === "F" ? "female" : "male",
              address: data.diaChi || "",
              emergencyContact: "",
              emergencyPhone: "",
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.hoTen || "HV")}&background=10b981&color=fff&size=200`,
            };
            setProfile(apiProfile);
            setEditedProfile(apiProfile);
            return;
          }
        }
      } catch {
        /* Backend unavailable */
      }

      // Fallback to localStorage
      const defaultProfile = {
        name: localStorage.getItem("memberName") || "Nguyễn Văn A",
        email: "nguyenvana@email.com",
        phone: "0987654321",
        username: "nguyenvana",
        dateOfBirth: "1995-05-15",
        gender: "male",
        address: "123 Đường ABC, Quận 1, TP.HCM",
        emergencyContact: "Nguyễn Thị B",
        emergencyPhone: "0912345678",
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(localStorage.getItem("memberName") || "Nguyễn Văn A")}&background=10b981&color=fff&size=200`,
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
    // USE LOCAL DATA ONLY - No API calls
    setProfile(editedProfile);
    localStorage.setItem("memberName", editedProfile.name);
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
      <MemberSidebar />
      <div className="main-content">
        <MemberHeader />
        <main className="content">
          <div className="profile-page">
            {/* Page Header */}
            <div className="page-header">
              <div className="page-title">
                <h1>
                  <i className="fas fa-user-circle"></i> Hồ sơ của tôi
                </h1>
                <p>Quản lý thông tin cá nhân và cài đặt tài khoản</p>
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
                      <span className="badge badge-primary">
                        <i className="fas fa-star"></i> Hội viên VIP
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
                        <p>Ngày tham gia</p>
                        <strong>01/01/2026</strong>
                      </div>
                    </div>
                    <div className="quick-stat">
                      <div className="stat-icon green">
                        <i className="fas fa-dumbbell"></i>
                      </div>
                      <div className="stat-info">
                        <p>Tổng buổi tập</p>
                        <strong>156 buổi</strong>
                      </div>
                    </div>
                    <div className="quick-stat">
                      <div className="stat-icon orange">
                        <i className="fas fa-fire"></i>
                      </div>
                      <div className="stat-info">
                        <p>Calories đốt</p>
                        <strong>45,230 cal</strong>
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

                {/* Emergency Contact */}
                <div className="card">
                  <div className="card-header">
                    <h3>
                      <i className="fas fa-phone-square"></i> Liên hệ khẩn cấp
                    </h3>
                  </div>
                  <div className="card-body">
                    <div className="form-grid">
                      <div className="form-group">
                        <label>
                          <i className="fas fa-user-friends"></i> Người liên hệ
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="emergencyContact"
                            value={editedProfile.emergencyContact}
                            onChange={handleChange}
                            className="form-control"
                          />
                        ) : (
                          <div className="form-value">
                            {profile.emergencyContact}
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label>
                          <i className="fas fa-phone"></i> Số điện thoại
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            name="emergencyPhone"
                            value={editedProfile.emergencyPhone}
                            onChange={handleChange}
                            className="form-control"
                          />
                        ) : (
                          <div className="form-value">
                            {profile.emergencyPhone}
                          </div>
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
