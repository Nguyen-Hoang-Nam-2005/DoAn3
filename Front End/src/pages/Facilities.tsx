import { useEffect, useState } from "react";
import "./facilities.css";

type EquipmentCategory = "cardio" | "strength" | "free-weight" | "accessories";
type EquipmentStatus = "active" | "maintenance" | "broken";

interface Equipment {
  id: number;
  name: string;
  code: string;
  category: EquipmentCategory;
  room: string;
  brand: string;
  purchaseDate: string;
  price: number | null;
  status: EquipmentStatus;
  note: string;
  createdAt: string;
}

interface EquipmentFormData {
  name: string;
  code: string;
  category: EquipmentCategory | "";
  room: string;
  brand: string;
  purchaseDate: string;
  price: string;
  status: EquipmentStatus;
  note: string;
}

interface ToastState {
  message: string;
  type: "success" | "error";
}

const EQUIPMENT_STORAGE_KEY = "gymEquipment";

const rooms = [
  { id: "room1", name: "Phòng 1 - Yoga", icon: "fa-spa" },
  { id: "room2", name: "Phòng 2 - Gym", icon: "fa-dumbbell" },
  { id: "room3", name: "Phòng 3 - Cardio", icon: "fa-heartbeat" },
  { id: "room4", name: "Phòng 4 - Boxing", icon: "fa-fist-raised" },
  { id: "room5", name: "Phòng 5 - Dance", icon: "fa-music" },
];

const categoryOptions: Array<{
  value: "all" | EquipmentCategory;
  label: string;
  icon: string;
}> = [
  { value: "all", label: "Tất cả", icon: "fa-th-large" },
  { value: "cardio", label: "Cardio", icon: "fa-heartbeat" },
  { value: "strength", label: "Strength", icon: "fa-dumbbell" },
  {
    value: "free-weight",
    label: "Free Weight",
    icon: "fa-weight-hanging",
  },
  { value: "accessories", label: "Phụ kiện", icon: "fa-box" },
];

const categoryIcons: Record<EquipmentCategory, string> = {
  cardio: "fa-heartbeat",
  strength: "fa-dumbbell",
  "free-weight": "fa-weight-hanging",
  accessories: "fa-box",
};

const categoryLabels: Record<EquipmentCategory, string> = {
  cardio: "Cardio",
  strength: "Strength",
  "free-weight": "Free Weight",
  accessories: "Phụ kiện",
};

const defaultFormData = (): EquipmentFormData => ({
  name: "",
  code: "",
  category: "",
  room: "",
  brand: "",
  purchaseDate: "",
  price: "",
  status: "active",
  note: "",
});

