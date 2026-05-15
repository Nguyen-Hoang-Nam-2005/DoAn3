import React, { useEffect, useState } from "react";
import "./packages.css";

type PackageStatus = "active" | "inactive";
type PackageCategory = "membership" | "pt" | "service";

interface Package {
  id: number;
  name: string;
  duration: number;
  price: number;
  description: string;
  features: string[];
  color: string;
  status: PackageStatus;
  memberCount: number;
  isPopular: boolean;
  category: PackageCategory;
}

interface PackageFormData {
  name: string;
  duration: string;
  price: string;
  description: string;
  features: string;
  color: string;
  status: PackageStatus;
  category: PackageCategory;
}

const createDefaultFormData = (): PackageFormData => ({
  name: "",
  duration: "",
  price: "",
  description: "",
  features: "",
  color: "blue",
  status: "active",
  category: "membership",
});

const PACKAGES_STORAGE_KEY = "gymPackages";
const MEMBERS_STORAGE_KEY = "gymMembers";
const UNASSIGNED_PACKAGE_NAME = "Chưa gán gói tập";

const getPackageIcon = (duration: number) => {
  if (duration <= 30) return "box";
  if (duration <= 90) return "boxes-stacked";
  if (duration <= 180) return "gem";
  return "crown";
};

const formatCurrency = (amount: number) => `${amount.toLocaleString("vi-VN")}đ`;

