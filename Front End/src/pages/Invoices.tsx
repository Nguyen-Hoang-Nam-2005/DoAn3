import React, { useEffect, useRef, useState } from "react";
import "./invoices.css";

type InvoiceType =
  | "membership"
  | "pt"
  | "product"
  | "other"
  | "equipment_purchase"
  | "equipment_sale";
type InvoiceStatus = "paid" | "pending" | "cancelled";
type PaymentMethod = "cash" | "transfer" | "card";
type ToastType = "success" | "error";

interface Member {
  id: number;
  name: string;
  cardId: string;
  gender?: "male" | "female";
  phone?: string;
}

interface Equipment {
  id: number;
  name: string;
  code: string;
  price: number | null;
  brand: string;
}

interface InvoiceItem {
  id: string;
  name: string;
  price: number;
}

interface Invoice {
  id: number;
  invoiceId: string;
  customerId: number;
  customerName: string;
  customerPhone: string;
  type: InvoiceType;
  itemId: string;
  itemName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: InvoiceStatus;
  note: string;
  createdAt: string;
  paidAt?: string;
}

interface InvoiceForm {
  customerId: string;
  partnerName: string;
  type: InvoiceType | "";
  itemId: string;
  quantity: number;
  discount: number;
  paymentMethod: PaymentMethod;
  status: InvoiceStatus;
  note: string;
}

interface ToastState {
  message: string;
  type: ToastType;
}

const MEMBERS_STORAGE_KEY = "gymMembers";
const EQUIPMENT_STORAGE_KEY = "gymEquipment";
const INVOICES_STORAGE_KEY = "gymInvoices";

const PRODUCT_OPTIONS: Record<
  "membership" | "pt" | "product" | "other",
  InvoiceItem[]
> = {
  membership: [
    { id: "pkg1", name: "Gói 1 tháng", price: 500000 },
    { id: "pkg2", name: "Gói 3 tháng", price: 1200000 },
    { id: "pkg3", name: "Gói 6 tháng", price: 2000000 },
    { id: "pkg4", name: "Gói 12 tháng", price: 3500000 },
  ],
  pt: [
    { id: "pt1", name: "PT 1 buổi", price: 300000 },
    { id: "pt5", name: "PT 5 buổi", price: 1400000 },
    { id: "pt10", name: "PT 10 buổi", price: 2500000 },
    { id: "pt20", name: "PT 20 buổi", price: 4500000 },
  ],
  product: [
    { id: "prd1", name: "Whey Protein 1kg", price: 800000 },
    { id: "prd2", name: "BCAA 300g", price: 450000 },
    { id: "prd3", name: "Găng tay tập", price: 150000 },
    { id: "prd4", name: "Dây kháng lực", price: 120000 },
    { id: "prd5", name: "Bình nước Gym", price: 80000 },
  ],
  other: [
    { id: "oth1", name: "Phí gửi đồ tháng", price: 100000 },
    { id: "oth2", name: "Khăn tập", price: 50000 },
    { id: "oth3", name: "Dịch vụ khác", price: 0 },
  ],
};

const DEFAULT_FORM: InvoiceForm = {
  customerId: "",
  partnerName: "",
  type: "",
  itemId: "",
  quantity: 1,
  discount: 0,
  paymentMethod: "cash",
  status: "paid",
  note: "",
};

const formatCurrency = (value: number) =>
  `${new Intl.NumberFormat("vi-VN").format(value)}đ`;

const formatCurrencyShort = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}K`;
  return value.toString();
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("vi-VN");

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const getMonthKey = (value: string) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const createLocalIso = (year: number, month: number, day: number) =>
  new Date(year, month, day, 12, 0, 0).toISOString();

const getAvatarUrl = (name: string, gender?: "male" | "female") =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${gender === "female" ? "ec4899" : "3b82f6"}&color=fff`;

const getTypeLabel = (type: InvoiceType) =>
  ({
    membership: "Gói tập",
    pt: "PT",
    product: "Sản phẩm",
    other: "Khác",
    equipment_purchase: "Mua thiết bị",
    equipment_sale: "Bán thiết bị",
  })[type];

const getStatusLabel = (status: InvoiceStatus) =>
  ({
    paid: "Đã thanh toán",
    pending: "Chờ thanh toán",
    cancelled: "Đã hủy",
  })[status];

const getPaymentLabel = (method: PaymentMethod) =>
  ({
    cash: "Tiền mặt",
    transfer: "Chuyển khoản",
    card: "Thẻ",
  })[method];

const isEquipmentInvoiceType = (
  type: InvoiceType | "",
): type is "equipment_purchase" | "equipment_sale" =>
  type === "equipment_purchase" || type === "equipment_sale";

const isExpenseInvoice = (type: InvoiceType) => type === "equipment_purchase";

const getCounterpartyLabel = (type: InvoiceType | "") => {
  if (type === "equipment_purchase") {
    return "Nhà cung cấp";
  }

  if (type === "equipment_sale") {
    return "Bên mua";
  }

  return "Khách hàng";
};

const getCounterpartyPlaceholder = (type: InvoiceType | "") => {
  if (type === "equipment_purchase") {
    return "Nhập tên nhà cung cấp";
  }

  if (type === "equipment_sale") {
    return "Nhập tên bên mua thiết bị";
  }

  return "Chọn khách hàng";
};