const sampleEquipmentSeed = [
  [
    1,
    "Máy chạy bộ Life Fitness",
    "TRD-001",
    "cardio",
    "room3",
    "Life Fitness",
    "2023-01-15",
    85000000,
    "active",
    "",
    "2023-01-15T09:00:00.000Z",
  ],
  [
    2,
    "Máy chạy bộ Life Fitness",
    "TRD-002",
    "cardio",
    "room3",
    "Life Fitness",
    "2023-01-15",
    85000000,
    "active",
    "",
    "2023-01-15T09:30:00.000Z",
  ],
  [
    3,
    "Xe đạp tập Technogym",
    "BIK-001",
    "cardio",
    "room3",
    "Technogym",
    "2023-02-20",
    45000000,
    "active",
    "",
    "2023-02-20T09:00:00.000Z",
  ],
  [
    4,
    "Xe đạp tập Technogym",
    "BIK-002",
    "cardio",
    "room3",
    "Technogym",
    "2023-02-20",
    45000000,
    "maintenance",
    "Thay dây curoa",
    "2023-02-20T09:30:00.000Z",
  ],
  [
    5,
    "Máy elliptical",
    "ELP-001",
    "cardio",
    "room3",
    "Precor",
    "2023-03-10",
    65000000,
    "active",
    "",
    "2023-03-10T09:00:00.000Z",
  ],
  [
    6,
    "Máy đẩy ngực",
    "CHE-001",
    "strength",
    "room2",
    "Hammer Strength",
    "2022-12-01",
    55000000,
    "active",
    "",
    "2022-12-01T09:00:00.000Z",
  ],
  [
    7,
    "Máy kéo cáp",
    "CAB-001",
    "strength",
    "room2",
    "Life Fitness",
    "2022-12-01",
    48000000,
    "active",
    "",
    "2022-12-01T10:00:00.000Z",
  ],
  [
    8,
    "Máy đạp chân",
    "LEG-001",
    "strength",
    "room2",
    "Hammer Strength",
    "2023-01-20",
    52000000,
    "active",
    "",
    "2023-01-20T09:00:00.000Z",
  ],
  [
    9,
    "Smith Machine",
    "SMT-001",
    "strength",
    "room2",
    "Rogue",
    "2023-04-15",
    75000000,
    "active",
    "",
    "2023-04-15T09:00:00.000Z",
  ],
  [
    10,
    "Bộ tạ đơn 1-30kg",
    "DUM-001",
    "free-weight",
    "room2",
    "Rogue",
    "2023-01-10",
    35000000,
    "active",
    "Bộ 30 cặp",
    "2023-01-10T09:00:00.000Z",
  ],
  [
    11,
    "Thanh đòn Olympic",
    "BAR-001",
    "free-weight",
    "room2",
    "Eleiko",
    "2023-02-01",
    15000000,
    "active",
    "",
    "2023-02-01T09:00:00.000Z",
  ],
  [
    12,
    "Bộ đĩa tạ Olympic",
    "PLT-001",
    "free-weight",
    "room2",
    "Eleiko",
    "2023-02-01",
    25000000,
    "active",
    "200kg tổng",
    "2023-02-01T10:00:00.000Z",
  ],
  [
    13,
    "Kettlebell Set",
    "KTB-001",
    "free-weight",
    "room2",
    "Rogue",
    "2023-03-01",
    12000000,
    "active",
    "8-32kg",
    "2023-03-01T09:00:00.000Z",
  ],
  [
    14,
    "Thảm Yoga",
    "MAT-001",
    "accessories",
    "room1",
    "Manduka",
    "2023-05-01",
    500000,
    "active",
    "20 cái",
    "2023-05-01T09:00:00.000Z",
  ],
  [
    15,
    "Bóng tập Yoga",
    "BAL-001",
    "accessories",
    "room1",
    "TRX",
    "2023-05-01",
    300000,
    "active",
    "15 quả",
    "2023-05-01T10:00:00.000Z",
  ],
  [
    16,
    "Dây nhảy Speed Rope",
    "ROP-001",
    "accessories",
    "room4",
    "RX Smart Gear",
    "2023-04-01",
    200000,
    "active",
    "20 cái",
    "2023-04-01T09:00:00.000Z",
  ],
  [
    17,
    "Găng tay Boxing",
    "GLV-001",
    "accessories",
    "room4",
    "Everlast",
    "2023-04-01",
    800000,
    "active",
    "15 đôi",
    "2023-04-01T10:00:00.000Z",
  ],
  [
    18,
    "Bao cát Boxing",
    "BAG-001",
    "accessories",
    "room4",
    "Everlast",
    "2023-04-01",
    5000000,
    "active",
    "5 cái",
    "2023-04-01T11:00:00.000Z",
  ],
] as const;

const sampleEquipment: Equipment[] = sampleEquipmentSeed.map(
  ([
    id,
    name,
    code,
    category,
    room,
    brand,
    purchaseDate,
    price,
    status,
    note,
    createdAt,
  ]) => ({
    id,
    name,
    code,
    category: category as EquipmentCategory,
    room,
    brand,
    purchaseDate,
    price,
    status: status as EquipmentStatus,
    note,
    createdAt,
  }),
);

const isCategory = (value: unknown): value is EquipmentCategory =>
  value === "cardio" ||
  value === "strength" ||
  value === "free-weight" ||
  value === "accessories";

const isStatus = (value: unknown): value is EquipmentStatus =>
  value === "active" || value === "maintenance" || value === "broken";

