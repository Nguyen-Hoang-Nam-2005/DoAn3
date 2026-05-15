import React, { useEffect, useRef, useState } from "react";

interface Subscription {
  id: number;
  packageId: number;
  packageName: string;
  startDate: string;
  endDate: string;
  price: number;
  color: string;
}

interface Member {
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
  status: "active" | "expiring" | "expired";
  subscriptions?: Subscription[];
}

const MEMBERS_STORAGE_KEY = "gymMembers";
const PACKAGES_STORAGE_KEY = "gymPackages";
const UNASSIGNED_PACKAGE_ID = 0;
const UNASSIGNED_PACKAGE_NAME = "Chưa gán gói tập";

interface PackageOption {
  value: string;
  label: string;
  duration: number;
  price: number;
  status: "active" | "inactive";
}

const DEFAULT_PACKAGE_OPTIONS: PackageOption[] = [
  {
    value: "1",
    label: "Gói Basic 1 tháng",
    duration: 30,
    price: 500000,
    status: "active",
  },
  {
    value: "2",
    label: "Gói Standard 3 tháng",
    duration: 90,
    price: 1200000,
    status: "active",
  },
  {
    value: "3",
    label: "Gói Premium 6 tháng",
    duration: 180,
    price: 2000000,
    status: "active",
  },
  {
    value: "4",
    label: "Gói VIP 12 tháng",
    duration: 365,
    price: 3500000,
    status: "active",
  },
];

interface MemberEditFormData {
  name: string;
  phone: string;
  email: string;
  startDate: string;
  endDate: string;
}

const formatInputDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const createDefaultEditFormData = (
  member?: Member | null,
): MemberEditFormData => ({
  name: member?.name || "",
  phone: member?.phone || "",
  email: member?.email || "",
  startDate: member?.startDate || formatInputDate(new Date()),
  endDate: member?.endDate || formatInputDate(new Date()),
});

const formatDisplayDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("vi-VN");
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .reduce<string[]>((initials, part, index, parts) => {
      if (index === 0 || index === parts.length - 1) {
        initials.push(part[0]?.toUpperCase() || "");
      }
      return initials;
    }, [])
    .join("");

const getGenderLabel = (gender: string) => (gender === "female" ? "Nữ" : "Nam");

const getAvatarTone = (gender: string) =>
  gender === "female" ? "pink" : "blue";

const getMemberStatus = (endDate: string): Member["status"] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil(
    (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays < 0) {
    return "expired";
  }

  if (diffDays <= 7) {
    return "expiring";
  }

  return "active";
};