const getCounterpartyIcon = (type: InvoiceType | "") => {
  if (type === "equipment_purchase") {
    return "fa-truck-loading";
  }

  if (type === "equipment_sale") {
    return "fa-handshake";
  }

  return "fa-user";
};

const getItemFieldLabel = (type: InvoiceType | "") =>
  isEquipmentInvoiceType(type) ? "Thiết bị" : "Sản phẩm/Dịch vụ";

const getInvoiceItems = (
  type: InvoiceType | "",
  equipment: Equipment[],
): InvoiceItem[] => {
  if (!type) {
    return [];
  }

  if (isEquipmentInvoiceType(type)) {
    return equipment.map((item) => ({
      id: `equipment-${item.id}`,
      name: `${item.name} (${item.code})`,
      price: item.price ?? 0,
    }));
  }

  return PRODUCT_OPTIONS[type];
};

const getSignedInvoiceTotal = (invoice: Invoice) =>
  isExpenseInvoice(invoice.type) ? -invoice.total : invoice.total;

const formatSignedCurrency = (invoice: Invoice) =>
  `${isExpenseInvoice(invoice.type) ? "-" : ""}${formatCurrency(invoice.total)}`;

const buildInvoiceDescription = (
  type: InvoiceType,
  itemName: string,
  quantity: number,
) => {
  const quantityText = quantity > 1 ? ` x${quantity}` : "";

  if (type === "equipment_purchase") {
    return `Nhập mua ${itemName}${quantityText}`;
  }

  if (type === "equipment_sale") {
    return `Xuất bán ${itemName}${quantityText}`;
  }

  return `${itemName}${quantityText}`;
};

const parseStoredJson = <T,>(storageKey: string): T | null => {
  try {
    const rawValue = localStorage.getItem(storageKey);
    return rawValue ? (JSON.parse(rawValue) as T) : null;
  } catch {
    return null;
  }
};

const seedMembers = (): Member[] => [
  {
    id: 1,
    name: "Nguyễn Văn An",
    cardId: "GYM001",
    phone: "0901234567",
    gender: "male",
  },
  {
    id: 2,
    name: "Trần Thị Bình",
    cardId: "GYM002",
    phone: "0912345678",
    gender: "female",
  },
  {
    id: 3,
    name: "Lê Minh Cường",
    cardId: "GYM003",
    phone: "0923456789",
    gender: "male",
  },
  {
    id: 4,
    name: "Phạm Thu Dung",
    cardId: "GYM004",
    phone: "0934567890",
    gender: "female",
  },
  {
    id: 5,
    name: "Hoàng Văn Em",
    cardId: "GYM005",
    phone: "0945678901",
    gender: "male",
  },
];

const seedEquipment = (): Equipment[] => [
  {
    id: 1,
    name: "Máy chạy bộ Life Fitness",
    code: "TRD-001",
    price: 85000000,
    brand: "Life Fitness",
  },
  {
    id: 2,
    name: "Xe đạp tập Technogym",
    code: "BIK-001",
    price: 45000000,
    brand: "Technogym",
  },
  {
    id: 3,
    name: "Máy đẩy ngực Hammer Strength",
    code: "CHE-001",
    price: 55000000,
    brand: "Hammer Strength",
  },
  {
    id: 4,
    name: "Smith Machine Rogue",
    code: "SMT-001",
    price: 75000000,
    brand: "Rogue",
  },
  {
    id: 5,
    name: "Bộ tạ đơn 1-30kg",
    code: "DUM-001",
    price: 35000000,
    brand: "Rogue",
  },
];

const loadStoredMembers = () => {
  const storedMembers = parseStoredJson<Member[]>(MEMBERS_STORAGE_KEY);
  if (Array.isArray(storedMembers) && storedMembers.length > 0) {
    return storedMembers.map((member, index) => ({
      id: member.id ?? index + 1,
      name: member.name ?? "Hội viên",
      cardId: member.cardId ?? `GYM${String(index + 1).padStart(3, "0")}`,
      phone: member.phone ?? "",
      gender: member.gender ?? "male",
    }));
  }

  const fallbackMembers = seedMembers();
  localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(fallbackMembers));
  return fallbackMembers;
};

const loadStoredEquipment = () => {
  const storedEquipment = parseStoredJson<Array<Partial<Equipment>>>(
    EQUIPMENT_STORAGE_KEY,
  );

  if (Array.isArray(storedEquipment) && storedEquipment.length > 0) {
    return storedEquipment
      .map((item, index) => ({
        id: typeof item.id === "number" ? item.id : index + 1,
        name:
          typeof item.name === "string" ? item.name : `Thiết bị ${index + 1}`,
        code:
          typeof item.code === "string"
            ? item.code.toUpperCase()
            : `EQP-${String(index + 1).padStart(3, "0")}`,
        price:
          typeof item.price === "number" && Number.isFinite(item.price)
            ? item.price
            : null,
        brand: typeof item.brand === "string" ? item.brand : "",
      }))
      .filter((item) => item.name.trim() !== "");
  }

  return seedEquipment();
};