const normalizeEquipment = (value: unknown): Equipment | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const equipment = value as Partial<Equipment>;

  if (
    typeof equipment.id !== "number" ||
    typeof equipment.name !== "string" ||
    typeof equipment.code !== "string" ||
    !isCategory(equipment.category) ||
    typeof equipment.room !== "string"
  ) {
    return null;
  }

  return {
    id: equipment.id,
    name: equipment.name.trim(),
    code: equipment.code.trim().toUpperCase(),
    category: equipment.category,
    room: equipment.room,
    brand: typeof equipment.brand === "string" ? equipment.brand.trim() : "",
    purchaseDate:
      typeof equipment.purchaseDate === "string" ? equipment.purchaseDate : "",
    price:
      typeof equipment.price === "number" && Number.isFinite(equipment.price)
        ? equipment.price
        : null,
    status: isStatus(equipment.status) ? equipment.status : "active",
    note: typeof equipment.note === "string" ? equipment.note.trim() : "",
    createdAt:
      typeof equipment.createdAt === "string"
        ? equipment.createdAt
        : new Date().toISOString(),
  };
};

const getStatusText = (status: EquipmentStatus) => {
  switch (status) {
    case "active":
      return "Hoạt động";
    case "maintenance":
      return "Bảo trì";
    case "broken":
      return "Hỏng";
    default:
      return status;
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) {
    return "Chưa cập nhật";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Chưa cập nhật";
  }

  return date.toLocaleDateString("vi-VN");
};

const formatCurrency = (amount: number | null) => {
  if (amount === null) {
    return "Chưa cập nhật";
  }

  return `${amount.toLocaleString("vi-VN")}đ`;
};

