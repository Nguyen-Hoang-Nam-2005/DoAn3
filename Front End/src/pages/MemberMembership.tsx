import { useState, useEffect } from "react";
import MemberSidebar from "../components/layout/MemberSidebar";
import MemberHeader from "../components/layout/MemberHeader";
import "../styles.css";
import "./memberMembership.css";

/* ─── Types ─────────────────────────────────────────── */
interface StoredPackage {
  id: number;
  name: string;
  duration: number;
  price: number;
  description: string;
  features: string[];
  color: string;
  status: "active" | "inactive";
  memberCount: number;
  isPopular: boolean;
}

interface Subscription {
  id: number;
  packageId: number;
  packageName: string;
  startDate: string;
  endDate: string;
  price: number;
  color: string;
}

interface StoredMember {
  id: number;
  name: string;
  cardId: string;
  phone: string;
  email: string;
  gender: string;
  packageName: string;
  packageId: number;
  startDate: string;
  endDate: string;
  status: string;
  subscriptions?: Subscription[];
}

/* ─── localStorage keys ─────────────────────────────── */
const PACKAGES_KEY = "gymPackages";
const MEMBERS_KEY = "gymMembers";

/* ─── Default packages ──────────────────────────────── */
const DEFAULT_PACKAGES: StoredPackage[] = [
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
      "Ưu tiên đặt lịch",
    ],
    color: "gold",
    status: "active",
    memberCount: 34,
    isPopular: false,
  },
  {
    id: 5,
    name: "Gói PT 10 buổi",
    duration: 60,
    price: 2500000,
    description: "10 buổi tập cá nhân với huấn luyện viên",
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
    isPopular: false,
  },
  {
    id: 6,
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
  },
  {
    id: 7,
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
  },
  {
    id: 8,
    name: "Gói Spa & Recovery",
    duration: 30,
    price: 1500000,
    description: "Dịch vụ spa và phục hồi cơ thể sau tập",
    features: [
      "Xông hơi không giới hạn",
      "Massage 4 buổi/tháng",
      "Bể sục jacuzzi",
      "Phòng muối Himalaya",
      "Liệu pháp lạnh",
    ],
    color: "purple",
    status: "active",
    memberCount: 22,
    isPopular: false,
  },
  {
    id: 9,
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
  },
  {
    id: 10,
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
  },
];

/* ─── Helpers ────────────────────────────────────────── */
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount,
  );

const formatDate = (dateStr: string) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN");
};

const addDays = (dateStr: string, days: number): string => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

const daysRemaining = (endDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const getColorClass = (color: string) => {
  const map: Record<string, string> = {
    blue: "pkg-blue",
    green: "pkg-green",
    purple: "pkg-purple",
    gold: "pkg-gold",
    orange: "pkg-orange",
    red: "pkg-red",
  };
  return map[color] || "pkg-blue";
};

/* ─── Mock member data ────────────────────────────────── */
const MOCK_MEMBERS: StoredMember[] = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    cardId: "GYM001",
    phone: "0901234567",
    email: "an.nguyen@email.com",
    gender: "male",
    packageName: "Gói VIP 12 tháng",
    packageId: 4,
    startDate: "2026-03-28",
    endDate: "2027-03-28",
    status: "active",
    subscriptions: [],
  },
  {
    id: 2,
    name: "Trần Thị Bình",
    cardId: "GYM002",
    phone: "0912345678",
    email: "binh.tran@email.com",
    gender: "female",
    packageName: "Gói Basic 1 tháng",
    packageId: 1,
    startDate: "2025-12-25",
    endDate: "2026-01-25",
    status: "expired",
    subscriptions: [],
  },
  {
    id: 3,
    name: "Lê Minh Cường",
    cardId: "GYM003",
    phone: "0923456789",
    email: "cuong.le@email.com",
    gender: "male",
    packageName: "Gói VIP 12 tháng",
    packageId: 4,
    startDate: "2025-12-26",
    endDate: "2026-12-26",
    status: "active",
    subscriptions: [],
  },
];

