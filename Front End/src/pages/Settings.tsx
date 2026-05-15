import { useEffect, useMemo, useRef, useState } from "react";
import "./settings.css";

type GymSettings = {
  gymName: string;
  gymPhone: string;
  gymEmail: string;
  gymAddress: string;
  darkMode: boolean;
  sidebarCollapsed: boolean;
  language: "vi" | "en";
  expiryNotification: boolean;
  reminderDays: "3" | "5" | "7" | "14";
  checkinSound: boolean;
  openTime: string;
  closeTime: string;
  closedDays: "none" | "sunday" | "saturday";
};

const SETTINGS_STORAGE_KEY = "gymSettings";
const THEME_EVENT = "gym:theme-change";
const SIDEBAR_EVENT = "gym:sidebar-collapse-change";
const EXPORT_KEYS = [
  "gymSettings",
  "gymMembers",
  "gymInvoices",
  "gymCheckins",
  "gymSchedules",
  "gymEquipment",
  "gymTrainers",
  "gymPackages",
] as const;

const getDefaultSettings = (): GymSettings => ({
  gymName: "FitZone Gym",
  gymPhone: "0123 456 789",
  gymEmail: "contact@fitzone.vn",
  gymAddress: "123 Đường ABC, Quận XYZ, TP.HCM",
  darkMode: false,
  sidebarCollapsed: false,
  language: "vi",
  expiryNotification: true,
  reminderDays: "7",
  checkinSound: true,
  openTime: "06:00",
  closeTime: "22:00",
  closedDays: "none",
});

const loadStoredSettings = (): GymSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      return getDefaultSettings();
    }

    return { ...getDefaultSettings(), ...JSON.parse(raw) };
  } catch {
    return getDefaultSettings();
  }
};