const getMembershipDurationText = (endDate: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil(
    (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  return diffDays < 0
    ? `Hết hạn ${Math.abs(diffDays)} ngày trước`
    : `Còn ${diffDays} ngày`;
};

const getStatusText = (status: Member["status"]) => {
  switch (status) {
    case "active":
      return "Còn hạn";
    case "expiring":
      return "Sắp hết hạn";
    case "expired":
      return "Hết hạn";
    default:
      return "";
  }
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const hydrateMember = (
  source?: Partial<Member>,
  fallback?: Member,
  index = 0,
): Member => {
  const startDate =
    source?.startDate || fallback?.startDate || formatInputDate(new Date());
  const endDate = source?.endDate || fallback?.endDate || startDate;

  return {
    id: Number(source?.id ?? fallback?.id ?? Date.now() + index),
    name: source?.name?.trim() || fallback?.name || "",
    cardId: (source?.cardId || fallback?.cardId || "").toUpperCase(),
    phone: source?.phone || fallback?.phone || "",
    email: source?.email || fallback?.email || "",
    gender:
      source?.gender === "female" || source?.gender === "male"
        ? source.gender
        : (fallback?.gender ?? "male"),
    packageName: source?.packageName || fallback?.packageName || "Gói 1 tháng",
    packageId: Number(source?.packageId ?? fallback?.packageId ?? 1),
    startDate,
    endDate,
    status: getMemberStatus(endDate),
    subscriptions: Array.isArray(source?.subscriptions)
      ? source.subscriptions
      : fallback?.subscriptions || [],
  };
};

const loadPackageOptions = (): PackageOption[] => {
  try {
    const rawStoredPackages = localStorage.getItem(PACKAGES_STORAGE_KEY);
    if (rawStoredPackages) {
      const parsedPackages = JSON.parse(rawStoredPackages) as Array<{
        id?: number;
        name?: string;
        duration?: number;
        price?: number;
        status?: "active" | "inactive";
      }>;

      if (Array.isArray(parsedPackages) && parsedPackages.length > 0) {
        const normalizedPackages = parsedPackages
          .filter(
            (pkg) =>
              typeof pkg.id === "number" &&
              typeof pkg.name === "string" &&
              pkg.name.trim() !== "",
          )
          .map(
            (pkg): PackageOption => ({
              value: String(pkg.id),
              label: pkg.name!.trim(),
              duration: Number(pkg.duration || 0),
              price: Number(pkg.price || 0),
              status: pkg.status === "inactive" ? "inactive" : "active",
            }),
          );

        if (normalizedPackages.length > 0) {
          return normalizedPackages;
        }
      }
    }
  } catch {
    // Fall back to defaults below.
  }

  return DEFAULT_PACKAGE_OPTIONS;
};

const Members: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [packageOptions, setPackageOptions] =
    useState<PackageOption[]>(loadPackageOptions);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPackage, setFilterPackage] = useState("all");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [renewTargetIds, setRenewTargetIds] = useState<number[]>([]);
  const [renewPackageId, setRenewPackageId] = useState("");
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    gender: "",
    packageId: "",
    startDate: formatInputDate(new Date()),
    endDate: "",
    totalAmount: "",
  });
  const [editFormData, setEditFormData] = useState<MemberEditFormData>(
    createDefaultEditFormData(),
  );

  const refreshPackageOptions = () => {
    const nextPackageOptions = loadPackageOptions();
    setPackageOptions(nextPackageOptions);
    return nextPackageOptions;
  };

  const saveMembers = (nextMembers: Member[]) => {
    setMembers(nextMembers);
    localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(nextMembers));
  };

  useEffect(() => {
    loadMembersFromAPI();
  }, []);

  const loadMembersFromAPI = async () => {
    // Try API first
    try {
      const res = await fetch("http://localhost:7000/admin/ThanhVien");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: Member[] = data.map((m: any) => ({
            id: m.id,
            name: m.name || "",
            cardId: m.cardId || "",
            phone: m.phone || "",
            email: m.email || "",
            gender: m.gender || "male",
            packageName: m.packageName || "Chưa gán gói tập",
            packageId: m.packageId || 0,
            startDate: m.startDate || "",
            endDate: m.endDate || "",
            status: (m.status || "expired") as Member["status"],
            subscriptions: [],
          }));
          setMembers(mapped);
          setFilteredMembers(mapped);
          // Also save to localStorage
          localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(mapped));
          return;
        }
      }
    } catch {
      /* Backend unavailable */
    }

    // Fallback to localStorage
    const nextPackageOptions = refreshPackageOptions();
    loadMembers(nextPackageOptions);
  };

  useEffect(() => {
    const syncPackages = () => {
      const nextPackageOptions = refreshPackageOptions();
      loadMembers(nextPackageOptions);
    };

    window.addEventListener("focus", syncPackages);
    window.addEventListener("storage", syncPackages);
    window.addEventListener("gymDataUpdated", syncPackages);

    return () => {
      window.removeEventListener("focus", syncPackages);
      window.removeEventListener("storage", syncPackages);
      window.removeEventListener("gymDataUpdated", syncPackages);
    };
  }, []);

  useEffect(() => {
    filterAndSearchMembers();
  }, [members, searchTerm, filterStatus, filterPackage]);

  useEffect(() => {
    setSelectedMemberIds((currentIds) =>
      currentIds.filter((id) => members.some((member) => member.id === id)),
    );
    setRenewTargetIds((currentIds) =>
      currentIds.filter((id) => members.some((member) => member.id === id)),
    );
  }, [members]);

  useEffect(() => {
    if (!selectedMember) {
      return;
    }

    const nextSelectedMember =
      members.find((member) => member.id === selectedMember.id) || null;

    if (nextSelectedMember) {
      setSelectedMember(nextSelectedMember);
      return;
    }

    setSelectedMember(null);
    setShowDetailModal(false);
    setShowEditModal(false);
  }, [members, selectedMember?.id]);

  useEffect(() => {
    updateEndDate();
  }, [formData.packageId, formData.startDate, packageOptions]);

  useEffect(() => {
    if (
      filterPackage !== "all" &&
      !packageOptions.some((pkg) => pkg.value === filterPackage)
    ) {
      setFilterPackage("all");
    }

    if (
      formData.packageId &&
      !packageOptions.some((pkg) => pkg.value === formData.packageId)
    ) {
      setFormData((currentData) => ({
        ...currentData,
        packageId: "",
        endDate: "",
        totalAmount: "",
      }));
    }
  }, [packageOptions, filterPackage, formData.packageId]);

  const loadMembers = (
    incomingPackageOptions: PackageOption[] = packageOptions,
  ) => {
    const resolvedPackageOptions =
      incomingPackageOptions.length > 0
        ? incomingPackageOptions
        : loadPackageOptions();
    const packageMap = new Map(
      resolvedPackageOptions.map((pkg) => [Number(pkg.value), pkg]),
    );
    const normalizeMemberPackage = (member: Member): Member => {
      const matchedPackage = packageMap.get(member.packageId);

      if (!matchedPackage) {
        return {
          ...member,
          packageId: UNASSIGNED_PACKAGE_ID,
          packageName: UNASSIGNED_PACKAGE_NAME,
          status: getMemberStatus(member.endDate),
        };
      }

      return {
        ...member,
        packageId: Number(matchedPackage.value),
        packageName: matchedPackage.label,
        status: getMemberStatus(member.endDate),
      };
    };

    // Mock data
    const mockMembers: Member[] = [
      {
        id: 1,
        name: "Nguyễn Văn An",
        cardId: "GYM001",
        phone: "0901234567",
        email: "an.nguyen@email.com",
        gender: "male",
        packageName: "Gói 12 tháng",
        packageId: 4,
        startDate: "2026-03-28",
        endDate: "2027-03-28",
        status: "active",
      },
      {
        id: 2,
        name: "Trần Thị Bình",
        cardId: "GYM002",
        phone: "0912345678",
        email: "binh.tran@email.com",
        gender: "female",
        packageName: "Gói 1 tháng",
        packageId: 1,
        startDate: "2025-12-25",
        endDate: "2026-01-25",
        status: "expired",
      },
      {
        id: 3,
        name: "Lê Minh Cường",
        cardId: "GYM003",
        phone: "0923456789",
        email: "cuong.le@email.com",
        gender: "male",
        packageName: "Gói 12 tháng",
        packageId: 4,
        startDate: "2025-12-26",
        endDate: "2026-12-26",
        status: "active",
      },
      {
        id: 4,
        name: "Phạm Thu Dung",
        cardId: "GYM004",
        phone: "0934567890",
        email: "dung.pham@email.com",
        gender: "female",
        packageName: "Gói 1 tháng",
        packageId: 1,
        startDate: "2025-12-25",
        endDate: "2026-01-25",
        status: "expired",
      },
      {
        id: 5,
        name: "Hoàng Văn Em",
        cardId: "GYM005",
        phone: "0945678901",
        email: "em.hoang@email.com",
        gender: "male",
        packageName: "Gói 1 tháng",
        packageId: 1,
        startDate: "2025-12-25",
        endDate: "2026-01-25",
        status: "expired",
      },
      {
        id: 6,
        name: "Vũ Thị Phương",
        cardId: "GYM006",
        phone: "0956789012",
        email: "phuong.vu@email.com",
        gender: "female",
        packageName: "Gói 1 tháng",
        packageId: 1,
        startDate: "2025-12-25",
        endDate: "2026-01-25",
        status: "expired",
      },
      {
        id: 7,
        name: "Đặng Quốc Giang",
        cardId: "GYM007",
        phone: "0967890123",
        email: "giang.dang@email.com",
        gender: "male",
        packageName: "Gói 1 tháng",
        packageId: 1,
        startDate: "2025-12-25",
        endDate: "2026-01-25",
        status: "expired",
      },
      {
        id: 8,
        name: "Ngô Hà Linh",
        cardId: "GYM008",
        phone: "0978901234",
        email: "linh.ngo@email.com",
        gender: "female",
        packageName: "Gói 1 tháng",
        packageId: 1,
        startDate: "2025-12-25",
        endDate: "2026-01-25",
        status: "expired",
      },
      {
        id: 9,
        name: "Bùi Minh Hải",
        cardId: "GYM009",
        phone: "0989012345",
        email: "hai.bui@email.com",
        gender: "male",
        packageName: "Gói 1 tháng",
        packageId: 1,
        startDate: "2025-12-25",
        endDate: "2026-01-25",
        status: "expired",
      },
      {
        id: 10,
        name: "Lý Phương Hoa",
        cardId: "GYM010",
        phone: "0905678912",
        email: "hoa.ly@email.com",
        gender: "female",
        packageName: "Gói 1 tháng",
        packageId: 1,
        startDate: "2025-12-25",
        endDate: "2026-01-25",
        status: "expired",
      },
      {
        id: 11,
        name: "Mai Nhật Huy",
        cardId: "GYM011",
        phone: "0915678912",
        email: "huy.mai@email.com",
        gender: "male",
        packageName: "Gói 1 tháng",
        packageId: 1,
        startDate: "2025-12-25",
        endDate: "2026-01-25",
        status: "expired",
      },
      {
        id: 12,
        name: "Đỗ Khánh Ly",
        cardId: "GYM012",
        phone: "0925678912",
        email: "ly.do@email.com",
        gender: "female",
        packageName: "Gói 1 tháng",
        packageId: 1,
        startDate: "2025-12-25",
        endDate: "2026-01-25",
        status: "expired",
      },
      {
        id: 13,
        name: "Trịnh Thanh Nam",
        cardId: "GYM013",
        phone: "0935678912",
        email: "nam.trinh@email.com",
        gender: "male",
        packageName: "Gói 1 tháng",
        packageId: 1,
        startDate: "2025-12-25",
        endDate: "2026-01-25",
        status: "expired",
      },
      {
        id: 14,
        name: "Phan Thu Oanh",
        cardId: "GYM014",
        phone: "0945678912",
        email: "oanh.phan@email.com",
        gender: "female",
        packageName: "Gói 1 tháng",
        packageId: 1,
        startDate: "2025-12-25",
        endDate: "2026-01-25",
        status: "expired",
      },
      {
        id: 15,
        name: "Tạ Hoàng Phúc",
        cardId: "GYM015",
        phone: "0955678912",
        email: "phuc.ta@email.com",
        gender: "male",
        packageName: "Gói 1 tháng",
        packageId: 1,
        startDate: "2025-12-25",
        endDate: "2026-01-25",
        status: "expired",
      },
      {
        id: 16,
        name: "Lâm Gia Quỳnh",
        cardId: "GYM016",
        phone: "0965678912",
        email: "quynh.lam@email.com",
        gender: "female",
        packageName: "Gói 1 tháng",
        packageId: 1,
        startDate: "2025-12-25",
        endDate: "2026-01-25",
        status: "expired",
      },
      {
        id: 17,
        name: "Tạ Ngọc Bích",
        cardId: "GYM017",
        phone: "0975678912",
        email: "bich.ta@email.com",
        gender: "female",
        packageName: "Gói 3 tháng",
        packageId: 2,
        startDate: "2026-02-17",
        endDate: "2026-05-17",
        status: "active",
      },
      {
        id: 18,
        name: "Hồ Đức Long",
        cardId: "GYM018",
        phone: "0985678912",
        email: "long.ho@email.com",
        gender: "male",
        packageName: "Gói 6 tháng",
        packageId: 3,
        startDate: "2026-01-28",
        endDate: "2026-07-28",
        status: "active",
      },
      {
        id: 19,
        name: "Nguyễn Thảo Nhi",
        cardId: "GYM019",
        phone: "0995678912",
        email: "nhi.nguyen@email.com",
        gender: "female",
        packageName: "Gói 1 tháng",
        packageId: 1,
        startDate: "2026-03-11",
        endDate: "2026-04-11",
        status: "expiring",
      },
      {
        id: 20,
        name: "Trịnh Hữu Phúc",
        cardId: "GYM020",
        phone: "0906678912",
        email: "phuc.trinh@email.com",
        gender: "male",
        packageName: "Gói 12 tháng",
        packageId: 4,
        startDate: "2026-01-30",
        endDate: "2027-01-30",
        status: "active",
      },
      {
        id: 21,
        name: "Quách Mỹ Duyên",
        cardId: "GYM021",
        phone: "0916678912",
        email: "duyen.quach@email.com",
        gender: "female",
        packageName: "Gói 3 tháng",
        packageId: 2,
        startDate: "2026-03-02",
        endDate: "2026-06-02",
        status: "active",
      },
      {
        id: 22,
        name: "Kiều Minh Tuấn",
        cardId: "GYM022",
        phone: "0926678912",
        email: "tuan.kieu@email.com",
        gender: "male",
        packageName: "Gói 6 tháng",
        packageId: 3,
        startDate: "2025-08-14",
        endDate: "2026-02-14",
        status: "expired",
      },
      {
        id: 23,
        name: "Châu Bảo Trâm",
        cardId: "GYM023",
        phone: "0936678912",
        email: "tram.chau@email.com",
        gender: "female",
        packageName: "Gói 1 tháng",
        packageId: 1,
        startDate: "2026-03-16",
        endDate: "2026-04-16",
        status: "expiring",
      },
    ];

    try {
      const rawStoredMembers = localStorage.getItem(MEMBERS_STORAGE_KEY);

      if (rawStoredMembers !== null) {
        const parsedMembers = JSON.parse(rawStoredMembers) as Partial<Member>[];

        if (Array.isArray(parsedMembers)) {
          const normalizedMembers = parsedMembers
            .map((member, index) =>
              normalizeMemberPackage(hydrateMember(member, undefined, index)),
            )
            .sort((left, right) => left.id - right.id);

          saveMembers(normalizedMembers);
          return;
        }
      }
    } catch {
      localStorage.removeItem(MEMBERS_STORAGE_KEY);
    }

    const seededMembers = mockMembers
      .map(normalizeMemberPackage)
      .sort((left, right) => left.id - right.id);
    saveMembers(seededMembers);
  };

  const filterAndSearchMembers = () => {
    let filtered = [...members];

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((m) => m.status === filterStatus);
    }

    // Filter by package
    if (filterPackage !== "all") {
      filtered = filtered.filter(
        (m) => m.packageId.toString() === filterPackage,
      );
    }

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(term) ||
          m.cardId.toLowerCase().includes(term) ||
          m.phone.includes(term) ||
          m.email.toLowerCase().includes(term),
      );
    }

    setFilteredMembers(filtered);
  };

  const handleSort = (field: string) => {
    const direction =
      sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(direction);

    const sorted = [...filteredMembers].sort((a, b) => {
      const aVal = a[field as keyof Member] ?? "";
      const bVal = b[field as keyof Member] ?? "";

      if (direction === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredMembers(sorted);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedPackage = packageOptions.find(
      (pkg) => pkg.value === formData.packageId,
    );

    if (!selectedPackage) {
      window.alert("Vui lòng chọn gói tập cho hội viên.");
      return;
    }

    if (!formData.endDate) {
      window.alert("Vui lòng chọn ngày bắt đầu và gói tập hợp lệ.");
      return;
    }

    const nextId =
      members.reduce((maxId, member) => Math.max(maxId, member.id), 0) + 1;
    const nextCardNumber =
      members.reduce((maxCardNumber, member) => {
        const numericPart = Number(member.cardId.replace(/[^0-9]/g, ""));
        return Number.isFinite(numericPart)
          ? Math.max(maxCardNumber, numericPart)
          : maxCardNumber;
      }, 0) + 1;
    const nextCardId = `GYM${String(nextCardNumber).padStart(3, "0")}`;
    const newMember: Member = {
      id: nextId,
      name: formData.name.trim(),
      cardId: nextCardId,
      phone: formData.phone.trim(),
      email: formData.email.trim().toLowerCase(),
      gender: formData.gender,
      packageName: selectedPackage.label,
      packageId: Number(selectedPackage.value),
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: getMemberStatus(formData.endDate),
      subscriptions: [
        {
          id: 1,
          packageId: Number(selectedPackage.value),
          packageName: selectedPackage.label,
          startDate: formData.startDate,
          endDate: formData.endDate,
          price: selectedPackage.price,
          color: "blue",
        },
      ],
    };

    saveMembers([...members, newMember]);
    setShowAddModal(false);
    resetForm();
    window.alert(`Đăng ký hội viên thành công. Mã thẻ mới: ${nextCardId}`);
  };

  const handleEditMember = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMember) {
      return;
    }

    const name = editFormData.name.trim();
    const phone = editFormData.phone.trim();
    const email = editFormData.email.trim().toLowerCase();

    if (
      !name ||
      !phone ||
      !email ||
      !editFormData.startDate ||
      !editFormData.endDate
    ) {
      window.alert("Vui lòng điền đầy đủ thông tin hội viên.");
      return;
    }

    if (editFormData.endDate < editFormData.startDate) {
      window.alert("Ngày hết hạn không được nhỏ hơn ngày bắt đầu.");
      return;
    }

    const nextMembers = members.map((member) =>
      member.id === selectedMember.id
        ? {
            ...member,
            name,
            phone,
            email,
            startDate: editFormData.startDate,
            endDate: editFormData.endDate,
            status: getMemberStatus(editFormData.endDate),
          }
        : member,
    );

    saveMembers(nextMembers);
    closeEditModal();
    window.alert("Đã cập nhật thông tin hội viên.");
  };

  const handleRenewMembership = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedPackage = activePackageOptions.find(
      (pkg) => pkg.value === renewPackageId,
    );

    if (!selectedPackage || renewTargetIds.length === 0) {
      window.alert("Vui lòng chọn gói gia hạn hợp lệ.");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updatedMembers = members.map((member) => {
      if (!renewTargetIds.includes(member.id)) {
        return member;
      }

      const currentEndDate = new Date(member.endDate);
      currentEndDate.setHours(0, 0, 0, 0);

      const baseDate = currentEndDate > today ? currentEndDate : today;
      const renewedEndDate = new Date(baseDate);
      renewedEndDate.setDate(
        renewedEndDate.getDate() + selectedPackage.duration,
      );

      const nextStartDate = formatInputDate(baseDate);
      const nextEndDate = formatInputDate(renewedEndDate);

      // Add new subscription
      const existingSubs = member.subscriptions || [];
      const newSubId =
        existingSubs.length > 0
          ? Math.max(...existingSubs.map((s) => s.id)) + 1
          : 1;
      const newSub: Subscription = {
        id: newSubId,
        packageId: Number(selectedPackage.value),
        packageName: selectedPackage.label,
        startDate: nextStartDate,
        endDate: nextEndDate,
        price: selectedPackage.price,
        color: "blue",
      };

      return {
        ...member,
        packageId: Number(selectedPackage.value),
        packageName: selectedPackage.label,
        startDate: nextStartDate,
        endDate: nextEndDate,
        status: getMemberStatus(nextEndDate),
        subscriptions: [...existingSubs, newSub],
      };
    });

    saveMembers(updatedMembers);
    setSelectedMemberIds([]);
    closeRenewModal();

    window.alert(
      renewTargetIds.length > 1
        ? `Đã gia hạn thành công ${renewTargetIds.length} hội viên.`
        : "Đã gia hạn hội viên thành công.",
    );
  };

  const handleDeleteMember = (member: Member) => {
    if (window.confirm(`Bạn có chắc muốn xóa hội viên ${member.name}?`)) {
      const nextMembers = members.filter(
        (currentMember) => currentMember.id !== member.id,
      );
      saveMembers(nextMembers);
      setSelectedMemberIds((currentIds) =>
        currentIds.filter((memberId) => memberId !== member.id),
      );
    }
  };

  const handlePrintMembers = () => {
    const dataToPrint = filteredMembers;

    if (dataToPrint.length === 0) {
      window.alert("Không có dữ liệu hội viên để in.");
      return;
    }

    const printedAt = new Date();
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      window.alert(
        "Trình duyệt đang chặn cửa sổ in. Hãy cho phép popup và thử lại.",
      );
      return;
    }

    const tableRows = dataToPrint
      .map((member, index) => {
        const status = member.status;
        return `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(member.cardId)}</td>
            <td>${escapeHtml(member.name)}</td>
            <td>${escapeHtml(member.phone)}</td>
            <td>${escapeHtml(member.email)}</td>
            <td>${escapeHtml(member.packageName)}</td>
            <td>${escapeHtml(formatDisplayDate(member.endDate))}</td>
            <td class="status-${status}">${escapeHtml(getStatusText(status))}</td>
          </tr>
        `;
      })
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="vi">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Danh sách hội viên - FitZone Gym</title>
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 36px 34px 28px;
              font-family: Arial, sans-serif;
              color: #1f2937;
              background: #ffffff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            h1 {
              margin: 20px 0 28px;
              text-align: center;
              color: #1e293b;
              font-size: 34px;
              font-weight: 800;
              letter-spacing: 0.01em;
            }
            .print-date {
              margin: 0 0 18px;
              text-align: right;
              font-size: 16px;
              color: #475569;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              table-layout: fixed;
            }
            th, td {
              border: 1px solid #d3d8e2;
              padding: 12px 14px;
              text-align: left;
              font-size: 14px;
              vertical-align: middle;
              line-height: 1.4;
            }
            th {
              background: #6366f1 !important;
              color: #ffffff !important;
              font-weight: 700;
              font-size: 15px;
            }
            th:nth-child(1), td:nth-child(1) { width: 62px; }
            th:nth-child(2), td:nth-child(2) { width: 100px; }
            th:nth-child(4), td:nth-child(4) { width: 146px; }
            th:nth-child(6), td:nth-child(6) { width: 138px; }
            th:nth-child(7), td:nth-child(7) { width: 150px; }
            th:nth-child(8), td:nth-child(8) { width: 120px; }
            td {
              color: #111827;
            }
            .status-active { color: #10b981; font-weight: 700; }
            .status-expiring { color: #f59e0b; font-weight: 700; }
            .status-expired { color: #ef4444; font-weight: 700; }
            .sheet {
              width: 100%;
            }
            @page { size: A4 portrait; margin: 16mm; }
          </style>
        </head>
        <body>
          <div class="sheet">
            <h1>DANH SÁCH HỘI VIÊN - FITZONE GYM</h1>
            <p class="print-date">Ngày in: ${escapeHtml(printedAt.toLocaleDateString("vi-VN"))}</p>
            <table>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Mã thẻ</th>
                  <th>Họ tên</th>
                  <th>SĐT</th>
                  <th>Email</th>
                  <th>Gói tập</th>
                  <th>Ngày hết hạn</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>${tableRows}</tbody>
            </table>
          </div>
          <script>
            window.onload = function () {
              setTimeout(function () {
                window.print();
              }, 120);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleExportMembers = () => {
    const dataToExport = filteredMembers;

    if (dataToExport.length === 0) {
      window.alert("Không có dữ liệu hội viên để xuất Excel.");
      return;
    }

    const exportedAt = new Date();
    const tableRows = dataToExport
      .map((member, index) => {
        const status = member.status;
        return `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(member.cardId)}</td>
            <td>${escapeHtml(member.name)}</td>
            <td>${escapeHtml(getGenderLabel(member.gender))}</td>
            <td>${escapeHtml(member.phone)}</td>
            <td>${escapeHtml(member.email)}</td>
            <td>${escapeHtml(member.packageName)}</td>
            <td>${escapeHtml(formatDisplayDate(member.startDate))}</td>
            <td>${escapeHtml(formatDisplayDate(member.endDate))}</td>
            <td>${escapeHtml(getStatusText(status))}</td>
          </tr>
        `;
      })
      .join("");

    const excelContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:x="urn:schemas-microsoft-com:office:excel"
            xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="UTF-8" />
          <!--[if gte mso 9]>
            <xml>
              <x:ExcelWorkbook>
                <x:ExcelWorksheets>
                  <x:ExcelWorksheet>
                    <x:Name>HoiVien</x:Name>
                    <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
                  </x:ExcelWorksheet>
                </x:ExcelWorksheets>
              </x:ExcelWorkbook>
            </xml>
          <![endif]-->
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; color: #1e293b; font-size: 24px; }
            .meta { text-align: right; margin-bottom: 16px; color: #64748b; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #d5dbe6; padding: 8px; }
            th { background: #eef2ff; color: #4338ca; font-weight: 700; }
          </style>
        </head>
        <body>
          <h1>DANH SÁCH HỘI VIÊN - FITZONE GYM</h1>
          <div class="meta">Ngày xuất: ${escapeHtml(exportedAt.toLocaleString("vi-VN"))}</div>
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã thẻ</th>
                <th>Họ tên</th>
                <th>Giới tính</th>
                <th>SĐT</th>
                <th>Email</th>
                <th>Gói tập</th>
                <th>Ngày bắt đầu</th>
                <th>Ngày hết hạn</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob(["\uFEFF", excelContent], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `danh-sach-hoi-vien-${formatInputDate(exportedAt)}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const updateEndDate = () => {
    const selectedPackage = packageOptions.find(
      (pkg) => pkg.value === formData.packageId,
    );

    if (!selectedPackage || !formData.startDate) {
      if (formData.endDate || formData.totalAmount) {
        setFormData((currentData) => ({
          ...currentData,
          endDate: "",
          totalAmount: "",
        }));
      }
      return;
    }

    const start = new Date(formData.startDate);
    start.setDate(start.getDate() + selectedPackage.duration);
    const nextEndDate = formatInputDate(start);
    const nextTotalAmount = `${selectedPackage.price.toLocaleString("vi-VN")}đ`;

    if (
      formData.endDate !== nextEndDate ||
      formData.totalAmount !== nextTotalAmount
    ) {
      setFormData((currentData) => ({
        ...currentData,
        endDate: nextEndDate,
        totalAmount: nextTotalAmount,
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      gender: "",
      packageId: "",
      startDate: formatInputDate(new Date()),
      endDate: "",
      totalAmount: "",
    });
  };

  const resetEditForm = () => {
    setEditFormData(createDefaultEditFormData());
  };

  const openDetailModal = (member: Member) => {
    setSelectedMember(member);
    setShowDetailModal(true);
  };

  const openAddModal = () => {
    refreshPackageOptions();
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (member: Member) => {
    setSelectedMember(member);
    setEditFormData(createDefaultEditFormData(member));
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedMember(null);
    resetEditForm();
  };

  const closeRenewModal = () => {
    setShowRenewModal(false);
    setRenewTargetIds([]);
    setRenewPackageId("");
  };

  const openRenewModal = (member: Member) => {
    refreshPackageOptions();
    setRenewTargetIds([member.id]);
    setRenewPackageId("");
    setShowRenewModal(true);
  };

  const toggleMemberSelection = (memberId: number) => {
    setSelectedMemberIds((currentIds) =>
      currentIds.includes(memberId)
        ? currentIds.filter((id) => id !== memberId)
        : [...currentIds, memberId],
    );
  };

  const toggleSelectAllMembers = () => {
    const visibleMemberIds = filteredMembers.map((member) => member.id);

    setSelectedMemberIds((currentIds) => {
      const areAllVisibleMembersSelected =
        visibleMemberIds.length > 0 &&
        visibleMemberIds.every((memberId) => currentIds.includes(memberId));

      if (areAllVisibleMembersSelected) {
        return currentIds.filter(
          (memberId) => !visibleMemberIds.includes(memberId),
        );
      }

      const nextIds = [...currentIds];
      visibleMemberIds.forEach((memberId) => {
        if (!nextIds.includes(memberId)) {
          nextIds.push(memberId);
        }
      });

      return nextIds;
    });
  };

  const clearSelection = () => {
    setSelectedMemberIds([]);
  };

  const handleBulkRenew = () => {
    if (selectedMemberIds.length === 0) {
      window.alert("Vui lòng chọn hội viên cần gia hạn.");
      return;
    }

    refreshPackageOptions();
    setRenewTargetIds(selectedMemberIds);
    setRenewPackageId("");
    setShowRenewModal(true);
  };

  const handleDeleteSelectedMembers = () => {
    if (selectedMemberIds.length === 0) {
      window.alert("Vui lòng chọn hội viên cần xóa.");
      return;
    }

    if (
      !window.confirm(
        `Bạn có chắc muốn xóa ${selectedMemberIds.length} hội viên đã chọn?`,
      )
    ) {
      return;
    }

    const nextMembers = members.filter(
      (member) => !selectedMemberIds.includes(member.id),
    );

    saveMembers(nextMembers);
    setSelectedMemberIds([]);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: <span className="status-badge active">Còn hạn</span>,
      expiring: <span className="status-badge expiring">Sắp hết hạn</span>,
      expired: <span className="status-badge expired">Hết hạn</span>,
    };
    return badges[status as keyof typeof badges];
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return "fas fa-sort";
    }

    return sortDirection === "asc" ? "fas fa-sort-up" : "fas fa-sort-down";
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterPackage("all");
  };

  const stats = {
    total: members.length,
    active: members.filter((m) => m.status === "active").length,
    expiring: members.filter((m) => m.status === "expiring").length,
    expired: members.filter((m) => m.status === "expired").length,
  };

  const selectedMemberStatus = selectedMember
    ? getMemberStatus(selectedMember.endDate)
    : null;
  const selectedMemberDuration = selectedMember
    ? getMembershipDurationText(selectedMember.endDate)
    : "";
  const selectedMemberAvatarTone = selectedMember
    ? getAvatarTone(selectedMember.gender)
    : "blue";
  const activePackageOptions = packageOptions.filter(
    (pkg) => pkg.status === "active",
  );
  const selectedVisibleCount = filteredMembers.filter((member) =>
    selectedMemberIds.includes(member.id),
  ).length;
  const allVisibleSelected =
    filteredMembers.length > 0 &&
    filteredMembers.every((member) => selectedMemberIds.includes(member.id));
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;
  const renewMembers = members.filter((member) =>
    renewTargetIds.includes(member.id),
  );
  const primaryRenewMember = renewMembers[0] || null;
  const isBulkRenew = renewTargetIds.length > 1;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someVisibleSelected;
    }
  }, [someVisibleSelected]);

  return (
    <div className="members-page">
      <div className="page-header">
        <div className="page-title">
          <h1>
            <i className="fas fa-users"></i> Quản lý Hội viên
          </h1>
          <p>Danh sách tất cả hội viên trong hệ thống</p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={openAddModal}
          >
            <i className="fas fa-plus"></i> Thêm hội viên
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handlePrintMembers}
          >
            <i className="fas fa-print"></i> In
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExportMembers}
          >
            <i className="fas fa-download"></i> Xuất Excel
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
            <span className="summary-label">Tổng hội viên</span>
          </div>
        </div>
        <div className="summary-item active">
          <div className="summary-icon green">
            <i className="fas fa-user-check"></i>
          </div>
          <div className="summary-content">
            <span className="summary-value">{stats.active}</span>
            <span className="summary-label">Còn hạn</span>
          </div>
        </div>
        <div className="summary-item expiring">
          <div className="summary-icon orange">
            <i className="fas fa-hourglass-half"></i>
          </div>
          <div className="summary-content">
            <span className="summary-value">{stats.expiring}</span>
            <span className="summary-label">Sắp hết hạn</span>
          </div>
        </div>
        <div className="summary-item expired">
          <div className="summary-icon red">
            <i className="fas fa-user-slash"></i>
          </div>
          <div className="summary-content">
            <span className="summary-value">{stats.expired}</span>
            <span className="summary-label">Hết hạn</span>
          </div>
        </div>
      </div>

      {selectedMemberIds.length > 0 && (
        <div className="bulk-actions-bar">
          <div className="bulk-info">
            <span className="bulk-count">{selectedMemberIds.length}</span> hội
            viên đã chọn
          </div>
          <div className="bulk-buttons">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={clearSelection}
            >
              <i className="fas fa-times"></i> Bỏ chọn
            </button>
            <button
              type="button"
              className="btn btn-warning btn-sm"
              onClick={handleBulkRenew}
            >
              <i className="fas fa-sync"></i> Gia hạn
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={handleDeleteSelectedMembers}
            >
              <i className="fas fa-trash"></i> Xóa
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div className="filter-group">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Còn hạn</option>
              <option value="expiring">Sắp hết hạn</option>
              <option value="expired">Hết hạn</option>
            </select>
            <select
              value={filterPackage}
              onChange={(e) => setFilterPackage(e.target.value)}
            >
              <option value="all">Tất cả gói tập</option>
              {packageOptions.map((pkg) => (
                <option key={pkg.value} value={pkg.value}>
                  {pkg.label}
                </option>
              ))}
            </select>
          </div>
          <div className="table-info">
            Hiển thị <span>{filteredMembers.length}</span> hội viên
          </div>
        </div>
        <div className="card-body">
          <div className="table-container">
            <table className="data-table" id="membersTable">
              <thead>
                <tr>
                  <th>
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      className="member-checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAllMembers}
                      aria-label="Chọn tất cả hội viên đang hiển thị"
                    />
                  </th>
                  <th
                    onClick={() => handleSort("name")}
                    style={{ cursor: "pointer" }}
                  >
                    Hội viên <i className={getSortIcon("name")}></i>
                  </th>
                  <th
                    onClick={() => handleSort("cardId")}
                    style={{ cursor: "pointer" }}
                  >
                    Mã thẻ <i className={getSortIcon("cardId")}></i>
                  </th>
                  <th>Số điện thoại</th>
                  <th>Email</th>
                  <th>Gói tập</th>
                  <th
                    onClick={() => handleSort("endDate")}
                    style={{ cursor: "pointer" }}
                  >
                    Ngày hết hạn <i className={getSortIcon("endDate")}></i>
                  </th>
                  <th
                    onClick={() => handleSort("status")}
                    style={{ cursor: "pointer" }}
                  >
                    Trạng thái <i className={getSortIcon("status")}></i>
                  </th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => (
                    <tr
                      key={member.id}
                      className={
                        selectedMemberIds.includes(member.id) ? "selected" : ""
                      }
                    >
                      <td>
                        <input
                          type="checkbox"
                          className="member-checkbox"
                          checked={selectedMemberIds.includes(member.id)}
                          onChange={() => toggleMemberSelection(member.id)}
                          aria-label={`Chọn hội viên ${member.name}`}
                        />
                      </td>
                      <td>
                        <div className="member-info">
                          <div
                            className={`member-avatar-badge ${getAvatarTone(member.gender)}`}
                          >
                            {getInitials(member.name)}
                          </div>
                          <div className="member-meta">
                            <span className="member-name">{member.name}</span>
                            <span className="member-subtitle">
                              {getGenderLabel(member.gender)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="card-id">{member.cardId}</span>
                      </td>
                      <td>{member.phone}</td>
                      <td>{member.email}</td>
                      <td>
                        {member.subscriptions &&
                        member.subscriptions.length > 0 ? (
                          <div className="multi-packages">
                            {member.subscriptions
                              .filter((sub) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const end = new Date(sub.endDate);
                                end.setHours(0, 0, 0, 0);
                                return end >= today;
                              })
                              .map((sub, idx) => (
                                <span
                                  key={idx}
                                  className={`pkg-tag pkg-tag-${sub.color || "blue"}`}
                                >
                                  {sub.packageName}
                                </span>
                              ))}
                            {member.subscriptions.filter((sub) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              const end = new Date(sub.endDate);
                              end.setHours(0, 0, 0, 0);
                              return end >= today;
                            }).length === 0 && (
                              <span className="pkg-tag pkg-tag-expired">
                                {member.packageName}
                              </span>
                            )}
                          </div>
                        ) : (
                          member.packageName
                        )}
                      </td>
                      <td>{formatDisplayDate(member.endDate)}</td>
                      <td>{getStatusBadge(member.status)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            type="button"
                            className="btn-icon btn-view"
                            title="Xem"
                            onClick={() => openDetailModal(member)}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            type="button"
                            className="btn-icon btn-edit"
                            title="Chỉnh sửa"
                            onClick={() => openEditModal(member)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            type="button"
                            className="btn-icon btn-renew"
                            title="Gia hạn"
                            onClick={() => openRenewModal(member)}
                          >
                            <i className="fas fa-sync"></i>
                          </button>
                          <button
                            type="button"
                            className="btn-icon btn-delete"
                            title="Xóa"
                            onClick={() => handleDeleteMember(member)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9}>
                      <div className="members-empty-state">
                        <div className="members-empty-icon">
                          <i className="fas fa-user-slash"></i>
                        </div>
                        <h3>Không tìm thấy hội viên phù hợp</h3>
                        <p>Thử đổi bộ lọc để xem thêm dữ liệu.</p>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={clearFilters}
                        >
                          Xóa bộ lọc
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Member Modal */}
      {showDetailModal && selectedMember && selectedMemberStatus && (
        <div className="modal">
          <div
            className="modal-overlay"
            onClick={() => setShowDetailModal(false)}
          ></div>
          <div className="modal-content members-detail-modal">
            <div className="modal-header">
              <h2>
                <i className="fas fa-user"></i> Chi tiết hội viên
              </h2>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowDetailModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="member-detail-card">
                <div className="member-detail-hero">
                  <div
                    className={`member-detail-avatar ${selectedMemberAvatarTone}`}
                  >
                    {getInitials(selectedMember.name)}
                  </div>
                  <div className="member-detail-summary">
                    <h3>{selectedMember.name}</h3>
                    {getStatusBadge(selectedMemberStatus)}
                  </div>
                </div>
                <div className="member-detail-body">
                  <div className="detail-row">
                    <span>Mã thẻ:</span>
                    <strong>{selectedMember.cardId}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Giới tính:</span>
                    <strong>{getGenderLabel(selectedMember.gender)}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Số điện thoại:</span>
                    <strong>{selectedMember.phone}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Email:</span>
                    <strong>{selectedMember.email}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Gói tập:</span>
                    <strong>
                      {selectedMember.subscriptions &&
                      selectedMember.subscriptions.length > 0 ? (
                        <div className="multi-packages-detail">
                          {selectedMember.subscriptions.map((sub, idx) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const end = new Date(sub.endDate);
                            end.setHours(0, 0, 0, 0);
                            const isActive = end >= today;
                            return (
                              <div
                                key={idx}
                                className={`pkg-detail-item ${isActive ? "active" : "expired"}`}
                              >
                                <span
                                  className={`pkg-tag pkg-tag-${sub.color || "blue"}`}
                                >
                                  {sub.packageName}
                                </span>
                                <span className="pkg-detail-date">
                                  {isActive
                                    ? `Còn hạn đến ${formatDisplayDate(sub.endDate)}`
                                    : "Hết hạn"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        selectedMember.packageName
                      )}
                    </strong>
                  </div>
                  <div className="detail-row">
                    <span>Ngày bắt đầu:</span>
                    <strong>
                      {formatDisplayDate(selectedMember.startDate)}
                    </strong>
                  </div>
                  <div className="detail-row">
                    <span>Ngày hết hạn:</span>
                    <strong>{formatDisplayDate(selectedMember.endDate)}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Thời hạn:</span>
                    <strong
                      className={`detail-duration ${selectedMemberStatus}`}
                    >
                      {selectedMemberDuration}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="modal">
          <div
            className="modal-overlay"
            onClick={() => setShowAddModal(false)}
          ></div>
          <div className="modal-content members-add-modal">
            <div className="modal-header">
              <h2>
                <i className="fas fa-user-plus"></i> Đăng ký hội viên mới
              </h2>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowAddModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleAddMember} className="members-add-form">
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
                        setFormData({ ...formData, gender: e.target.value })
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
                      <i className="fas fa-box"></i> Gói tập
                    </label>
                    <select
                      id="memberPackage"
                      value={formData.packageId}
                      onChange={(e) =>
                        setFormData((currentData) => ({
                          ...currentData,
                          packageId: e.target.value,
                        }))
                      }
                      disabled={activePackageOptions.length === 0}
                      required
                    >
                      <option value="">
                        {activePackageOptions.length > 0
                          ? "Chọn gói tập"
                          : "Chưa có gói tập hoạt động"}
                      </option>
                      {activePackageOptions.map((pkg) => (
                        <option key={pkg.value} value={pkg.value}>
                          {pkg.label} - {pkg.price.toLocaleString("vi-VN")}đ
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>
                      <i className="fas fa-calendar"></i> Ngày bắt đầu
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <i className="fas fa-calendar-check"></i> Ngày hết hạn
                    </label>
                    <input type="date" value={formData.endDate} readOnly />
                  </div>
                  <div className="form-group">
                    <label>
                      <i className="fas fa-money-bill"></i> Số tiền
                    </label>
                    <input
                      type="text"
                      value={formData.totalAmount}
                      readOnly
                      placeholder="Tự động tính"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-save"></i> Đăng ký
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditModal && selectedMember && (
        <div className="modal">
          <div className="modal-overlay" onClick={closeEditModal}></div>
          <div className="modal-content members-add-modal">
            <div className="modal-header">
              <h2>
                <i className="fas fa-edit"></i> Chỉnh sửa hội viên
              </h2>
              <button className="close-btn" onClick={closeEditModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleEditMember} className="members-add-form">
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Họ và tên</label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) =>
                        setEditFormData((currentData) => ({
                          ...currentData,
                          name: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input
                      type="tel"
                      value={editFormData.phone}
                      onChange={(e) =>
                        setEditFormData((currentData) => ({
                          ...currentData,
                          phone: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) =>
                        setEditFormData((currentData) => ({
                          ...currentData,
                          email: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Mã thẻ</label>
                    <input
                      type="text"
                      defaultValue={selectedMember.cardId}
                      readOnly
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Ngày bắt đầu</label>
                    <input
                      type="date"
                      value={editFormData.startDate}
                      onChange={(e) =>
                        setEditFormData((currentData) => ({
                          ...currentData,
                          startDate: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Ngày hết hạn</label>
                    <input
                      type="date"
                      value={editFormData.endDate}
                      onChange={(e) =>
                        setEditFormData((currentData) => ({
                          ...currentData,
                          endDate: e.target.value,
                        }))
                      }
                      required
                    />
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
                  <i className="fas fa-save"></i> Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Renew Modal */}
      {showRenewModal && renewMembers.length > 0 && (
        <div className="modal">
          <div className="modal-overlay" onClick={closeRenewModal}></div>
          <div className="modal-content members-add-modal modal-sm">
            <div className="modal-header">
              <h2>
                <i className="fas fa-sync"></i>{" "}
                {isBulkRenew ? "Gia hạn hàng loạt" : "Gia hạn thẻ tập"}
              </h2>
              <button className="close-btn" onClick={closeRenewModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleRenewMembership} className="members-add-form">
              <div className="modal-body">
                <div className="member-renew-info">
                  {isBulkRenew ? (
                    <>
                      <p>
                        <strong>Số hội viên:</strong> {renewMembers.length}
                      </p>
                      <p>
                        <strong>Phạm vi:</strong> Gia hạn cho toàn bộ hội viên
                        đã chọn
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        <strong>Hội viên:</strong> {primaryRenewMember?.name}
                      </p>
                      <p>
                        <strong>Mã thẻ:</strong> {primaryRenewMember?.cardId}
                      </p>
                      <p>
                        <strong>Hết hạn:</strong>{" "}
                        {primaryRenewMember
                          ? new Date(
                              primaryRenewMember.endDate,
                            ).toLocaleDateString("vi-VN")
                          : ""}
                      </p>
                    </>
                  )}
                </div>
                <div className="form-group">
                  <label>Chọn gói gia hạn</label>
                  <select
                    value={renewPackageId}
                    onChange={(e) => setRenewPackageId(e.target.value)}
                    required
                  >
                    <option value="">
                      {activePackageOptions.length > 0
                        ? "Chọn gói tập"
                        : "Chưa có gói tập hoạt động"}
                    </option>
                    {activePackageOptions.map((pkg) => (
                      <option key={pkg.value} value={pkg.value}>
                        {pkg.label} - {pkg.price.toLocaleString("vi-VN")}đ
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeRenewModal}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-check"></i> Gia hạn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