const createSeedInvoices = (
  members: Member[],
  equipment: Equipment[],
): Invoice[] => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const prevMonth = new Date(year, month - 1, 1);
  const pickMember = (id: number) =>
    members.find((member) => member.id === id) ?? members[0];
  const equipmentItems = equipment.map((item) => ({
    id: `equipment-${item.id}`,
    name: `${item.name} (${item.code})`,
    price: item.price ?? 0,
  }));

  const makeInvoice = (
    id: number,
    invoiceId: string,
    customerId: number,
    customerName: string,
    customerPhone: string,
    type: InvoiceType,
    itemId: string,
    quantity: number,
    discount: number,
    paymentMethod: PaymentMethod,
    status: InvoiceStatus,
    createdAt: string,
  ): Invoice => {
    const itemSource =
      type === "equipment_purchase" || type === "equipment_sale"
        ? equipmentItems
        : PRODUCT_OPTIONS[type];
    const item =
      itemSource.find((option) => option.id === itemId) ?? itemSource[0];
    const subtotal = item.price * quantity;
    const total = subtotal - (subtotal * discount) / 100;

    return {
      id,
      invoiceId,
      customerId,
      customerName,
      customerPhone,
      type,
      itemId: item.id,
      itemName: item.name,
      description: `${item.name}${quantity > 1 ? ` x${quantity}` : ""}`,
      quantity,
      unitPrice: item.price,
      subtotal,
      discount,
      total,
      paymentMethod,
      status,
      note: "",
      createdAt,
      paidAt: status === "paid" ? createdAt : undefined,
    };
  };

  const memberOne = pickMember(1);
  const memberTwo = pickMember(2);
  const memberThree = pickMember(3);
  const memberFour = pickMember(4);
  const memberFive = pickMember(5);
  const treadmillItem = equipmentItems[0] ?? {
    id: "equipment-1",
    name: "Máy chạy bộ Life Fitness (TRD-001)",
    price: 85000000,
  };
  const bikeItem = equipmentItems[1] ?? {
    id: "equipment-2",
    name: "Xe đạp tập Technogym (BIK-001)",
    price: 45000000,
  };

  return [
    makeInvoice(
      1,
      "INV202604001",
      memberOne.id,
      memberOne.name,
      memberOne.phone ?? "",
      "membership",
      "pkg4",
      1,
      0,
      "transfer",
      "paid",
      createLocalIso(year, month, 1),
    ),
    makeInvoice(
      2,
      "INV202604002",
      memberTwo.id,
      memberTwo.name,
      memberTwo.phone ?? "",
      "membership",
      "pkg3",
      1,
      10,
      "cash",
      "paid",
      createLocalIso(year, month, 3),
    ),
    makeInvoice(
      3,
      "INV202604003",
      memberThree.id,
      memberThree.name,
      memberThree.phone ?? "",
      "pt",
      "pt10",
      1,
      0,
      "card",
      "paid",
      createLocalIso(year, month, 5),
    ),
    makeInvoice(
      4,
      "INV202604004",
      memberFour.id,
      memberFour.name,
      memberFour.phone ?? "",
      "product",
      "prd1",
      2,
      5,
      "cash",
      "paid",
      createLocalIso(year, month, 10),
    ),
    makeInvoice(
      5,
      "INV202604005",
      memberFive.id,
      memberFive.name,
      memberFive.phone ?? "",
      "membership",
      "pkg2",
      1,
      0,
      "transfer",
      "pending",
      createLocalIso(year, month, 15),
    ),
    makeInvoice(
      6,
      "INV202604006",
      memberOne.id,
      memberOne.name,
      memberOne.phone ?? "",
      "product",
      "prd3",
      1,
      0,
      "cash",
      "paid",
      createLocalIso(year, month, 18),
    ),
    makeInvoice(
      7,
      "INV202604007",
      memberTwo.id,
      memberTwo.name,
      memberTwo.phone ?? "",
      "other",
      "oth1",
      1,
      0,
      "cash",
      "cancelled",
      createLocalIso(year, month, 22),
    ),
    makeInvoice(
      8,
      "INV202603008",
      memberThree.id,
      memberThree.name,
      memberThree.phone ?? "",
      "pt",
      "pt5",
      1,
      0,
      "card",
      "paid",
      createLocalIso(prevMonth.getFullYear(), prevMonth.getMonth(), 21),
    ),
    makeInvoice(
      9,
      "INV202604009",
      0,
      "Công ty Thiết Bị Gym Việt",
      "028 3822 6688",
      "equipment_purchase",
      treadmillItem.id,
      1,
      0,
      "transfer",
      "paid",
      createLocalIso(year, month, 8),
    ),
    makeInvoice(
      10,
      "INV202604010",
      0,
      "Thanh lý Phòng Gym Sao Mai",
      "0909 118 899",
      "equipment_sale",
      bikeItem.id,
      1,
      5,
      "cash",
      "pending",
      createLocalIso(year, month, 24),
    ),
  ];
};

const loadStoredInvoices = (members: Member[], equipment: Equipment[]) => {
  const storedInvoices = parseStoredJson<Invoice[]>(INVOICES_STORAGE_KEY);
  if (Array.isArray(storedInvoices) && storedInvoices.length > 0) {
    return storedInvoices;
  }

  const fallbackInvoices = createSeedInvoices(members, equipment);
  localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(fallbackInvoices));
  return fallbackInvoices;
};