export default function Settings() {
  const defaultSettings = useMemo(() => getDefaultSettings(), []);
  const [settings, setSettings] = useState<GymSettings>(defaultSettings);
  const [savedMessage, setSavedMessage] = useState("");
  const [savedType, setSavedType] = useState<"success" | "error">("success");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const nextSettings = loadStoredSettings();
    setSettings(nextSettings);

    // Try loading settings from API
    const loadFromAPI = async () => {
      try {
        const res = await fetch("http://localhost:7000/admin/Dashboard");
        if (res.ok) {
          console.log("Settings: Backend connected");
        }
      } catch {
        /* Backend unavailable */
      }
    };
    loadFromAPI();

    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme ? savedTheme === "dark" : nextSettings.darkMode;
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light",
    );

    if (!savedTheme) {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    }

    localStorage.setItem(
      "sidebarCollapsed",
      String(nextSettings.sidebarCollapsed),
    );
  }, []);

  useEffect(() => {
    if (!savedMessage) {
      return;
    }

    const timeout = window.setTimeout(() => setSavedMessage(""), 3000);
    return () => window.clearTimeout(timeout);
  }, [savedMessage]);

  const showStatus = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setSavedType(type);
    setSavedMessage(message);
  };

  const applyTheme = (isDark: boolean) => {
    const theme = isDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    window.dispatchEvent(
      new CustomEvent(THEME_EVENT, {
        detail: { theme },
      }),
    );
  };

  const applySidebarCollapsed = (isCollapsed: boolean) => {
    localStorage.setItem("sidebarCollapsed", String(isCollapsed));
    window.dispatchEvent(
      new CustomEvent(SIDEBAR_EVENT, {
        detail: { collapsed: isCollapsed },
      }),
    );
  };

  const updateSetting = <K extends keyof GymSettings>(
    key: K,
    value: GymSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));

    if (key === "darkMode") {
      applyTheme(value as GymSettings["darkMode"]);
    }

    if (key === "sidebarCollapsed") {
      applySidebarCollapsed(value as GymSettings["sidebarCollapsed"]);
    }
  };

  const saveSettings = () => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    applyTheme(settings.darkMode);
    applySidebarCollapsed(settings.sidebarCollapsed);

    showStatus("Đã lưu cài đặt thành công!");
  };

  const resetSettings = () => {
    if (
      !window.confirm("Bạn có chắc muốn đặt lại tất cả cài đặt về mặc định?")
    ) {
      return;
    }

    setSettings(defaultSettings);
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultSettings));
    applyTheme(defaultSettings.darkMode);
    applySidebarCollapsed(defaultSettings.sidebarCollapsed);

    showStatus("Đã đặt lại cài đặt mặc định!");
  };

  const exportData = () => {
    const exportDataMap = EXPORT_KEYS.reduce<Record<string, unknown>>(
      (acc, key) => {
        try {
          acc[key] = JSON.parse(
            localStorage.getItem(key) || (key === "gymSettings" ? "{}" : "[]"),
          );
        } catch {
          acc[key] = key === "gymSettings" ? {} : [];
        }
        return acc;
      },
      {},
    );

    const payload = {
      ...exportDataMap,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `fitzone-backup-${new Date().toISOString().split("T")[0]}.json`;
    anchor.click();
    URL.revokeObjectURL(url);

    showStatus("Đã xuất dữ liệu thành công!");
  };

  const importData = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || "{}")) as Record<
          string,
          unknown
        >;

        if (
          !window.confirm(
            "Nhập dữ liệu sẽ ghi đè dữ liệu hiện tại. Bạn có chắc muốn tiếp tục?",
          )
        ) {
          return;
        }

        EXPORT_KEYS.forEach((key) => {
          if (parsed[key] !== undefined) {
            localStorage.setItem(key, JSON.stringify(parsed[key]));
          }
        });

        const importedSettings = loadStoredSettings();
        setSettings(importedSettings);
        applyTheme(importedSettings.darkMode);
        applySidebarCollapsed(importedSettings.sidebarCollapsed);

        showStatus("Đã nhập dữ liệu thành công!");
      } catch {
        showStatus("File không hợp lệ!", "error");
      } finally {
        event.target.value = "";
      }
    };

    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (
      !window.confirm(
        "CẢNH BÁO: Hành động này sẽ xóa TẤT CẢ dữ liệu và không thể hoàn tác!",
      )
    ) {
      return;
    }

    if (!window.confirm("Xác nhận lần cuối: Xóa toàn bộ dữ liệu?")) {
      return;
    }

    [
      "gymMembers",
      "gymInvoices",
      "gymCheckins",
      "gymSchedules",
      "gymEquipment",
      "gymTrainers",
      "gymPackages",
    ].forEach((key) => localStorage.removeItem(key));

    showStatus("Đã xóa toàn bộ dữ liệu!");
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1>
            <i className="fas fa-cog"></i> Cài đặt hệ thống
          </h1>
          <p>Quản lý cài đặt và tùy chỉnh hệ thống</p>
        </div>
      </div>

      {savedMessage && (
        <div className={`settings-feedback ${savedType}`}>
          <i
            className={`fas fa-${
              savedType === "success" ? "check-circle" : "exclamation-circle"
            }`}
          ></i>
          <span>{savedMessage}</span>
        </div>
      )}

      <div className="settings-grid">
        <section className="card settings-card">
          <div className="card-header">
            <h2>
              <i className="fas fa-sliders-h"></i> Cài đặt chung
            </h2>
          </div>
          <div className="card-body">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Tên phòng tập</h4>
                <p>Tên hiển thị trên hệ thống</p>
              </div>
              <div className="setting-control">
                <input
                  type="text"
                  value={settings.gymName}
                  onChange={(e) => updateSetting("gymName", e.target.value)}
                />
              </div>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Số điện thoại</h4>
                <p>Số liên hệ của phòng tập</p>
              </div>
              <div className="setting-control">
                <input
                  type="tel"
                  value={settings.gymPhone}
                  onChange={(e) => updateSetting("gymPhone", e.target.value)}
                />
              </div>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Email</h4>
                <p>Email liên hệ</p>
              </div>
              <div className="setting-control">
                <input
                  type="email"
                  value={settings.gymEmail}
                  onChange={(e) => updateSetting("gymEmail", e.target.value)}
                />
              </div>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Địa chỉ</h4>
                <p>Địa chỉ phòng tập</p>
              </div>
              <div className="setting-control">
                <input
                  type="text"
                  value={settings.gymAddress}
                  onChange={(e) => updateSetting("gymAddress", e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="card settings-card">
          <div className="card-header">
            <h2>
              <i className="fas fa-palette"></i> Giao diện
            </h2>
          </div>
          <div className="card-body">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Chế độ tối</h4>
                <p>Bật hoặc tắt giao diện tối</p>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.darkMode}
                    onChange={(e) =>
                      updateSetting("darkMode", e.target.checked)
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Thu gọn sidebar</h4>
                <p>Mặc định thu gọn menu bên</p>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.sidebarCollapsed}
                    onChange={(e) =>
                      updateSetting("sidebarCollapsed", e.target.checked)
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Ngôn ngữ</h4>
                <p>Ngôn ngữ hiển thị</p>
              </div>
              <div className="setting-control">
                <select
                  value={settings.language}
                  onChange={(e) =>
                    updateSetting(
                      "language",
                      e.target.value as GymSettings["language"],
                    )
                  }
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="card settings-card">
          <div className="card-header">
            <h2>
              <i className="fas fa-bell"></i> Thông báo
            </h2>
          </div>
          <div className="card-body">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Thông báo hết hạn</h4>
                <p>Nhắc nhở khi hội viên sắp hết hạn</p>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.expiryNotification}
                    onChange={(e) =>
                      updateSetting("expiryNotification", e.target.checked)
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Số ngày nhắc trước</h4>
                <p>Nhắc trước khi hết hạn bao nhiêu ngày</p>
              </div>
              <div className="setting-control">
                <select
                  value={settings.reminderDays}
                  onChange={(e) =>
                    updateSetting(
                      "reminderDays",
                      e.target.value as GymSettings["reminderDays"],
                    )
                  }
                >
                  <option value="3">3 ngày</option>
                  <option value="5">5 ngày</option>
                  <option value="7">7 ngày</option>
                  <option value="14">14 ngày</option>
                </select>
              </div>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Thông báo check-in</h4>
                <p>Âm thanh khi check-in thành công</p>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.checkinSound}
                    onChange={(e) =>
                      updateSetting("checkinSound", e.target.checked)
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </section>

        <section className="card settings-card">
          <div className="card-header">
            <h2>
              <i className="fas fa-clock"></i> Giờ hoạt động
            </h2>
          </div>
          <div className="card-body">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Giờ mở cửa</h4>
                <p>Thời gian bắt đầu hoạt động</p>
              </div>
              <div className="setting-control">
                <input
                  type="time"
                  value={settings.openTime}
                  onChange={(e) => updateSetting("openTime", e.target.value)}
                />
              </div>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Giờ đóng cửa</h4>
                <p>Thời gian kết thúc hoạt động</p>
              </div>
              <div className="setting-control">
                <input
                  type="time"
                  value={settings.closeTime}
                  onChange={(e) => updateSetting("closeTime", e.target.value)}
                />
              </div>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Ngày nghỉ</h4>
                <p>Các ngày không hoạt động</p>
              </div>
              <div className="setting-control">
                <select
                  value={settings.closedDays}
                  onChange={(e) =>
                    updateSetting(
                      "closedDays",
                      e.target.value as GymSettings["closedDays"],
                    )
                  }
                >
                  <option value="none">Không có</option>
                  <option value="sunday">Chủ nhật</option>
                  <option value="saturday">Thứ 7</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="card settings-card">
          <div className="card-header">
            <h2>
              <i className="fas fa-database"></i> Quản lý dữ liệu
            </h2>
          </div>
          <div className="card-body">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Xuất dữ liệu</h4>
                <p>Tải xuống toàn bộ dữ liệu hệ thống</p>
              </div>
              <div className="setting-control">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={exportData}
                >
                  <i className="fas fa-download"></i> Xuất
                </button>
              </div>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Nhập dữ liệu</h4>
                <p>Khôi phục dữ liệu từ file backup</p>
              </div>
              <div className="setting-control">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={importData}
                >
                  <i className="fas fa-upload"></i> Nhập
                </button>
                <input
                  ref={fileInputRef}
                  className="settings-file-input"
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                />
              </div>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Xóa dữ liệu</h4>
                <p>Xóa toàn bộ dữ liệu, không thể hoàn tác</p>
              </div>
              <div className="setting-control">
                <button
                  className="btn btn-danger btn-sm"
                  onClick={clearAllData}
                >
                  <i className="fas fa-trash"></i> Xóa
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="card settings-card">
          <div className="card-header">
            <h2>
              <i className="fas fa-info-circle"></i> Thông tin
            </h2>
          </div>
          <div className="card-body">
            <div className="about-info">
              <div className="about-logo">
                <div className="logo-icon">
                  <i className="fas fa-dumbbell"></i>
                </div>
                <div>
                  <h3>FitZone Gym Management</h3>
                  <p>Phiên bản 1.0.0</p>
                </div>
              </div>

              <div className="about-details">
                <p>
                  <i className="fas fa-code"></i> Phát triển bởi: FitZone Team
                </p>
                <p>
                  <i className="fas fa-calendar"></i> Cập nhật: Tháng 12, 2024
                </p>
                <p>
                  <i className="fas fa-envelope"></i> Hỗ trợ: support@fitzone.vn
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="settings-actions">
        <button className="btn btn-secondary" onClick={resetSettings}>
          <i className="fas fa-undo"></i> Đặt lại mặc định
        </button>
        <button className="btn btn-primary" onClick={saveSettings}>
          <i className="fas fa-save"></i> Lưu cài đặt
        </button>
      </div>
    </div>
  );
}