/* ─── Load / save helpers ────────────────────────────── */
const loadPackages = (): StoredPackage[] => {
  try {
    const raw = localStorage.getItem(PACKAGES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredPackage[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* ignore */
  }
  localStorage.setItem(PACKAGES_KEY, JSON.stringify(DEFAULT_PACKAGES));
  return DEFAULT_PACKAGES;
};

const loadMembers = (): StoredMember[] => {
  try {
    const raw = localStorage.getItem(MEMBERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredMember[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* ignore */
  }
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(MOCK_MEMBERS));
  return MOCK_MEMBERS;
};

const getCurrentMemberInfo = () => {
  const userId = localStorage.getItem("userId") || "1";
  const memberName = localStorage.getItem("memberName") || "Hội viên";
  const numericId = Number(userId);
  const isNumericId = !isNaN(numericId) && userId.trim() !== "";
  return { userId, memberName, numericId: isNumericId ? numericId : null };
};

/* ─── Component ──────────────────────────────────────── */
export default function MemberMembership() {
  const [packages, setPackages] = useState<StoredPackage[]>([]);
  const [currentMember, setCurrentMember] = useState<StoredMember | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<StoredPackage | null>(
    null,
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [memberCategoryFilter, setMemberCategoryFilter] = useState<
    "all" | "membership" | "pt" | "service"
  >("all");
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  /* Load data on mount */
  useEffect(() => {
    // Load from API first, fallback to localStorage
    const loadPkgs = async () => {
      try {
        const res = await fetch("http://localhost:7000/admin/GoiTap/active");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped: StoredPackage[] = data.map((pkg: any) => ({
              id: pkg.id,
              name: pkg.name || "",
              duration: pkg.duration || 30,
              price: Number(pkg.price) || 0,
              description: pkg.description || "",
              features: Array.isArray(pkg.features) ? pkg.features : [],
              color: pkg.color || "blue",
              status: "active" as const,
              memberCount: pkg.memberCount || 0,
              isPopular: pkg.isPopular || false,
            }));
            setPackages(mapped);
            return;
          }
        }
      } catch {
        /* Backend unavailable */
      }
      const pkgs = loadPackages().filter((p) => p.status === "active");
      setPackages(pkgs);
    };
    loadPkgs();

    const { numericId, memberName } = getCurrentMemberInfo();
    const members = loadMembers();

    let found: StoredMember | null = null;
    if (numericId !== null) {
      found = members.find((m) => m.id === numericId) || null;
    }
    if (!found) {
      found = members.find((m) => m.name === memberName) || null;
    }
    if (!found) {
      const newId = members.reduce((max, m) => Math.max(max, m.id), 0) + 1;
      const displayName =
        memberName !== "Hội viên" ? memberName : `Hội Viên #${newId}`;
      const newMember: StoredMember = {
        id: newId,
        name: displayName,
        cardId: `GYM${String(newId).padStart(3, "0")}`,
        phone: "",
        email: "",
        gender: "male",
        packageName: "Chưa có gói",
        packageId: 0,
        startDate: "",
        endDate: "",
        status: "expired",
        subscriptions: [],
      };
      const updatedMembers = [...members, newMember];
      localStorage.setItem(MEMBERS_KEY, JSON.stringify(updatedMembers));
      found = newMember;
    }
    // Ensure subscriptions array exists
    if (!found.subscriptions) found.subscriptions = [];
    setCurrentMember(found);
  }, []);

  /* Auto-dismiss toast */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  /* Sync packages when admin updates them */
  useEffect(() => {
    const handlePackageUpdate = () => {
      const pkgs = loadPackages().filter((p) => p.status === "active");
      setPackages(pkgs);
    };
    window.addEventListener("focus", handlePackageUpdate);
    window.addEventListener("storage", handlePackageUpdate);
    window.addEventListener("gymDataUpdated", handlePackageUpdate);
    return () => {
      window.removeEventListener("focus", handlePackageUpdate);
      window.removeEventListener("storage", handlePackageUpdate);
      window.removeEventListener("gymDataUpdated", handlePackageUpdate);
    };
  }, []);

  /* ── Confirm registration (ADD new subscription, don't replace) ── */
  const handleConfirmRegister = () => {
    if (!selectedPackage || !currentMember) return;

    const members = loadMembers();
    const startDate = new Date().toISOString().split("T")[0];
    const endDate = addDays(startDate, selectedPackage.duration);

    // Create new subscription
    const existingSubs = currentMember.subscriptions || [];
    const newSubId =
      existingSubs.length > 0
        ? Math.max(...existingSubs.map((s) => s.id)) + 1
        : 1;

    const newSub: Subscription = {
      id: newSubId,
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      startDate,
      endDate,
      price: selectedPackage.price,
      color: selectedPackage.color,
    };

    const updatedSubs = [...existingSubs, newSub];

    // Update member with new subscription added (keep all old ones)
    const updatedMember: StoredMember = {
      ...currentMember,
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      startDate,
      endDate,
      status: "active",
      subscriptions: updatedSubs,
    };

    const updatedMembers = members.map((m) =>
      m.id === currentMember.id ? updatedMember : m,
    );
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(updatedMembers));

    // Update package memberCount
    const pkgs = loadPackages();
    const updatedPkgs = pkgs.map((p) => {
      if (p.id === selectedPackage.id) {
        return { ...p, memberCount: p.memberCount + 1 };
      }
      return p;
    });
    localStorage.setItem(PACKAGES_KEY, JSON.stringify(updatedPkgs));

    // Dispatch custom event so admin pages refresh
    window.dispatchEvent(
      new CustomEvent("gymDataUpdated", { detail: { type: "member" } }),
    );

    // Create invoice for this registration
    const INVOICES_KEY_LOCAL = "gymMemberInvoices";
    const existingInvoices = (() => {
      try {
        const raw = localStorage.getItem(INVOICES_KEY_LOCAL);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {
        /* ignore */
      }
      return [];
    })();

    const newInvoiceId =
      existingInvoices.length > 0
        ? Math.max(...existingInvoices.map((inv: any) => inv.id)) + 1
        : 1;
    const today = new Date();
    const invoiceNumber = `INV-${today.getFullYear()}-${String(newInvoiceId).padStart(3, "0")}`;
    const memberName = localStorage.getItem("memberName") || "Hội viên";
    const userId = Number(localStorage.getItem("userId") || "1");

    const newInvoice = {
      id: newInvoiceId,
      invoiceNumber,
      date: startDate,
      dueDate: addDays(startDate, 7),
      items: [
        {
          id: 1,
          description: selectedPackage.name,
          quantity: 1,
          unitPrice: selectedPackage.price,
          total: selectedPackage.price,
        },
      ],
      subtotal: selectedPackage.price,
      discount: 0,
      tax: 0,
      total: selectedPackage.price,
      status: "pending",
      notes: `Đăng ký ${selectedPackage.name} - ${selectedPackage.duration} ngày`,
      memberId: userId,
      memberName: memberName,
    };

    const updatedInvoices = [...existingInvoices, newInvoice];
    localStorage.setItem(INVOICES_KEY_LOCAL, JSON.stringify(updatedInvoices));

    // Also add to admin invoices (gymInvoices) so it shows in admin panel
    const ADMIN_INVOICES_KEY = "gymInvoices";
    const adminInvoices = (() => {
      try {
        const raw = localStorage.getItem(ADMIN_INVOICES_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {
        /* ignore */
      }
      return [];
    })();

    const adminInvoiceId = Date.now();
    const adminInvoiceNumber = `INV${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}${String(newInvoiceId).padStart(3, "0")}`;

    const adminInvoice = {
      id: adminInvoiceId,
      invoiceId: adminInvoiceNumber,
      customerId: userId,
      customerName: memberName,
      customerPhone: "",
      type: "membership",
      itemId: `pkg${selectedPackage.id}`,
      itemName: selectedPackage.name,
      description: selectedPackage.name,
      quantity: 1,
      unitPrice: selectedPackage.price,
      subtotal: selectedPackage.price,
      discount: 0,
      total: selectedPackage.price,
      paymentMethod: "transfer",
      status: "pending",
      note: `Hội viên đăng ký ${selectedPackage.name} - ${selectedPackage.duration} ngày`,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(
      ADMIN_INVOICES_KEY,
      JSON.stringify([...adminInvoices, adminInvoice]),
    );

    // Update local state
    setCurrentMember(updatedMember);
    setPackages(updatedPkgs.filter((p) => p.status === "active"));
    setShowConfirmModal(false);
    setSelectedPackage(null);
    setToast({
      msg: `Đăng ký "${selectedPackage.name}" thành công! 🎉`,
      type: "success",
    });
  };

  /* ── Get active subscriptions ── */
  const activeSubscriptions = (currentMember?.subscriptions || []).filter(
    (sub) => daysRemaining(sub.endDate) > 0,
  );

  /* ── Check if member already has a specific package active ── */
  const hasActivePackage = (pkgId: number) => {
    return activeSubscriptions.some((sub) => sub.packageId === pkgId);
  };

  return (
    <div className="admin-layout">
      <MemberSidebar />
      <div className="main-content">
        <MemberHeader />
        <main className="content">
          <div className="membership-page">
            {/* ── Toast ── */}
            {toast && (
              <div className={`mm-toast mm-toast--${toast.type}`}>
                <i
                  className={`fas fa-${toast.type === "success" ? "check-circle" : "exclamation-circle"}`}
                ></i>
                {toast.msg}
              </div>
            )}

            {/* ── Page Header ── */}
            <div className="page-header">
              <div className="page-title">
                <h1>
                  <i className="fas fa-id-card"></i> Gói thành viên
                </h1>
                <p>Quản lý gói tập và gia hạn thành viên</p>
              </div>
              <div className="page-actions">
                <button
                  className="btn btn-outline"
                  onClick={() => setShowHistoryModal(true)}
                >
                  <i className="fas fa-history"></i> Lịch sử giao dịch
                </button>
              </div>
            </div>

            {/* ── Active Subscriptions ── */}
            {activeSubscriptions.length > 0 ? (
              <div className="active-subscriptions-section">
                <div className="section-header">
                  <h2>
                    <i className="fas fa-check-circle"></i> Gói đang hoạt động (
                    {activeSubscriptions.length})
                  </h2>
                  <p>Các gói tập bạn đang sử dụng</p>
                </div>
                <div className="subscriptions-grid">
                  {activeSubscriptions.map((sub) => {
                    const remaining = daysRemaining(sub.endDate);
                    const pkg = packages.find((p) => p.id === sub.packageId);
                    const totalDays = pkg?.duration || 30;
                    const usedDays = Math.max(0, totalDays - remaining);
                    const progressPct = Math.min(
                      100,
                      Math.round((usedDays / totalDays) * 100),
                    );

                    return (
                      <div
                        key={sub.id}
                        className={`subscription-card ${getColorClass(sub.color)}-border`}
                      >
                        <div
                          className={`sub-color-bar ${getColorClass(sub.color)}`}
                        ></div>
                        <div className="sub-content">
                          <div className="sub-header">
                            <h3>{sub.packageName}</h3>
                            <span className="sub-status active">
                              <i className="fas fa-check-circle"></i> Đang hoạt
                              động
                            </span>
                          </div>
                          <div className="sub-dates">
                            <div className="sub-date-item">
                              <i className="fas fa-calendar-check"></i>
                              <span>
                                Bắt đầu:{" "}
                                <strong>{formatDate(sub.startDate)}</strong>
                              </span>
                            </div>
                            <div className="sub-date-item">
                              <i className="fas fa-calendar-times"></i>
                              <span>
                                Hết hạn:{" "}
                                <strong>{formatDate(sub.endDate)}</strong>
                              </span>
                            </div>
                            <div className="sub-date-item highlight">
                              <i className="fas fa-hourglass-half"></i>
                              <span>
                                Còn lại:{" "}
                                <strong
                                  className={
                                    remaining > 7
                                      ? "text-success"
                                      : "text-warning"
                                  }
                                >
                                  {remaining} ngày
                                </strong>
                              </span>
                            </div>
                          </div>
                          <div className="sub-progress">
                            <div className="progress-info">
                              <span>Tiến độ</span>
                              <span>{progressPct}%</span>
                            </div>
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{ width: `${progressPct}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="no-membership-card">
                <i className="fas fa-id-card-alt"></i>
                <h3>Bạn chưa có gói tập nào đang hoạt động</h3>
                <p>Chọn gói tập bên dưới để bắt đầu hành trình của bạn!</p>
              </div>
            )}

            {/* ── Available Packages ── */}
            <div id="packages-section" className="section-header">
              <h2>
                <i className="fas fa-box-open"></i> Các gói & dịch vụ
              </h2>
              <p>Chọn gói phù hợp với nhu cầu tập luyện của bạn</p>
            </div>

            {/* Category Tabs */}
            <div
              className="pkg-category-tabs"
              style={{ marginBottom: "1.5rem" }}
            >
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
                  count: packages.filter(
                    (p: any) => !p.category || p.category === "membership",
                  ).length,
                },
                {
                  value: "pt",
                  label: "Gói PT",
                  icon: "user-tie",
                  count: packages.filter((p: any) => p.category === "pt")
                    .length,
                },
                {
                  value: "service",
                  label: "Dịch vụ",
                  icon: "spa",
                  count: packages.filter((p: any) => p.category === "service")
                    .length,
                },
              ].map((tab) => (
                <button
                  key={tab.value}
                  className={`pkg-tab-btn ${memberCategoryFilter === tab.value ? "active" : ""}`}
                  onClick={() => setMemberCategoryFilter(tab.value as any)}
                >
                  <i className={`fas fa-${tab.icon}`}></i>
                  {tab.label}
                  <span className="pkg-tab-count">{tab.count}</span>
                </button>
              ))}
            </div>

            <div className="packages-grid">
              {(memberCategoryFilter === "all"
                ? packages
                : packages.filter((p: any) =>
                    memberCategoryFilter === "membership"
                      ? !p.category || p.category === "membership"
                      : p.category === memberCategoryFilter,
                  )
              ).map((pkg) => {
                const isActive = hasActivePackage(pkg.id);
                return (
                  <div
                    key={pkg.id}
                    className={`package-card ${pkg.isPopular ? "popular" : ""} ${isActive ? "current-pkg" : ""}`}
                  >
                    {pkg.isPopular && (
                      <div className="popular-badge">
                        <i className="fas fa-star"></i> Phổ biến nhất
                      </div>
                    )}
                    {isActive && (
                      <div className="current-pkg-badge">
                        <i className="fas fa-check"></i> Đang dùng
                      </div>
                    )}

                    <div
                      className={`package-header-bar ${getColorClass(pkg.color)}`}
                    >
                      <i className="fas fa-dumbbell pkg-icon"></i>
                    </div>

                    <div className="package-header">
                      <h3>{pkg.name}</h3>
                      <p className="package-description">{pkg.description}</p>
                    </div>

                    <div className="package-price">
                      <div className="current-price">
                        {formatCurrency(pkg.price)}
                      </div>
                      <span className="price-period">{pkg.duration} ngày</span>
                    </div>

                    <div className="package-features">
                      {pkg.features.map((feature, idx) => (
                        <div key={idx} className="feature-item">
                          <i className="fas fa-check-circle"></i>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pkg-member-count">
                      <i className="fas fa-users"></i> {pkg.memberCount} hội
                      viên đang dùng
                    </div>

                    <button
                      className={`btn ${pkg.isPopular ? "btn-primary" : "btn-outline"} btn-block`}
                      onClick={() => {
                        setSelectedPackage(pkg);
                        setShowConfirmModal(true);
                      }}
                    >
                      <i
                        className={`fas fa-${isActive ? "sync-alt" : "shopping-cart"}`}
                      ></i>
                      {isActive ? "Gia hạn thêm" : "Chọn gói này"}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* ── Benefits Section ── */}
            <div className="benefits-section">
              <div className="section-header">
                <h2>
                  <i className="fas fa-gift"></i> Quyền lợi thành viên
                </h2>
                <p>Những lợi ích khi là thành viên FitZone</p>
              </div>
              <div className="benefits-grid">
                {[
                  {
                    icon: "dumbbell",
                    color: "blue",
                    title: "Thiết bị hiện đại",
                    desc: "Sử dụng tất cả thiết bị tập luyện cao cấp",
                  },
                  {
                    icon: "users",
                    color: "green",
                    title: "Lớp nhóm đa dạng",
                    desc: "Tham gia các lớp Yoga, Zumba, CrossFit...",
                  },
                  {
                    icon: "user-tie",
                    color: "orange",
                    title: "HLV chuyên nghiệp",
                    desc: "Được hướng dẫn bởi đội ngũ HLV giàu kinh nghiệm",
                  },
                  {
                    icon: "spa",
                    color: "purple",
                    title: "Dịch vụ spa",
                    desc: "Thư giãn với massage, xông hơi sau tập",
                  },
                ].map((b) => (
                  <div key={b.title} className="benefit-card">
                    <div className={`benefit-icon ${b.color}`}>
                      <i className={`fas fa-${b.icon}`}></i>
                    </div>
                    <h3>{b.title}</h3>
                    <p>{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── Confirm Registration Modal ── */}
      {showConfirmModal && selectedPackage && (
        <div className="modal">
          <div
            className="modal-overlay"
            onClick={() => setShowConfirmModal(false)}
          ></div>
          <div className="modal-content mm-confirm-modal">
            <div className="modal-header">
              <h2>
                <i className="fas fa-shopping-cart"></i> Xác nhận đăng ký gói
              </h2>
              <button
                className="close-btn"
                onClick={() => setShowConfirmModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div
                className={`mm-pkg-preview ${getColorClass(selectedPackage.color)}`}
              >
                <i className="fas fa-dumbbell"></i>
                <div>
                  <h3>{selectedPackage.name}</h3>
                  <p>{selectedPackage.description}</p>
                </div>
              </div>

              {hasActivePackage(selectedPackage.id) && (
                <div className="mm-confirm-warning">
                  <i className="fas fa-exclamation-triangle"></i>
                  Bạn đang có gói này đang hoạt động. Đăng ký thêm sẽ tạo một
                  gói mới song song.
                </div>
              )}

              <div className="mm-confirm-details">
                <div className="mm-confirm-row">
                  <span>Thời hạn:</span>
                  <strong>{selectedPackage.duration} ngày</strong>
                </div>
                <div className="mm-confirm-row">
                  <span>Ngày bắt đầu:</span>
                  <strong>
                    {formatDate(new Date().toISOString().split("T")[0])}
                  </strong>
                </div>
                <div className="mm-confirm-row">
                  <span>Ngày hết hạn:</span>
                  <strong>
                    {formatDate(
                      addDays(
                        new Date().toISOString().split("T")[0],
                        selectedPackage.duration,
                      ),
                    )}
                  </strong>
                </div>
                <div className="mm-confirm-row mm-confirm-total">
                  <span>Tổng thanh toán:</span>
                  <strong className="mm-price">
                    {formatCurrency(selectedPackage.price)}
                  </strong>
                </div>
              </div>

              <div className="mm-confirm-notice">
                <i className="fas fa-info-circle"></i>
                Gói tập sẽ được kích hoạt ngay sau khi xác nhận. Bạn có thể đăng
                ký nhiều gói cùng lúc.
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowConfirmModal(false)}
              >
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmRegister}
              >
                <i className="fas fa-check"></i> Xác nhận đăng ký
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── History Modal ── */}
      {showHistoryModal && (
        <div className="modal">
          <div
            className="modal-overlay"
            onClick={() => setShowHistoryModal(false)}
          ></div>
          <div className="modal-content mm-history-modal">
            <div className="modal-header">
              <h2>
                <i className="fas fa-history"></i> Lịch sử giao dịch
              </h2>
              <button
                className="close-btn"
                onClick={() => setShowHistoryModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              {(currentMember?.subscriptions || []).length > 0 ? (
                <div className="history-table">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Gói tập</th>
                        <th>Giá</th>
                        <th>Ngày bắt đầu</th>
                        <th>Ngày hết hạn</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...(currentMember?.subscriptions || [])]
                        .reverse()
                        .map((sub, idx) => {
                          const remaining = daysRemaining(sub.endDate);
                          return (
                            <tr key={sub.id}>
                              <td>{idx + 1}</td>
                              <td>
                                <strong>{sub.packageName}</strong>
                              </td>
                              <td>{formatCurrency(sub.price)}</td>
                              <td>{formatDate(sub.startDate)}</td>
                              <td>{formatDate(sub.endDate)}</td>
                              <td>
                                <span
                                  className={`badge badge-${remaining > 0 ? "success" : "danger"}`}
                                >
                                  {remaining > 0 ? "Còn hạn" : "Hết hạn"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <i className="fas fa-receipt"></i>
                  <p>Chưa có lịch sử giao dịch</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowHistoryModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