const createMockPackages = (): Package[] => [
  // ── GÓI TẬP ──────────────────────────────────────────
  {
    id: 1,
    name: "Gói Basic 1 tháng",
    duration: 30,
    price: 500000,
    description: "Gói tập cơ bản cho người mới bắt đầu",
    features: ["Tập không giới hạn", "Phòng tập đa năng", "Tủ đồ cá nhân"],
    color: "blue",
    status: "active",
    memberCount: 45,
    isPopular: false,
    category: "membership",
  },
  {
    id: 2,
    name: "Gói Standard 3 tháng",
    duration: 90,
    price: 1200000,
    description: "Gói tập tiêu chuẩn với nhiều ưu đãi",
    features: [
      "Tập không giới hạn",
      "Phòng xông hơi",
      "Tủ đồ cá nhân",
      "1 buổi PT miễn phí",
      "Đo InBody định kỳ",
    ],
    color: "green",
    status: "active",
    memberCount: 78,
    isPopular: true,
    category: "membership",
  },
  {
    id: 3,
    name: "Gói Premium 6 tháng",
    duration: 180,
    price: 2000000,
    description: "Gói tập cao cấp với đầy đủ tiện ích",
    features: [
      "Tập không giới hạn",
      "Phòng xông hơi",
      "Tủ đồ cá nhân",
      "3 buổi PT miễn phí",
      "Nước uống miễn phí",
    ],
    color: "purple",
    status: "active",
    memberCount: 62,
    isPopular: false,
    category: "membership",
  },
  {
    id: 4,
    name: "Gói VIP 12 tháng",
    duration: 365,
    price: 3500000,
    description: "Gói tập VIP với quyền lợi tốt nhất",
    features: [
      "Tập không giới hạn",
      "Phòng xông hơi & Spa",
      "Tủ đồ cá nhân",
      "10 buổi PT miễn phí",
      "Nước uống miễn phí",
      "Khăn tắm miễn phí",
      "Ưu tiên đặt lịch huấn luyện",
    ],
    color: "gold",
    status: "active",
    memberCount: 34,
    isPopular: false,
    category: "membership",
  },
  {
    id: 5,
    name: "Gói Yoga & Pilates",
    duration: 30,
    price: 800000,
    description: "Tham gia tất cả lớp Yoga và Pilates trong tháng",
    features: [
      "Yoga mỗi ngày",
      "Pilates 3 buổi/tuần",
      "Thảm tập riêng",
      "Phòng thiền định",
      "Nước detox miễn phí",
    ],
    color: "green",
    status: "active",
    memberCount: 35,
    isPopular: false,
    category: "membership",
  },
  {
    id: 6,
    name: "Gói Boxing & MMA",
    duration: 30,
    price: 1000000,
    description: "Lớp Boxing và MMA cho mọi cấp độ",
    features: [
      "Boxing 5 buổi/tuần",
      "MMA cơ bản",
      "Găng tay & băng tay",
      "Sparring có HLV",
      "Thể lực chuyên biệt",
    ],
    color: "red",
    status: "active",
    memberCount: 15,
    isPopular: false,
    category: "membership",
  },
  {
    id: 7,
    name: "Gói Gia đình",
    duration: 30,
    price: 1800000,
    description: "Gói tập cho 2-4 thành viên gia đình",
    features: [
      "2-4 thành viên",
      "Tập không giới hạn",
      "Lớp gia đình cuối tuần",
      "Tủ đồ chung",
      "Giảm 20% dịch vụ khác",
    ],
    color: "blue",
    status: "active",
    memberCount: 12,
    isPopular: false,
    category: "membership",
  },
  // ── GÓI PT ───────────────────────────────────────────
  {
    id: 8,
    name: "Gói PT 5 buổi",
    duration: 30,
    price: 1400000,
    description: "5 buổi tập cá nhân với huấn luyện viên",
    features: [
      "5 buổi PT 1-1",
      "Lịch tập linh hoạt",
      "Theo dõi tiến độ",
      "Tư vấn dinh dưỡng",
    ],
    color: "orange",
    status: "active",
    memberCount: 20,
    isPopular: false,
    category: "pt",
  },
  {
    id: 9,
    name: "Gói PT 10 buổi",
    duration: 60,
    price: 2500000,
    description: "10 buổi tập cá nhân - Tiết kiệm 7%",
    features: [
      "10 buổi PT 1-1",
      "Lịch tập cá nhân hóa",
      "Theo dõi tiến độ",
      "Tư vấn dinh dưỡng",
      "Đo InBody trước & sau",
    ],
    color: "orange",
    status: "active",
    memberCount: 28,
    isPopular: true,
    category: "pt",
  },
  {
    id: 10,
    name: "Gói PT 20 buổi",
    duration: 90,
    price: 4500000,
    description: "20 buổi tập cá nhân - Tiết kiệm 10%",
    features: [
      "20 buổi PT 1-1",
      "Lịch tập cá nhân hóa",
      "Theo dõi tiến độ",
      "Tư vấn dinh dưỡng",
      "Đo InBody định kỳ",
      "Video hướng dẫn tại nhà",
    ],
    color: "orange",
    status: "active",
    memberCount: 19,
    isPopular: false,
    category: "pt",
  },
  {
    id: 11,
    name: "Gói PT Giảm cân",
    duration: 60,
    price: 3000000,
    description: "Chương trình giảm cân chuyên biệt 2 tháng",
    features: [
      "12 buổi PT 1-1",
      "Kế hoạch ăn kiêng",
      "Đo mỡ cơ thể hàng tuần",
      "Hỗ trợ 24/7 qua app",
      "Cam kết kết quả",
    ],
    color: "red",
    status: "active",
    memberCount: 14,
    isPopular: false,
    category: "pt",
  },
  // ── DỊCH VỤ ──────────────────────────────────────────
  {
    id: 12,
    name: "Gói Spa & Massage",
    duration: 30,
    price: 1500000,
    description: "Dịch vụ spa và massage thư giãn sau tập",
    features: [
      "Massage 4 buổi/tháng",
      "Xông hơi không giới hạn",
      "Bể sục jacuzzi",
      "Phòng muối Himalaya",
      "Liệu pháp lạnh",
    ],
    color: "purple",
    status: "active",
    memberCount: 22,
    isPopular: false,
    category: "service",
  },
  {
    id: 13,
    name: "Dịch vụ Đo InBody",
    duration: 30,
    price: 300000,
    description: "Đo thành phần cơ thể chuyên nghiệp",
    features: [
      "Đo InBody 4 lần/tháng",
      "Báo cáo chi tiết",
      "Tư vấn chuyên gia",
      "Theo dõi tiến độ",
    ],
    color: "blue",
    status: "active",
    memberCount: 40,
    isPopular: false,
    category: "service",
  },
  {
    id: 14,
    name: "Dịch vụ Dinh dưỡng",
    duration: 30,
    price: 500000,
    description: "Tư vấn dinh dưỡng cá nhân hóa",
    features: [
      "4 buổi tư vấn/tháng",
      "Thực đơn cá nhân hóa",
      "Theo dõi qua app",
      "Điều chỉnh linh hoạt",
    ],
    color: "green",
    status: "active",
    memberCount: 18,
    isPopular: false,
    category: "service",
  },
  {
    id: 15,
    name: "Gói Phục hồi chức năng",
    duration: 30,
    price: 2000000,
    description: "Phục hồi chấn thương và tăng cường sức khỏe",
    features: [
      "8 buổi vật lý trị liệu",
      "Đánh giá chấn thương",
      "Bài tập phục hồi",
      "Thiết bị chuyên dụng",
      "Theo dõi tiến độ",
    ],
    color: "gold",
    status: "active",
    memberCount: 8,
    isPopular: false,
    category: "service",
  },
];