const Facilities = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | EquipmentCategory>(
    "all",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null,
  );
  const [formData, setFormData] = useState<EquipmentFormData>(defaultFormData);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    // Try API first
    const loadFromAPI = async () => {
      try {
        const res = await fetch("http://localhost:7000/admin/ThietBi");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            console.log("Loaded equipment from API:", data.length);
            // Could map API data to local format here
          }
        }
      } catch {
        /* Backend unavailable */
      }
    };
    loadFromAPI();

    try {
      const rawStoredEquipment = localStorage.getItem(EQUIPMENT_STORAGE_KEY);

      if (rawStoredEquipment !== null) {
        const storedEquipment = JSON.parse(rawStoredEquipment) as unknown[];

        if (Array.isArray(storedEquipment)) {
          const normalizedEquipment = storedEquipment
            .map(normalizeEquipment)
            .filter((item): item is Equipment => item !== null);

          if (storedEquipment.length === 0 || normalizedEquipment.length > 0) {
            setEquipment(normalizedEquipment);
            return;
          }
        }
      }
    } catch {
      localStorage.removeItem(EQUIPMENT_STORAGE_KEY);
    }

    localStorage.setItem(
      EQUIPMENT_STORAGE_KEY,
      JSON.stringify(sampleEquipment),
    );
    setEquipment(sampleEquipment);
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toast]);

  useEffect(() => {
    const hasModalOpen = showAddModal || selectedEquipment !== null;
    document.body.style.overflow = hasModalOpen ? "hidden" : "";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      setShowAddModal(false);
      setSelectedEquipment(null);
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [showAddModal, selectedEquipment]);

  const saveEquipment = (nextEquipment: Equipment[]) => {
    setEquipment(nextEquipment);
    localStorage.setItem(EQUIPMENT_STORAGE_KEY, JSON.stringify(nextEquipment));
  };

  const showToast = (message: string, type: ToastState["type"]) => {
    setToast({ message, type });
  };

  const resetForm = () => {
    setFormData(defaultFormData());
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const closeDetailModal = () => {
    setSelectedEquipment(null);
  };

  const handleAddEquipment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = formData.name.trim();
    const code = formData.code.trim().toUpperCase();
    const brand = formData.brand.trim();
    const note = formData.note.trim();

    if (!name || !code || !formData.category || !formData.room) {
      showToast("Vui lòng điền đầy đủ thông tin bắt buộc.", "error");
      return;
    }

    if (
      equipment.some(
        (item) => item.code.trim().toUpperCase() === code.toUpperCase(),
      )
    ) {
      showToast("Mã thiết bị đã tồn tại.", "error");
      return;
    }

    const nextEquipment: Equipment[] = [
      ...equipment,
      {
        id: equipment.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1,
        name,
        code,
        category: formData.category,
        room: formData.room,
        brand,
        purchaseDate: formData.purchaseDate,
        price: formData.price ? Number.parseInt(formData.price, 10) : null,
        status: formData.status,
        note,
        createdAt: new Date().toISOString(),
      },
    ];

    saveEquipment(nextEquipment);
    closeAddModal();
    showToast("Đã thêm thiết bị mới thành công.", "success");
  };

  const handleToggleMaintenance = () => {
    if (!selectedEquipment) {
      return;
    }

    const nextStatus: EquipmentStatus =
      selectedEquipment.status === "maintenance" ? "active" : "maintenance";
    const nextEquipment = equipment.map((item) =>
      item.id === selectedEquipment.id ? { ...item, status: nextStatus } : item,
    );

    saveEquipment(nextEquipment);
    closeDetailModal();
    showToast(
      nextStatus === "maintenance"
        ? "Thiết bị đã được chuyển sang bảo trì."
        : "Thiết bị đã được đánh dấu hoạt động trở lại.",
      "success",
    );
  };

  const handleDeleteEquipment = () => {
    if (!selectedEquipment) {
      return;
    }

    if (
      !window.confirm(
        `Bạn có chắc muốn xóa thiết bị "${selectedEquipment.name}" không?`,
      )
    ) {
      return;
    }

    const nextEquipment = equipment.filter(
      (item) => item.id !== selectedEquipment.id,
    );

    saveEquipment(nextEquipment);
    closeDetailModal();
    showToast("Đã xóa thiết bị khỏi danh sách.", "success");
  };

  const visibleEquipment = equipment.filter((item) => {
    const matchesFilter =
      activeFilter === "all" ? true : item.category === activeFilter;

    if (!matchesFilter) {
      return false;
    }

    if (!searchTerm.trim()) {
      return true;
    }

    const normalizedSearch = searchTerm.trim().toLowerCase();

    return (
      item.name.toLowerCase().includes(normalizedSearch) ||
      item.code.toLowerCase().includes(normalizedSearch) ||
      item.brand.toLowerCase().includes(normalizedSearch) ||
      categoryLabels[item.category].toLowerCase().includes(normalizedSearch)
    );
  });

  const totalEquipment = equipment.length;
  const activeEquipmentCount = equipment.filter(
    (item) => item.status === "active",
  ).length;
  const maintenanceEquipmentCount = equipment.filter(
    (item) => item.status === "maintenance",
  ).length;

  return (
    <div className="facilities-page">
      <div className="page-header">
        <div className="page-title">
          <h1>
            <i className="fas fa-dumbbell"></i> Quản lý thiết bị
          </h1>
          <p>Quản lý thiết bị và cơ sở vật chất phòng tập</p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={openAddModal}
          >
            <i className="fas fa-plus"></i> Thêm thiết bị
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <i className="fas fa-dumbbell"></i>
          </div>
          <div className="stat-info">
            <p>Tổng thiết bị</p>
            <h3>{totalEquipment}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-info">
            <p>Hoạt động tốt</p>
            <h3>{activeEquipmentCount}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <i className="fas fa-tools"></i>
          </div>
          <div className="stat-info">
            <p>Đang bảo trì</p>
            <h3>{maintenanceEquipmentCount}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <i className="fas fa-door-open"></i>
          </div>
          <div className="stat-info">
            <p>Số phòng</p>
            <h3>{rooms.length}</h3>
          </div>
        </div>
      </div>

      <div className="filter-tabs">
        {categoryOptions.map((category) => (
          <button
            key={category.value}
            type="button"
            className={`filter-tab ${
              activeFilter === category.value ? "active" : ""
            }`}
            onClick={() => setActiveFilter(category.value)}
          >
            <i className={`fas ${category.icon}`}></i>
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      <div className="facilities-toolbar">
        <label className="facilities-search">
          <i className="fas fa-search"></i>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Tìm theo tên thiết bị, mã hoặc hãng sản xuất..."
          />
        </label>
        <div className="toolbar-meta">
          <span className="toolbar-count">{visibleEquipment.length}</span>
          <span>
            thiết bị đang hiển thị
            {activeFilter !== "all"
              ? ` trong nhóm ${categoryLabels[activeFilter]}`
              : ""}
          </span>
        </div>
      </div>

      <div className="equipment-grid">
        {visibleEquipment.length > 0 ? (
          visibleEquipment.map((item) => {
            const room = rooms.find(
              (currentRoom) => currentRoom.id === item.room,
            );

            return (
              <article
                key={item.id}
                className="equipment-card"
                onClick={() => setSelectedEquipment(item)}
              >
                <div className="equipment-card-header">
                  <div className={`equipment-icon ${item.category}`}>
                    <i className={`fas ${categoryIcons[item.category]}`}></i>
                  </div>
                  <div className="equipment-info">
                    <h3>{item.name}</h3>
                    <span className="equipment-code">{item.code}</span>
                  </div>
                  <span className={`equipment-status ${item.status}`}>
                    {getStatusText(item.status)}
                  </span>
                </div>
                <div className="equipment-card-body">
                  <div className="equipment-meta">
                    <div className="meta-item">
                      <i className="fas fa-door-open"></i>
                      <span>{room?.name || "Chưa phân phòng"}</span>
                    </div>
                    <div className="meta-item">
                      <i className="fas fa-industry"></i>
                      <span>{item.brand || "Chưa cập nhật hãng"}</span>
                    </div>
                    <div className="meta-item">
                      <i className="fas fa-calendar"></i>
                      <span>Mua: {formatDate(item.purchaseDate)}</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="empty-equipment">
            <i
              className={`fas ${searchTerm.trim() ? "fa-search" : "fa-dumbbell"}`}
            ></i>
            <h3>
              {searchTerm.trim()
                ? "Không tìm thấy thiết bị phù hợp"
                : "Chưa có thiết bị trong danh mục này"}
            </h3>
            <p>
              {searchTerm.trim()
                ? "Thử đổi từ khóa hoặc chọn lại nhóm thiết bị."
                : 'Nhấn "Thêm thiết bị" để bổ sung dữ liệu mới.'}
            </p>
          </div>
        )}
      </div>

      <section className="card rooms-card">
        <div className="card-header">
          <h2>
            <i className="fas fa-door-open"></i> Danh sách phòng tập
          </h2>
        </div>
        <div className="card-body">
          <div className="rooms-grid">
            {rooms.map((room) => {
              const roomEquipment = equipment.filter(
                (item) => item.room === room.id,
              );
              const roomActiveCount = roomEquipment.filter(
                (item) => item.status === "active",
              ).length;
              const roomMaintenanceCount = roomEquipment.filter(
                (item) => item.status === "maintenance",
              ).length;

              return (
                <article key={room.id} className="room-card">
                  <div className="room-card-header">
                    <h4>
                      <i className={`fas ${room.icon}`}></i> {room.name}
                    </h4>
                    <span className="room-equipment-count">
                      {roomEquipment.length} thiết bị
                    </span>
                  </div>
                  <div className="room-stats">
                    <div className="room-stat active">
                      <i className="fas fa-circle"></i>
                      <span>{roomActiveCount} hoạt động</span>
                    </div>
                    <div className="room-stat maintenance">
                      <i className="fas fa-circle"></i>
                      <span>{roomMaintenanceCount} bảo trì</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {showAddModal && (
        <div className="modal">
          <div className="modal-overlay" onClick={closeAddModal}></div>
          <div className="modal-content facilities-modal">
            <div className="modal-header">
              <h2>
                <i className="fas fa-plus-circle"></i> Thêm thiết bị mới
              </h2>
              <button
                type="button"
                className="close-btn"
                onClick={closeAddModal}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form className="facilities-form" onSubmit={handleAddEquipment}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <i className="fas fa-tag"></i> Tên thiết bị
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(event) =>
                        setFormData({ ...formData, name: event.target.value })
                      }
                      required
                      placeholder="VD: Máy chạy bộ"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <i className="fas fa-barcode"></i> Mã thiết bị
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(event) =>
                        setFormData({ ...formData, code: event.target.value })
                      }
                      required
                      placeholder="VD: TRD-001"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <i className="fas fa-layer-group"></i> Danh mục
                    </label>
                    <select
                      value={formData.category}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          category: event.target.value as
                            | EquipmentCategory
                            | "",
                        })
                      }
                      required
                    >
                      <option value="">Chọn danh mục</option>
                      <option value="cardio">Cardio</option>
                      <option value="strength">Strength</option>
                      <option value="free-weight">Free Weight</option>
                      <option value="accessories">Phụ kiện</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>
                      <i className="fas fa-door-open"></i> Phòng
                    </label>
                    <select
                      value={formData.room}
                      onChange={(event) =>
                        setFormData({ ...formData, room: event.target.value })
                      }
                      required
                    >
                      <option value="">Chọn phòng</option>
                      {rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <i className="fas fa-industry"></i> Hãng sản xuất
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(event) =>
                        setFormData({ ...formData, brand: event.target.value })
                      }
                      placeholder="VD: Life Fitness"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <i className="fas fa-calendar"></i> Ngày mua
                    </label>
                    <input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          purchaseDate: event.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <i className="fas fa-money-bill"></i> Giá mua
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(event) =>
                        setFormData({ ...formData, price: event.target.value })
                      }
                      min="0"
                      placeholder="VD: 50000000"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <i className="fas fa-info-circle"></i> Trạng thái
                    </label>
                    <select
                      value={formData.status}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          status: event.target.value as EquipmentStatus,
                        })
                      }
                    >
                      <option value="active">Hoạt động tốt</option>
                      <option value="maintenance">Đang bảo trì</option>
                      <option value="broken">Hỏng</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <i className="fas fa-sticky-note"></i> Ghi chú
                  </label>
                  <textarea
                    rows={3}
                    value={formData.note}
                    onChange={(event) =>
                      setFormData({ ...formData, note: event.target.value })
                    }
                    placeholder="Ghi chú thêm về tình trạng hoặc số lượng..."
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
                  <i className="fas fa-save"></i> Lưu thiết bị
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedEquipment && (
        <div className="modal">
          <div className="modal-overlay" onClick={closeDetailModal}></div>
          <div className="modal-content facilities-detail-modal">
            <div className="modal-header">
              <h2>
                <i className="fas fa-info-circle"></i> Chi tiết thiết bị
              </h2>
              <button
                type="button"
                className="close-btn"
                onClick={closeDetailModal}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="equipment-detail">
                <div className="equipment-detail-header">
                  <div
                    className={`equipment-detail-icon ${selectedEquipment.category}`}
                  >
                    <i
                      className={`fas ${categoryIcons[selectedEquipment.category]}`}
                    ></i>
                  </div>
                  <div className="equipment-detail-title">
                    <h3>{selectedEquipment.name}</h3>
                    <span className="equipment-code">
                      {selectedEquipment.code}
                    </span>
                  </div>
                  <span
                    className={`equipment-status ${selectedEquipment.status}`}
                  >
                    {getStatusText(selectedEquipment.status)}
                  </span>
                </div>

                <div className="equipment-detail-info">
                  <div className="detail-item">
                    <i className="fas fa-layer-group"></i>
                    <div>
                      <span className="label">Danh mục</span>
                      <span className="value">
                        {categoryLabels[selectedEquipment.category]}
                      </span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-door-open"></i>
                    <div>
                      <span className="label">Phòng</span>
                      <span className="value">
                        {rooms.find(
                          (room) => room.id === selectedEquipment.room,
                        )?.name || "Chưa phân phòng"}
                      </span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-industry"></i>
                    <div>
                      <span className="label">Hãng sản xuất</span>
                      <span className="value">
                        {selectedEquipment.brand || "Chưa cập nhật"}
                      </span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-calendar"></i>
                    <div>
                      <span className="label">Ngày mua</span>
                      <span className="value">
                        {formatDate(selectedEquipment.purchaseDate)}
                      </span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-money-bill"></i>
                    <div>
                      <span className="label">Giá mua</span>
                      <span className="value">
                        {formatCurrency(selectedEquipment.price)}
                      </span>
                    </div>
                  </div>
                  <div className="detail-item detail-item-full">
                    <i className="fas fa-sticky-note"></i>
                    <div>
                      <span className="label">Ghi chú</span>
                      <span className="value">
                        {selectedEquipment.note || "Không có ghi chú"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeDetailModal}
              >
                Đóng
              </button>
              <button
                type="button"
                className="btn btn-warning"
                onClick={handleToggleMaintenance}
              >
                <i className="fas fa-tools"></i>
                {selectedEquipment.status === "maintenance"
                  ? " Đánh dấu hoạt động"
                  : " Chuyển bảo trì"}
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteEquipment}
              >
                <i className="fas fa-trash"></i> Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`facilities-toast ${toast.type}`}>
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
};

export default Facilities;