const Invoices: React.FC = () => {
  const [members] = useState<Member[]>(() => loadStoredMembers());
  const [equipment, setEquipment] = useState<Equipment[]>(() =>
    loadStoredEquipment(),
  );
  const [invoices, setInvoices] = useState<Invoice[]>(() =>
    loadStoredInvoices(loadStoredMembers(), loadStoredEquipment()),
  );
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">(
    "all",
  );
  const [typeFilter, setTypeFilter] = useState<InvoiceType | "all">("all");
  const [monthFilter, setMonthFilter] = useState(() =>
    getMonthKey(new Date().toISOString()),
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState<InvoiceForm>(DEFAULT_FORM);
  const [toast, setToast] = useState<ToastState | null>(null);

  const toastTimeoutRef = useRef<number | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [memberInvoices, setMemberInvoices] = useState<any[]>([]);

  /* Load member invoices awaiting approval */
  const loadMemberInvoices = () => {
    try {
      const raw = localStorage.getItem("gymMemberInvoices");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setMemberInvoices(
            parsed.filter((inv: any) => inv.status === "awaiting_approval"),
          );
        }
      }
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    loadMemberInvoices();
  }, []);

  useEffect(() => {
    const handleSync = () => loadMemberInvoices();
    window.addEventListener("focus", handleSync);
    window.addEventListener("storage", handleSync);
    window.addEventListener("gymDataUpdated", handleSync);
    return () => {
      window.removeEventListener("focus", handleSync);
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("gymDataUpdated", handleSync);
    };
  }, []);

  const handleApproveMemberInvoice = (invoiceId: number) => {
    try {
      const raw = localStorage.getItem("gymMemberInvoices");
      if (!raw) return;
      const allInvoices = JSON.parse(raw);
      const updated = allInvoices.map((inv: any) =>
        inv.id === invoiceId
          ? {
              ...inv,
              status: "paid",
              notes: "Đã được admin xác nhận thanh toán",
            }
          : inv,
      );
      localStorage.setItem("gymMemberInvoices", JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent("gymDataUpdated", { detail: { type: "invoice" } }),
      );
      loadMemberInvoices();
      showToast("Đã xác nhận thanh toán thành công!", "success");
    } catch {
      /* ignore */
    }
  };

  const handleRejectMemberInvoice = (invoiceId: number) => {
    try {
      const raw = localStorage.getItem("gymMemberInvoices");
      if (!raw) return;
      const allInvoices = JSON.parse(raw);
      const updated = allInvoices.map((inv: any) =>
        inv.id === invoiceId
          ? {
              ...inv,
              status: "pending",
              paymentMethod: undefined,
              paidDate: undefined,
              notes: "Admin từ chối - Vui lòng thanh toán lại",
            }
          : inv,
      );
      localStorage.setItem("gymMemberInvoices", JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent("gymDataUpdated", { detail: { type: "invoice" } }),
      );
      loadMemberInvoices();
      showToast("Đã từ chối thanh toán!", "error");
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices));
  }, [invoices]);

  // Load invoices from API on mount
  useEffect(() => {
    const loadFromAPI = async () => {
      try {
        const res = await fetch("http://localhost:7000/admin/HoaDon");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped: Invoice[] = data.map((inv: any) => ({
              id: inv.id || Date.now(),
              invoiceId: inv.invoiceId || `INV${Date.now()}`,
              customerId: inv.customerId || 0,
              customerName: inv.customerName || "Khách hàng",
              customerPhone: inv.customerPhone || "",
              type: (inv.type || "membership") as InvoiceType,
              itemId: "",
              itemName: inv.description || "",
              description: inv.description || "",
              quantity: 1,
              unitPrice: Number(inv.total) || 0,
              subtotal: Number(inv.total) || 0,
              discount: Number(inv.discount) || 0,
              total: Number(inv.total) || 0,
              paymentMethod: "transfer" as PaymentMethod,
              status: (inv.status === "paid"
                ? "paid"
                : inv.status === "cancelled"
                  ? "cancelled"
                  : "pending") as InvoiceStatus,
              note: "",
              createdAt: inv.createdAt || new Date().toISOString(),
              paidAt: inv.status === "paid" ? inv.createdAt : undefined,
            }));
            setInvoices(mapped);
            localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(mapped));
          }
        }
      } catch {
        /* Backend unavailable - using localStorage */
      }
    };
    loadFromAPI();
  }, []);

  useEffect(() => {
    const syncEquipment = () => {
      setEquipment(loadStoredEquipment());
    };

    const syncInvoices = () => {
      const stored = parseStoredJson<Invoice[]>(INVOICES_STORAGE_KEY);
      if (Array.isArray(stored) && stored.length > 0) {
        setInvoices(stored);
      }
    };

    window.addEventListener("focus", () => {
      syncEquipment();
      syncInvoices();
      loadMemberInvoices();
    });
    window.addEventListener("storage", () => {
      syncEquipment();
      syncInvoices();
      loadMemberInvoices();
    });
    window.addEventListener("gymDataUpdated", () => {
      syncInvoices();
      loadMemberInvoices();
    });

    return () => {
      window.removeEventListener("focus", syncEquipment);
      window.removeEventListener("storage", syncEquipment);
      window.removeEventListener("gymDataUpdated", syncInvoices);
    };
  }, []);

  useEffect(() => {
    if (!selectedInvoice) return;
    const latestInvoice = invoices.find(
      (invoice) => invoice.id === selectedInvoice.id,
    );
    if (!latestInvoice) {
      setSelectedInvoice(null);
      setShowViewModal(false);
      return;
    }
    if (latestInvoice !== selectedInvoice) {
      setSelectedInvoice(latestInvoice);
    }
  }, [invoices, selectedInvoice]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const showToast = (message: string, type: ToastType) => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setToast({ message, type });
    toastTimeoutRef.current = window.setTimeout(() => setToast(null), 3000);
  };

  const selectedItems = getInvoiceItems(formData.type, equipment);
  const isEquipmentInvoice = isEquipmentInvoiceType(formData.type);
  const selectedCustomer = isEquipmentInvoice
    ? null
    : (members.find((member) => member.id === Number(formData.customerId)) ??
      null);
  const selectedItem =
    selectedItems.find((item) => item.id === formData.itemId) ?? null;
  const subtotal = (selectedItem?.price ?? 0) * formData.quantity;
  const discountAmount = subtotal * (formData.discount / 100);
  const total = subtotal - discountAmount;

  const filteredInvoices = [...invoices]
    .filter((invoice) => {
      if (statusFilter !== "all" && invoice.status !== statusFilter)
        return false;
      if (typeFilter !== "all" && invoice.type !== typeFilter) return false;
      if (monthFilter && getMonthKey(invoice.createdAt) !== monthFilter)
        return false;
      return true;
    })
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime(),
    );

  const monthlyRevenue = invoices
    .filter(
      (invoice) =>
        invoice.status === "paid" &&
        getMonthKey(invoice.createdAt) ===
          getMonthKey(new Date().toISOString()),
    )
    .reduce((sum, invoice) => sum + getSignedInvoiceTotal(invoice), 0);

  const resetForm = () => setFormData(DEFAULT_FORM);

  const closeAddModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const handleCreateInvoice = (event: React.FormEvent) => {
    event.preventDefault();
    const customerId = Number(formData.customerId);
    const customer = members.find((member) => member.id === customerId);
    const partnerName = formData.partnerName.trim();

    if (
      !formData.type ||
      !selectedItem ||
      (!isEquipmentInvoice && !customer) ||
      (isEquipmentInvoice && !partnerName)
    ) {
      showToast("Vui lòng điền đầy đủ thông tin!", "error");
      return;
    }

    const now = new Date();
    const invoiceId = `INV${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}${Math.floor(
      Math.random() * 1000,
    )
      .toString()
      .padStart(3, "0")}`;

    const newInvoice: Invoice = {
      id: Date.now(),
      invoiceId,
      customerId: isEquipmentInvoice ? 0 : customerId,
      customerName: isEquipmentInvoice ? partnerName : customer!.name,
      customerPhone: isEquipmentInvoice ? "" : (customer?.phone ?? ""),
      type: formData.type,
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      description: buildInvoiceDescription(
        formData.type,
        selectedItem.name,
        formData.quantity,
      ),
      quantity: formData.quantity,
      unitPrice: selectedItem.price,
      subtotal,
      discount: formData.discount,
      total,
      paymentMethod: formData.paymentMethod,
      status: formData.status,
      note: formData.note.trim(),
      createdAt: now.toISOString(),
      paidAt: formData.status === "paid" ? now.toISOString() : undefined,
    };

    setInvoices((previous) => [newInvoice, ...previous]);
    closeAddModal();
    showToast("Đã tạo hóa đơn thành công!", "success");
  };

  const handleMarkAsPaid = (invoice: Invoice) => {
    if (!window.confirm("Xác nhận đã thanh toán hóa đơn này?")) return;

    setInvoices((previous) =>
      previous.map((current) =>
        current.id === invoice.id
          ? {
              ...current,
              status: "paid",
              paidAt: new Date().toISOString(),
            }
          : current,
      ),
    );

    showToast("Đã cập nhật trạng thái thanh toán!", "success");
  };

  const handleDeleteInvoice = (invoice: Invoice) => {
    if (!window.confirm("Bạn có chắc muốn xóa hóa đơn này?")) return;

    setInvoices((previous) =>
      previous.filter((current) => current.id !== invoice.id),
    );

    showToast("Đã xóa hóa đơn!", "success");
  };

  const handleExportInvoices = () => {
    showToast("Tính năng xuất Excel sẽ được bổ sung sau.", "error");
  };

  const handlePrintInvoice = () => {
    if (!previewRef.current) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showToast("Trình duyệt đang chặn cửa sổ in.", "error");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="vi">
        <head>
          <meta charset="UTF-8" />
          <title>In hóa đơn</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #1f2937; }
            .invoice-preview { padding: 0; }
            .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 2px solid #d7deea; }
            .invoice-brand { display: flex; align-items: center; gap: 12px; }
            .invoice-brand-icon { width: 48px; height: 48px; border-radius: 12px; background: #6366f1; color: white; display: flex; align-items: center; justify-content: center; }
            .invoice-meta { text-align: right; }
            .invoice-number { font-size: 20px; font-weight: 700; color: #4f46e5; }
            .invoice-parties { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
            .invoice-party h5 { margin: 0 0 8px; color: #6b7280; font-size: 12px; text-transform: uppercase; }
            .invoice-party p { margin: 0; line-height: 1.6; }
            .invoice-items table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .invoice-items th, .invoice-items td { padding: 12px 14px; border-bottom: 1px solid #dbe1ea; text-align: left; }
            .invoice-items th { background: #eef3fb; color: #64748b; font-size: 12px; text-transform: uppercase; }
            .text-right { text-align: right; }
            .invoice-summary { display: flex; justify-content: flex-end; }
            .invoice-summary-table { width: 320px; }
            .invoice-summary-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .invoice-summary-row.total { border-bottom: 0; font-size: 18px; font-weight: 700; color: #4f46e5; padding-top: 16px; }
            .invoice-note { margin-top: 16px; font-size: 14px; }
            .invoice-footer { margin-top: 28px; padding-top: 20px; border-top: 1px solid #dbe1ea; text-align: center; color: #6b7280; }
          </style>
        </head>
        <body>${previewRef.current.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    window.setTimeout(() => printWindow.print(), 120);
  };

  return (
    <div className="invoices-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1>
            <i className="fas fa-file-invoice-dollar"></i> Quản lý hóa đơn
          </h1>
          <p>Quản lý hóa đơn và thanh toán của hội viên</p>
        </div>
        <div className="page-header-right">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExportInvoices}
          >
            <i className="fas fa-download"></i>
            <span>Xuất Excel</span>
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
          >
            <i className="fas fa-plus"></i>
            <span>Tạo hóa đơn</span>
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <i className="fas fa-file-invoice-dollar"></i>
          </div>
          <div className="stat-info">
            <p>Tổng hóa đơn</p>
            <h3>{invoices.length}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <i className="fas fa-circle-check"></i>
          </div>
          <div className="stat-info">
            <p>Đã thanh toán</p>
            <h3>
              {invoices.filter((invoice) => invoice.status === "paid").length}
            </h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <i className="fas fa-hourglass-half"></i>
          </div>
          <div className="stat-info">
            <p>Chờ thanh toán</p>
            <h3>
              {
                invoices.filter((invoice) => invoice.status === "pending")
                  .length
              }
            </h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <i className="fas fa-wallet"></i>
          </div>
          <div className="stat-info">
            <p>Doanh thu tháng</p>
            <h3>{formatCurrencyShort(monthlyRevenue)}</h3>
          </div>
        </div>
      </div>

      {/* Member invoices awaiting approval */}
      {memberInvoices.length > 0 && (
        <div
          className="member-invoices-pending"
          style={{
            marginBottom: "1.5rem",
            padding: "1.25rem",
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: "12px",
          }}
        >
          <h3
            style={{
              margin: "0 0 1rem",
              fontSize: "1rem",
              fontWeight: 700,
              color: "#92400e",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <i className="fas fa-bell"></i> Hóa đơn hội viên chờ xác nhận (
            {memberInvoices.length})
          </h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {memberInvoices.map((inv: any) => (
              <div
                key={inv.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "1rem",
                  background: "white",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div>
                  <strong style={{ color: "#1f2937" }}>
                    {inv.invoiceNumber}
                  </strong>
                  <span
                    style={{
                      marginLeft: "0.75rem",
                      fontSize: "0.8125rem",
                      color: "#6b7280",
                    }}
                  >
                    {inv.memberName || "Hội viên"} — {inv.paymentMethod}
                  </span>
                  <div
                    style={{
                      fontSize: "0.8125rem",
                      color: "#6b7280",
                      marginTop: "0.25rem",
                    }}
                  >
                    {inv.items?.map((item: any) => item.description).join(", ")}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <strong style={{ color: "#6366f1", fontSize: "1.125rem" }}>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(inv.total)}
                  </strong>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem" }}
                    onClick={() => handleApproveMemberInvoice(inv.id)}
                  >
                    <i className="fas fa-check"></i> Xác nhận
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem" }}
                    onClick={() => handleRejectMemberInvoice(inv.id)}
                  >
                    <i className="fas fa-times"></i> Từ chối
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="filters-bar">
        <div className="filter-group">
          <select
            className="invoice-filter-select"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as InvoiceStatus | "all")
            }
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="paid">Đã thanh toán</option>
            <option value="pending">Chờ thanh toán</option>
            <option value="cancelled">Đã hủy</option>
          </select>
          <select
            className="invoice-filter-select"
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value as InvoiceType | "all")
            }
          >
            <option value="all">Tất cả loại</option>
            <option value="membership">Gói tập</option>
            <option value="pt">PT</option>
            <option value="product">Sản phẩm</option>
            <option value="equipment_purchase">Mua thiết bị</option>
            <option value="equipment_sale">Bán thiết bị</option>
            <option value="other">Khác</option>
          </select>
          <input
            className="invoice-filter-month"
            type="month"
            value={monthFilter}
            onChange={(event) => setMonthFilter(event.target.value)}
          />
        </div>
      </div>

      <div className="card invoices-card">
        <div className="card-body">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã HĐ</th>
                  <th>Khách hàng</th>
                  <th>Loại</th>
                  <th>Mô tả</th>
                  <th>Số tiền</th>
                  <th>Ngày tạo</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="empty-invoices">
                        <i className="fas fa-file-invoice"></i>
                        <h3>Chưa có hóa đơn phù hợp</h3>
                        <p>Đổi bộ lọc hoặc tạo hóa đơn mới để xem dữ liệu.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => {
                    const member = members.find(
                      (item) => item.id === invoice.customerId,
                    );
                    return (
                      <tr key={invoice.id}>
                        <td>
                          <span className="invoice-id">
                            {invoice.invoiceId}
                          </span>
                        </td>
                        <td>
                          <div className="customer-cell">
                            <img
                              src={getAvatarUrl(
                                invoice.customerName,
                                member?.gender,
                              )}
                              alt={invoice.customerName}
                            />
                            <div className="customer-info">
                              <span className="customer-name">
                                {invoice.customerName}
                              </span>
                              <span className="customer-phone">
                                {invoice.customerPhone || member?.phone || ""}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`type-badge ${invoice.type}`}>
                            {getTypeLabel(invoice.type)}
                          </span>
                        </td>
                        <td>{invoice.description}</td>
                        <td>
                          <span
                            className={`amount ${
                              isExpenseInvoice(invoice.type)
                                ? "expense"
                                : "income"
                            }`}
                          >
                            {formatSignedCurrency(invoice)}
                          </span>
                        </td>
                        <td>{formatDate(invoice.createdAt)}</td>
                        <td>
                          <span className={`invoice-status ${invoice.status}`}>
                            {getStatusLabel(invoice.status)}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              type="button"
                              className="action-btn edit"
                              title="Xem"
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setShowViewModal(true);
                              }}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            {invoice.status === "pending" && (
                              <button
                                type="button"
                                className="action-btn renew"
                                title="Thanh toán"
                                onClick={() => handleMarkAsPaid(invoice)}
                              >
                                <i className="fas fa-check"></i>
                              </button>
                            )}
                            <button
                              type="button"
                              className="action-btn delete"
                              title="Xóa"
                              onClick={() => handleDeleteInvoice(invoice)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="modal">
          <div className="modal-overlay" onClick={closeAddModal}></div>
          <div className="modal-content invoices-add-modal">
            <div className="modal-header">
              <h2>
                <i className="fas fa-plus-circle"></i> Tạo hóa đơn mới
              </h2>
              <button
                type="button"
                className="close-btn"
                onClick={closeAddModal}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form
              className="invoice-create-form"
              onSubmit={handleCreateInvoice}
            >
              <div className="modal-body">
                <div className="invoice-form-summary">
                  <div className="invoice-summary-chip">
                    <span className="invoice-summary-label">
                      {getCounterpartyLabel(formData.type)}
                    </span>
                    <strong>
                      {isEquipmentInvoice
                        ? formData.partnerName.trim() || "Chưa nhập đối tác"
                        : selectedCustomer
                          ? `${selectedCustomer.name} · ${selectedCustomer.cardId}`
                          : "Chưa chọn khách hàng"}
                    </strong>
                  </div>
                  <div className="invoice-summary-chip">
                    <span className="invoice-summary-label">
                      Mục thanh toán
                    </span>
                    <strong>
                      {selectedItem?.name ?? "Chưa chọn sản phẩm"}
                    </strong>
                  </div>
                  <div className="invoice-summary-chip total">
                    <span className="invoice-summary-label">Tổng tạm tính</span>
                    <strong>{formatCurrency(total)}</strong>
                  </div>
                </div>

                <p className="invoice-form-hint">
                  Mã hóa đơn sẽ được tạo tự động khi bạn lưu biểu mẫu.
                </p>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <i
                        className={`fas ${getCounterpartyIcon(formData.type)}`}
                      ></i>{" "}
                      {getCounterpartyLabel(formData.type)}
                    </label>
                    {isEquipmentInvoice ? (
                      <input
                        type="text"
                        value={formData.partnerName}
                        onChange={(event) =>
                          setFormData({
                            ...formData,
                            partnerName: event.target.value,
                          })
                        }
                        placeholder={getCounterpartyPlaceholder(formData.type)}
                        required
                      />
                    ) : (
                      <select
                        value={formData.customerId}
                        onChange={(event) =>
                          setFormData({
                            ...formData,
                            customerId: event.target.value,
                          })
                        }
                        required
                      >
                        <option value="">
                          {getCounterpartyPlaceholder(formData.type)}
                        </option>
                        {members.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name} - {member.cardId}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="form-group">
                    <label>
                      <i className="fas fa-tag"></i> Loại hóa đơn
                    </label>
                    <select
                      value={formData.type}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          type: event.target.value as InvoiceType | "",
                          customerId: "",
                          partnerName: "",
                          itemId: "",
                        })
                      }
                      required
                    >
                      <option value="">Chọn loại</option>
                      <option value="membership">Gói tập</option>
                      <option value="pt">PT</option>
                      <option value="product">Sản phẩm</option>
                      <option value="equipment_purchase">Mua thiết bị</option>
                      <option value="equipment_sale">Bán thiết bị</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <i className="fas fa-box"></i>{" "}
                      {getItemFieldLabel(formData.type)}
                    </label>
                    <select
                      value={formData.itemId}
                      onChange={(event) =>
                        setFormData({ ...formData, itemId: event.target.value })
                      }
                      required
                    >
                      <option value="">
                        {isEquipmentInvoice ? "Chọn thiết bị" : "Chọn sản phẩm"}
                      </option>
                      {selectedItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} - {formatCurrency(item.price)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>
                      <i className="fas fa-sort-numeric-up"></i> Số lượng
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          quantity: Math.max(
                            1,
                            Number(event.target.value) || 1,
                          ),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <i className="fas fa-money-bill"></i> Đơn giá
                    </label>
                    <input
                      type="text"
                      value={formatCurrency(selectedItem?.price ?? 0)}
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <i className="fas fa-calculator"></i> Thành tiền
                    </label>
                    <input
                      type="text"
                      value={formatCurrency(subtotal)}
                      readOnly
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <i className="fas fa-percent"></i> Giảm giá (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          discount: Math.min(
                            100,
                            Math.max(0, Number(event.target.value) || 0),
                          ),
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <i className="fas fa-money-check"></i> Tổng thanh toán
                    </label>
                    <input
                      type="text"
                      value={formatCurrency(total)}
                      readOnly
                      className="total-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <i className="fas fa-credit-card"></i> Phương thức
                    </label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          paymentMethod: event.target.value as PaymentMethod,
                        })
                      }
                    >
                      <option value="cash">Tiền mặt</option>
                      <option value="transfer">Chuyển khoản</option>
                      <option value="card">Thẻ</option>
                    </select>
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
                          status: event.target.value as InvoiceStatus,
                        })
                      }
                    >
                      <option value="paid">Đã thanh toán</option>
                      <option value="pending">Chờ thanh toán</option>
                      <option value="cancelled">Đã hủy</option>
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
                    placeholder="Ghi chú thêm..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary invoice-cancel-btn"
                  onClick={closeAddModal}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary invoice-save-btn"
                >
                  <i className="fas fa-save"></i> Lưu hóa đơn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedInvoice && (
        <div className="modal">
          <div
            className="modal-overlay"
            onClick={() => setShowViewModal(false)}
          ></div>
          <div className="modal-content invoices-view-modal">
            <div className="modal-header">
              <h2>
                <i className="fas fa-file-invoice"></i> Chi tiết hóa đơn
              </h2>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowViewModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="invoice-preview" ref={previewRef}>
                <div className="invoice-header">
                  <div className="invoice-brand">
                    <div className="invoice-brand-icon">
                      <i className="fas fa-dumbbell"></i>
                    </div>
                    <div>
                      <h3>FitZone Gym</h3>
                      <p>Gym Management System</p>
                    </div>
                  </div>
                  <div className="invoice-meta">
                    <h4>HÓA ĐƠN</h4>
                    <div className="invoice-number">
                      {selectedInvoice.invoiceId}
                    </div>
                    <div className="invoice-date">
                      Ngày: {formatDate(selectedInvoice.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="invoice-parties">
                  <div className="invoice-party">
                    <h5>Từ</h5>
                    <p>
                      <strong>FitZone Gym</strong>
                      123 Đường ABC, Quận XYZ
                      <br />
                      TP. Hồ Chí Minh
                      <br />
                      Tel: 0123 456 789
                    </p>
                  </div>
                  <div className="invoice-party">
                    <h5>{getCounterpartyLabel(selectedInvoice.type)}</h5>
                    <p>
                      <strong>{selectedInvoice.customerName}</strong>
                      {selectedInvoice.customerPhone
                        ? `Tel: ${selectedInvoice.customerPhone}`
                        : ""}
                    </p>
                  </div>
                </div>

                <div className="invoice-items">
                  <table>
                    <thead>
                      <tr>
                        <th>Mô tả</th>
                        <th className="text-right">Số lượng</th>
                        <th className="text-right">Đơn giá</th>
                        <th className="text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{selectedInvoice.itemName}</td>
                        <td className="text-right">
                          {selectedInvoice.quantity}
                        </td>
                        <td className="text-right">
                          {formatCurrency(selectedInvoice.unitPrice)}
                        </td>
                        <td className="text-right">
                          {formatCurrency(selectedInvoice.subtotal)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="invoice-summary">
                  <div className="invoice-summary-table">
                    <div className="invoice-summary-row">
                      <span>Tạm tính</span>
                      <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                    </div>
                    <div className="invoice-summary-row">
                      <span>Giảm giá ({selectedInvoice.discount}%)</span>
                      <span>
                        -{" "}
                        {formatCurrency(
                          (selectedInvoice.subtotal *
                            selectedInvoice.discount) /
                            100,
                        )}
                      </span>
                    </div>
                    <div className="invoice-summary-row total">
                      <span>Tổng cộng</span>
                      <span>{formatCurrency(selectedInvoice.total)}</span>
                    </div>
                  </div>
                </div>

                {selectedInvoice.note && (
                  <div className="invoice-note">
                    <strong>Ghi chú:</strong> {selectedInvoice.note}
                  </div>
                )}

                <div className="invoice-footer">
                  <p>
                    Phương thức:{" "}
                    {getPaymentLabel(selectedInvoice.paymentMethod)} | Trạng
                    thái: {getStatusLabel(selectedInvoice.status)}
                  </p>
                  <p>
                    {selectedInvoice.paidAt
                      ? `Thanh toán lúc ${formatDateTime(selectedInvoice.paidAt)}`
                      : "Cảm ơn quý khách đã sử dụng dịch vụ của FitZone!"}
                  </p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowViewModal(false)}
              >
                Đóng
              </button>
              <button
                type="button"
                className="btn btn-info"
                onClick={handlePrintInvoice}
              >
                <i className="fas fa-print"></i> In hóa đơn
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast show ${toast.type}`}>
          <i
            className={`fas ${toast.type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}`}
          ></i>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default Invoices;