const syncMembersWithPackages = (nextPackages: Package[]) => {
  try {
    const storedMembers = JSON.parse(
      localStorage.getItem(MEMBERS_STORAGE_KEY) || "[]",
    ) as Array<Record<string, unknown>>;

    if (!Array.isArray(storedMembers) || storedMembers.length === 0) {
      return;
    }

    const packageMap = new Map(nextPackages.map((pkg) => [pkg.id, pkg]));
    const normalizedMembers = storedMembers.map((member) => {
      const packageId = Number(member.packageId ?? 0);
      const matchedPackage = packageMap.get(packageId);

      if (!matchedPackage) {
        return {
          ...member,
          packageId: 0,
          packageName: UNASSIGNED_PACKAGE_NAME,
        };
      }

      return {
        ...member,
        packageId: matchedPackage.id,
        packageName: matchedPackage.name,
      };
    });

    localStorage.setItem(
      MEMBERS_STORAGE_KEY,
      JSON.stringify(normalizedMembers),
    );
  } catch {
    // Ignore invalid stored member data.
  }
};

const Packages: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<PackageCategory | "all">(
    "all",
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [formData, setFormData] = useState<PackageFormData>(
    createDefaultFormData(),
  );

  useEffect(() => {
    // Load from API first, fallback to localStorage
    const loadFromAPI = async () => {
      try {
        const res = await fetch("http://localhost:7000/admin/GoiTap");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped: Package[] = data.map((pkg: any) => ({
              id: pkg.id,
              name: pkg.name || "",
              duration: pkg.duration || 30,
              price: Number(pkg.price) || 0,
              description: pkg.description || "",
              features: Array.isArray(pkg.features) ? pkg.features : [],
              color: pkg.color || "blue",
              status: (pkg.status === "active"
                ? "active"
                : "inactive") as PackageStatus,
              memberCount: pkg.memberCount || 0,
              isPopular: pkg.isPopular || false,
              category: (pkg.category || "membership") as PackageCategory,
            }));
            setPackages(mapped);
            localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(mapped));
            return;
          }
        }
      } catch {
        /* Backend unavailable */
      }
      loadPackages();
    };
    loadFromAPI();
  }, []);

  useEffect(() => {
    const handleDataUpdate = () => {
      loadPackages();
    };

    window.addEventListener("focus", handleDataUpdate);
    window.addEventListener("storage", handleDataUpdate);
    window.addEventListener("gymDataUpdated", handleDataUpdate);

    return () => {
      window.removeEventListener("focus", handleDataUpdate);
      window.removeEventListener("storage", handleDataUpdate);
      window.removeEventListener("gymDataUpdated", handleDataUpdate);
    };
  }, []);

  const loadPackages = () => {
    const getStoredMemberCountByPackage = () => {
      try {
        const storedMembers = JSON.parse(
          localStorage.getItem(MEMBERS_STORAGE_KEY) || "[]",
        ) as Array<{ packageId?: number }>;

        return storedMembers.reduce<Record<number, number>>(
          (counts, member) => {
            if (typeof member.packageId === "number") {
              counts[member.packageId] = (counts[member.packageId] || 0) + 1;
            }
            return counts;
          },
          {},
        );
      } catch {
        return {};
      }
    };

    const normalizePackages = (rawPackages: unknown[]): Package[] => {
      const memberCounts = getStoredMemberCountByPackage();

      return rawPackages
        .filter(
          (pkg): pkg is Partial<Package> & Pick<Package, "id" | "name"> =>
            typeof pkg === "object" &&
            pkg !== null &&
            "id" in pkg &&
            "name" in pkg,
        )
        .map((pkg): Package => {
          const normalizedStatus: PackageStatus =
            pkg.status === "inactive" ? "inactive" : "active";

          return {
            id: Number(pkg.id),
            name: String(pkg.name || ""),
            duration: Number(pkg.duration || 0),
            price: Number(pkg.price || 0),
            description: String(pkg.description || ""),
            features: Array.isArray(pkg.features)
              ? pkg.features
                  .filter(
                    (feature): feature is string => typeof feature === "string",
                  )
                  .map((feature) => feature.trim())
                  .filter(Boolean)
              : [],
            color: typeof pkg.color === "string" ? pkg.color : "blue",
            status: normalizedStatus,
            memberCount:
              typeof pkg.memberCount === "number"
                ? pkg.memberCount
                : memberCounts[Number(pkg.id)] || 0,
            isPopular: Boolean(pkg.isPopular),
            category:
              pkg.category === "pt" || pkg.category === "service"
                ? pkg.category
                : "membership",
          };
        });
    };

    try {
      const storedPackages = localStorage.getItem(PACKAGES_STORAGE_KEY);

      if (storedPackages !== null) {
        const parsedPackages = JSON.parse(storedPackages) as unknown[];

        if (Array.isArray(parsedPackages)) {
          const normalizedPackages = normalizePackages(parsedPackages);

          if (parsedPackages.length === 0 || normalizedPackages.length > 0) {
            setPackages(normalizedPackages);
            syncMembersWithPackages(normalizedPackages);
            return;
          }
        }
      }
    } catch {
      localStorage.removeItem(PACKAGES_STORAGE_KEY);
    }

    const defaultPackages = createMockPackages();
    setPackages(defaultPackages);
    localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(defaultPackages));
    syncMembersWithPackages(defaultPackages);
  };

  const savePackages = (nextPackages: Package[]) => {
    setPackages(nextPackages);
    localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(nextPackages));
    syncMembersWithPackages(nextPackages);
    // Notify member page to refresh
    window.dispatchEvent(
      new CustomEvent("gymDataUpdated", { detail: { type: "packages" } }),
    );
  };

  const resetForm = () => {
    setFormData(createDefaultFormData());
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedPackage(null);
    resetForm();
  };

  const handleAddPackage = (e: React.FormEvent) => {
    e.preventDefault();

    const name = formData.name.trim();
    const duration = Number.parseInt(formData.duration, 10);
    const price = Number.parseInt(formData.price, 10);

    if (
      !name ||
      Number.isNaN(duration) ||
      duration <= 0 ||
      Number.isNaN(price)
    ) {
      window.alert("Vui lòng điền đầy đủ thông tin gói tập.");
      return;
    }

    if (packages.some((pkg) => pkg.name.toLowerCase() === name.toLowerCase())) {
      window.alert("Tên gói tập đã tồn tại.");
      return;
    }

    const nextId =
      packages.reduce((maxId, currentPackage) => {
        return Math.max(maxId, currentPackage.id);
      }, 0) + 1;

    const newPackage: Package = {
      id: nextId,
      name,
      duration,
      price,
      description: formData.description.trim(),
      features: formData.features
        .split("\n")
        .map((feature) => feature.trim())
        .filter(Boolean),
      color: formData.color,
      status: formData.status,
      memberCount: 0,
      isPopular: false,
      category: formData.category,
    };

    const nextPackages = [...packages, newPackage];
    savePackages(nextPackages);

    // Also create in backend API
    try {
      fetch("http://localhost:7000/admin/GoiTap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          tenGoiTap: name,
          soThang: Math.ceil(duration / 30),
          gia: price,
          moTa: formData.description.trim(),
          trangThai: formData.status === "active",
        }),
      });
    } catch {
      /* ignore */
    }

    closeAddModal();
  };

  const handleEditPackage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPackage) return;

    const name = formData.name.trim();
    const duration = Number.parseInt(formData.duration, 10);
    const price = Number.parseInt(formData.price, 10);

    if (
      !name ||
      Number.isNaN(duration) ||
      duration <= 0 ||
      Number.isNaN(price)
    ) {
      window.alert("Vui lòng điền đầy đủ thông tin gói tập.");
      return;
    }

    if (
      packages.some(
        (pkg) =>
          pkg.id !== selectedPackage.id &&
          pkg.name.toLowerCase() === name.toLowerCase(),
      )
    ) {
      window.alert("Tên gói tập đã tồn tại.");
      return;
    }

    const nextPackages = packages.map((pkg) =>
      pkg.id === selectedPackage.id
        ? {
            ...pkg,
            name,
            duration,
            price,
            description: formData.description.trim(),
            features: formData.features
              .split("\n")
              .map((feature) => feature.trim())
              .filter(Boolean),
            color: formData.color,
            status: formData.status,
            category: formData.category,
          }
        : pkg,
    );

    savePackages(nextPackages);
    closeEditModal();
  };

  const handleDeletePackage = (pkg: Package) => {
    if (!window.confirm(`Bạn có chắc muốn xóa gói tập "${pkg.name}"?`)) return;

    const nextPackages = packages.filter(
      (currentPackage) => currentPackage.id !== pkg.id,
    );
    savePackages(nextPackages);

    // Also delete in backend API
    try {
      fetch(`http://localhost:7000/admin/GoiTap/${pkg.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
    } catch {
      /* ignore */
    }
  };

  const handleToggleStatus = (pkg: Package) => {
    const nextPackages = packages.map((currentPackage): Package => {
      if (currentPackage.id !== pkg.id) {
        return currentPackage;
      }

      const nextStatus: PackageStatus =
        currentPackage.status === "active" ? "inactive" : "active";

      return {
        ...currentPackage,
        status: nextStatus,
      };
    });
    savePackages(nextPackages);
  };

  const openEditModal = (pkg: Package) => {
    setSelectedPackage(pkg);
    setFormData({
      name: pkg.name,
      duration: pkg.duration.toString(),
      price: pkg.price.toString(),
      description: pkg.description,
      features: pkg.features.join("\n"),
      color: pkg.color,
      status: pkg.status,
      category: pkg.category || "membership",
    });
    setShowEditModal(true);
  };

  const stats = {
    total: packages.length,
    active: packages.filter((pkg) => pkg.status === "active").length,
    revenue:
      packages.reduce((sum, pkg) => sum + pkg.price * pkg.memberCount, 0) /
      1000000,
    members: packages.reduce((sum, pkg) => sum + pkg.memberCount, 0),
  };

  return (
    <div className="packages-page">
      <div className="page-header">
        <div className="page-title">
          <h1>
            <i className="fas fa-box-open"></i> Quản lý Gói tập
          </h1>
          <p>Quản lý các gói tập gym trong hệ thống</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openAddModal}>
            <i className="fas fa-plus"></i> Thêm gói tập
          </button>
        </div>
      </div>

      <div className="stats-summary">
        <div className="summary-item">
          <div className="summary-icon blue">
            <i className="fas fa-box-open"></i>
          </div>
          <div className="summary-content">
            <span className="summary-value">{stats.total}</span>
            <span className="summary-label">Tổng gói tập</span>
          </div>
        </div>
        <div className="summary-item active">
          <div className="summary-icon green">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="summary-content">
            <span className="summary-value">{stats.active}</span>
            <span className="summary-label">Đang hoạt động</span>
          </div>
        </div>
        <div className="summary-item warning">
          <div className="summary-icon orange">
            <i className="fas fa-coins"></i>
          </div>
          <div className="summary-content">
            <span className="summary-value">{stats.revenue.toFixed(1)}</span>
            <span className="summary-label">Doanh thu (triệu)</span>
          </div>
        </div>
        <div className="summary-item info">
          <div className="summary-icon purple">
            <i className="fas fa-user-group"></i>
          </div>
          <div className="summary-content">
            <span className="summary-value">{stats.members}</span>
            <span className="summary-label">Hội viên đăng ký</span>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="pkg-category-tabs">
        {[
          {
            value: "all",
            label: "Tất cả",
            icon: "th-large",
            count: packages.length,
          },
          {
            value: "membership",
            label: "Gói tập",
            icon: "dumbbell",
            count: packages.filter((p) => p.category === "membership").length,
          },
          {
            value: "pt",
            label: "Gói PT",
            icon: "user-tie",
            count: packages.filter((p) => p.category === "pt").length,
          },
          {
            value: "service",
            label: "Dịch vụ",
            icon: "spa",
            count: packages.filter((p) => p.category === "service").length,
          },
        ].map((tab) => (
          <button
            key={tab.value}
            className={`pkg-tab-btn ${categoryFilter === tab.value ? "active" : ""}`}
            onClick={() =>
              setCategoryFilter(tab.value as PackageCategory | "all")
            }
          >
            <i className={`fas fa-${tab.icon}`}></i>
            {tab.label}
            <span className="pkg-tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="packages-grid">
        {(categoryFilter === "all"
          ? packages
          : packages.filter((p) => p.category === categoryFilter)
        ).length > 0 ? (
          (categoryFilter === "all"
            ? packages
            : packages.filter((p) => p.category === categoryFilter)
          ).map((pkg) => {
            const visibleFeatures = pkg.features.slice(0, 5);
            const moreFeatures = pkg.features.length - visibleFeatures.length;
            const pricePerDay = Math.round(pkg.price / pkg.duration);
            const revenue = (pkg.price * pkg.memberCount) / 1000000;
            const categoryLabel =
              pkg.category === "pt"
                ? "PT"
                : pkg.category === "service"
                  ? "Dịch vụ"
                  : "Gói tập";
            const categoryColor =
              pkg.category === "pt"
                ? "#f97316"
                : pkg.category === "service"
                  ? "#8b5cf6"
                  : "#6366f1";

            return (
              <article
                key={pkg.id}
                className={`package-card ${pkg.status === "inactive" ? "inactive" : ""}`}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "12px",
                    left: "12px",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    background: categoryColor,
                    color: "white",
                    zIndex: 2,
                  }}
                >
                  {categoryLabel}
                </div>
                <div className={`package-header ${pkg.color}`}>
                  {pkg.isPopular && (
                    <span className="popular-badge">
                      <i className="fas fa-star"></i> Phổ biến
                    </span>
                  )}
                  <div className="package-icon">
                    <i className={`fas fa-${getPackageIcon(pkg.duration)}`}></i>
                  </div>
                  <h3 className="package-name">{pkg.name}</h3>
                  <div className="package-duration">
                    <i className="fas fa-clock"></i> {pkg.duration} ngày
                  </div>
                </div>

                <div className="package-price">
                  <div className="price-value">{formatCurrency(pkg.price)}</div>
                  <div className="price-per-day">
                    ~ {formatCurrency(pricePerDay)}/ngày
                  </div>
                </div>

                {pkg.description && (
                  <p className="package-description">{pkg.description}</p>
                )}

                <div className="package-features">
                  <h4>Quyền lợi</h4>
                  <ul className="feature-list">
                    {visibleFeatures.map((feature) => (
                      <li key={`${pkg.id}-${feature}`}>
                        <i className="fas fa-check"></i>
                        <span>{feature}</span>
                      </li>
                    ))}
                    {moreFeatures > 0 && (
                      <li className="feature-more">
                        <i className="fas fa-plus"></i>
                        <span>+{moreFeatures} quyền lợi khác</span>
                      </li>
                    )}
                  </ul>
                </div>

                <div className="package-stats">
                  <div className="stat-item">
                    <div className="stat-number">{pkg.memberCount}</div>
                    <div className="stat-label">Hội viên</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">{revenue.toFixed(1)}M</div>
                    <div className="stat-label">Doanh thu</div>
                  </div>
                </div>

                <div className="package-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => openEditModal(pkg)}
                  >
                    <i className="fas fa-edit"></i> Sửa
                  </button>
                  <button
                    className={`btn ${pkg.status === "active" ? "btn-warning" : "btn-success"} btn-sm`}
                    onClick={() => handleToggleStatus(pkg)}
                  >
                    <i
                      className={`fas fa-${pkg.status === "active" ? "pause" : "play"}`}
                    ></i>
                    {pkg.status === "active" ? "Tạm ngưng" : "Kích hoạt"}
                  </button>
                  <button
                    className="btn btn-danger btn-sm package-delete-btn"
                    onClick={() => handleDeletePackage(pkg)}
                    title={`Xóa ${pkg.name}`}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </article>
            );
          })
        ) : (
          <div className="empty-state">
            <i className="fas fa-box-open"></i>
            <h3>Chưa có gói nào</h3>
            <p>Nhấn "Thêm gói tập" để tạo gói mới</p>
            <button className="btn btn-primary" onClick={openAddModal}>
              <i className="fas fa-plus"></i> Thêm gói tập
            </button>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="modal">
          <div className="modal-overlay" onClick={closeAddModal}></div>
          <div className="modal-content package-modal">
            <div className="modal-header">
              <h2>
                <i className="fas fa-plus-circle"></i> Thêm gói tập mới
              </h2>
              <button
                type="button"
                className="close-btn"
                onClick={closeAddModal}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleAddPackage} className="package-form">
              <div className="modal-body">
                <div className="form-group">
                  <label>
                    <i className="fas fa-tag"></i> Tên gói tập
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    placeholder="VD: Gói Premium 6 tháng"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <i className="fas fa-clock"></i> Thời hạn (ngày)
                    </label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                      required
                      min="1"
                      placeholder="VD: 30, 90, 180..."
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <i className="fas fa-money-bill"></i> Giá (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      required
                      min="0"
                      placeholder="VD: 500000"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>
                    <i className="fas fa-align-left"></i> Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    placeholder="Mô tả chi tiết gói tập..."
                  />
                </div>
                <div className="form-group">
                  <label>
                    <i className="fas fa-list-check"></i> Quyền lợi (mỗi dòng 1
                    quyền lợi)
                  </label>
                  <textarea
                    value={formData.features}
                    onChange={(e) =>
                      setFormData({ ...formData, features: e.target.value })
                    }
                    rows={4}
                    placeholder="Tập không giới hạn&#10;Phòng xông hơi&#10;Tủ đồ cá nhân"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <i className="fas fa-tag"></i> Danh mục
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: e.target.value as PackageCategory,
                        })
                      }
                    >
                      <option value="membership">Gói tập</option>
                      <option value="pt">Gói PT</option>
                      <option value="service">Dịch vụ</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>
                      <i className="fas fa-palette"></i> Màu sắc
                    </label>
                    <select
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                    >
                      <option value="blue">Xanh dương</option>
                      <option value="green">Xanh lá</option>
                      <option value="purple">Tím</option>
                      <option value="orange">Cam</option>
                      <option value="red">Đỏ</option>
                      <option value="gold">Vàng Gold</option>
                    </select>
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
                          status: e.target.value as PackageStatus,
                        })
                      }
                    >
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Tạm ngưng</option>
                    </select>
                  </div>
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
                  <i className="fas fa-save"></i> Lưu gói tập
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedPackage && (
        <div className="modal">
          <div className="modal-overlay" onClick={closeEditModal}></div>
          <div className="modal-content package-modal">
            <div className="modal-header">
              <h2>
                <i className="fas fa-edit"></i> Chỉnh sửa gói tập
              </h2>
              <button
                type="button"
                className="close-btn"
                onClick={closeEditModal}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleEditPackage} className="package-form">
              <div className="modal-body">
                <div className="form-group">
                  <label>
                    <i className="fas fa-tag"></i> Tên gói tập
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
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <i className="fas fa-clock"></i> Thời hạn (ngày)
                    </label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                      required
                      min="1"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <i className="fas fa-money-bill"></i> Giá (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      required
                      min="0"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>
                    <i className="fas fa-align-left"></i> Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label>
                    <i className="fas fa-list-check"></i> Quyền lợi
                  </label>
                  <textarea
                    value={formData.features}
                    onChange={(e) =>
                      setFormData({ ...formData, features: e.target.value })
                    }
                    rows={4}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <i className="fas fa-palette"></i> Màu sắc
                    </label>
                    <select
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                    >
                      <option value="blue">Xanh dương</option>
                      <option value="green">Xanh lá</option>
                      <option value="purple">Tím</option>
                      <option value="orange">Cam</option>
                      <option value="red">Đỏ</option>
                      <option value="gold">Vàng Gold</option>
                    </select>
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
                          status: e.target.value as PackageStatus,
                        })
                      }
                    >
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Tạm ngưng</option>
                    </select>
                  </div>
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
                  <i className="fas fa-save"></i> Lưu gói tập
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Packages;
