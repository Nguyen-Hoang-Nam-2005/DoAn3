import { useEffect, useState } from "react";
import "./reports.css";

type ReportPeriod = "week" | "month" | "quarter" | "year";
type MemberStatus = "active" | "expiring" | "expired";
type TrendDirection = "up" | "down" | "neutral";
type ToastType = "success" | "error";
type InvoiceType =
  | "membership"
  | "pt"
  | "product"
  | "other"
  | "equipment_purchase"
  | "equipment_sale";
type InvoiceStatus = "paid" | "pending" | "cancelled";

interface ReportMember {
  id: number;
  name: string;
  cardId: string;
  packageId: number;
  packageName: string;
  startDate: string;
  endDate: string;
  createdAt?: string;
}

interface ReportPackage {
  id: number;
  name: string;
  duration: number;
  price: number;
  color: string;
  status: "active" | "inactive";
}

interface CheckInRecord {
  id: number;
  memberId: number;
  memberName: string;
  cardId: string;
  date: string;
  checkInTime: string;
  checkOutTime: string | null;
}

interface InvoiceRecord {
  id: number;
  invoiceId: string;
  customerName: string;
  itemName: string;
  description: string;
  total: number;
  createdAt: string;
  type: InvoiceType;
  status: InvoiceStatus;
}

interface TrendMetric {
  direction: TrendDirection;
  value: number;
}

interface ToastState {
  message: string;
  type: ToastType;
}

const MEMBERS_STORAGE_KEY = "gymMembers";
const PACKAGES_STORAGE_KEY = "gymPackages";
const CHECKINS_STORAGE_KEY = "gymCheckins";
const INVOICES_STORAGE_KEY = "gymInvoices";
const DAY_IN_MS = 1000 * 60 * 60 * 24;

const SAMPLE_PACKAGES: ReportPackage[] = [
  {
    id: 1,
    name: "Gói Basic 1 tháng",
    duration: 30,
    price: 500000,
    color: "blue",
    status: "active",
  },
  {
    id: 2,
    name: "Gói Standard 3 tháng",
    duration: 90,
    price: 1200000,
    color: "green",
    status: "active",
  },
  {
    id: 3,
    name: "Gói Premium 6 tháng",
    duration: 180,
    price: 2000000,
    color: "purple",
    status: "active",
  },
  {
    id: 4,
    name: "Gói VIP 12 tháng",
    duration: 365,
    price: 3500000,
    color: "gold",
    status: "active",
  },
];

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const shiftDateKey = (days: number) => {
  const nextDate = new Date();
  nextDate.setHours(0, 0, 0, 0);
  nextDate.setDate(nextDate.getDate() + days);
  return formatDateKey(nextDate);
};

const createDateTime = (daysOffset: number, hour: number, minute: number) => {
  const nextDate = new Date();
  nextDate.setHours(0, 0, 0, 0);
  nextDate.setDate(nextDate.getDate() + daysOffset);
  nextDate.setHours(hour, minute, 0, 0);
  return nextDate.toISOString();
};

const parseDateValue = (value: string) => {
  if (!value) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day, 12, 0, 0, 0);
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const startOfDay = (date: Date) => {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
};

const endOfDay = (date: Date) => {
  const nextDate = new Date(date);
  nextDate.setHours(23, 59, 59, 999);
  return nextDate;
};

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const daysBetweenInclusive = (startDate: Date, endDate: Date) =>
  Math.max(
    1,
    Math.round(
      (startOfDay(endDate).getTime() - startOfDay(startDate).getTime()) /
        DAY_IN_MS,
    ) + 1,
  );

const formatCurrency = (amount: number) => `${amount.toLocaleString("vi-VN")}đ`;

const formatCurrencyShort = (amount: number) => {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)}B`;
  }

  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(amount >= 10_000_000 ? 0 : 1)}M`;
  }

  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(amount >= 100_000 ? 0 : 1)}K`;
  }

  return String(amount);
};

const formatSignedCurrency = (amount: number) =>
  `${amount < 0 ? "-" : ""}${formatCurrency(Math.abs(amount))}`;

const formatSignedCurrencyShort = (amount: number) =>
  `${amount < 0 ? "-" : ""}${formatCurrencyShort(Math.abs(amount))}`;

const formatDisplayDate = (value: string) => {
  const parsedDate = parseDateValue(value);
  return parsedDate ? parsedDate.toLocaleDateString("vi-VN") : value;
};

const getMemberStatus = (endDate: string): MemberStatus => {
  const parsedEndDate = parseDateValue(endDate);
  if (!parsedEndDate) {
    return "expired";
  }

  const today = startOfDay(new Date());
  const diffDays = Math.ceil(
    (startOfDay(parsedEndDate).getTime() - today.getTime()) / DAY_IN_MS,
  );

  if (diffDays < 0) {
    return "expired";
  }

  if (diffDays <= 7) {
    return "expiring";
  }

  return "active";
};

const getTrendMetric = (
  currentValue: number,
  previousValue: number,
): TrendMetric => {
  if (currentValue === 0 && previousValue === 0) {
    return { direction: "neutral", value: 0 };
  }

  const delta = currentValue - previousValue;

  if (delta === 0) {
    return { direction: "neutral", value: 0 };
  }

  if (previousValue === 0) {
    return {
      direction: delta > 0 ? "up" : "down",
      value: 100,
    };
  }

  const difference = (Math.abs(delta) / Math.abs(previousValue)) * 100;

  return {
    direction: delta > 0 ? "up" : "down",
    value: Math.round(Math.abs(difference)),
  };
};

const getReportWindow = (period: ReportPeriod) => {
  const now = new Date();
  const endDate = endOfDay(now);
  let startDate = startOfDay(now);

  switch (period) {
    case "week":
      startDate = startOfDay(addDays(now, -6));
      break;
    case "month":
      startDate = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
      break;
    case "quarter": {
      const quarterIndex = Math.floor(now.getMonth() / 3);
      startDate = startOfDay(new Date(now.getFullYear(), quarterIndex * 3, 1));
      break;
    }
    case "year":
      startDate = startOfDay(new Date(now.getFullYear(), 0, 1));
      break;
  }

  const dayCount = daysBetweenInclusive(startDate, endDate);
  const previousEndDate = endOfDay(addDays(startDate, -1));
  const previousStartDate = startOfDay(addDays(startDate, -dayCount));

  return { startDate, endDate, previousStartDate, previousEndDate };
};

const isDateInRange = (value: string, startDate: Date, endDate: Date) => {
  const parsedDate = parseDateValue(value);
  if (!parsedDate) {
    return false;
  }

  return parsedDate >= startDate && parsedDate <= endDate;
};

const normalizeMember = (
  source: Partial<ReportMember>,
  fallbackIndex: number,
): ReportMember => ({
  id: Number(source.id ?? fallbackIndex + 1),
  name: source.name?.trim() || `Hội viên ${fallbackIndex + 1}`,
  cardId: (source.cardId || `GYM${String(fallbackIndex + 1).padStart(3, "0")}`)
    .toUpperCase()
    .trim(),
  packageId: Number(source.packageId ?? 1),
  packageName: source.packageName?.trim() || "Gói Basic 1 tháng",
  startDate: source.startDate || shiftDateKey(-(fallbackIndex + 1) * 5),
  endDate: source.endDate || shiftDateKey(30),
  createdAt: source.createdAt,
});

const normalizePackage = (
  source: Partial<ReportPackage>,
  fallbackIndex: number,
): ReportPackage => ({
  id: Number(source.id ?? fallbackIndex + 1),
  name: source.name?.trim() || `Gói tập ${fallbackIndex + 1}`,
  duration: Number(source.duration ?? 30),
  price: Number(source.price ?? 0),
  color: typeof source.color === "string" ? source.color : "blue",
  status: source.status === "inactive" ? "inactive" : "active",
});

const normalizeCheckInRecord = (
  source: Partial<CheckInRecord>,
  fallbackIndex: number,
): CheckInRecord => ({
  id: Number(source.id ?? fallbackIndex + 1),
  memberId: Number(source.memberId ?? fallbackIndex + 1),
  memberName: source.memberName?.trim() || `Hội viên ${fallbackIndex + 1}`,
  cardId: (source.cardId || `GYM${String(fallbackIndex + 1).padStart(3, "0")}`)
    .toUpperCase()
    .trim(),
  date: source.date || shiftDateKey(0),
  checkInTime: source.checkInTime || createDateTime(0, 8, 0),
  checkOutTime: source.checkOutTime ?? null,
});

const normalizeInvoiceRecord = (
  source: Partial<InvoiceRecord>,
  fallbackIndex: number,
): InvoiceRecord => ({
  id: Number(source.id ?? fallbackIndex + 1),
  invoiceId:
    source.invoiceId?.trim() ||
    `INV${String(fallbackIndex + 1).padStart(6, "0")}`,
  customerName: source.customerName?.trim() || "Khách hàng",
  itemName: source.itemName?.trim() || "Giao dịch",
  description:
    source.description?.trim() ||
    source.itemName?.trim() ||
    "Giao dịch phát sinh",
  total: Math.abs(Number(source.total ?? 0)),
  createdAt: source.createdAt || new Date().toISOString(),
  type:
    source.type === "membership" ||
    source.type === "pt" ||
    source.type === "product" ||
    source.type === "other" ||
    source.type === "equipment_purchase" ||
    source.type === "equipment_sale"
      ? source.type
      : "other",
  status:
    source.status === "paid" ||
    source.status === "pending" ||
    source.status === "cancelled"
      ? source.status
      : "paid",
});

const createSampleMembers = (): ReportMember[] =>
  [
    {
      id: 1,
      name: "Nguyễn Văn An",
      cardId: "GYM001",
      packageId: 4,
      packageName: "Gói VIP 12 tháng",
      startDate: shiftDateKey(-140),
      endDate: shiftDateKey(225),
    },
    {
      id: 2,
      name: "Trần Thị Bình",
      cardId: "GYM002",
      packageId: 3,
      packageName: "Gói Premium 6 tháng",
      startDate: shiftDateKey(-74),
      endDate: shiftDateKey(100),
    },
    {
      id: 3,
      name: "Lê Minh Cường",
      cardId: "GYM003",
      packageId: 2,
      packageName: "Gói Standard 3 tháng",
      startDate: shiftDateKey(-25),
      endDate: shiftDateKey(65),
    },
    {
      id: 4,
      name: "Phạm Thu Hà",
      cardId: "GYM004",
      packageId: 1,
      packageName: "Gói Basic 1 tháng",
      startDate: shiftDateKey(-12),
      endDate: shiftDateKey(18),
    },
    {
      id: 5,
      name: "Đặng Quốc Huy",
      cardId: "GYM005",
      packageId: 1,
      packageName: "Gói Basic 1 tháng",
      startDate: shiftDateKey(-3),
      endDate: shiftDateKey(27),
    },
    {
      id: 6,
      name: "Vũ Thảo Ly",
      cardId: "GYM006",
      packageId: 2,
      packageName: "Gói Standard 3 tháng",
      startDate: shiftDateKey(-42),
      endDate: shiftDateKey(4),
    },
    {
      id: 7,
      name: "Bùi Hoàng Nam",
      cardId: "GYM007",
      packageId: 3,
      packageName: "Gói Premium 6 tháng",
      startDate: shiftDateKey(-88),
      endDate: shiftDateKey(-2),
    },
    {
      id: 8,
      name: "Tạ Mỹ Linh",
      cardId: "GYM008",
      packageId: 4,
      packageName: "Gói VIP 12 tháng",
      startDate: shiftDateKey(-210),
      endDate: shiftDateKey(110),
    },
    {
      id: 9,
      name: "Trương Quốc Bảo",
      cardId: "GYM009",
      packageId: 2,
      packageName: "Gói Standard 3 tháng",
      startDate: shiftDateKey(-7),
      endDate: shiftDateKey(83),
    },
    {
      id: 10,
      name: "Ngô Khánh Vy",
      cardId: "GYM010",
      packageId: 1,
      packageName: "Gói Basic 1 tháng",
      startDate: shiftDateKey(-34),
      endDate: shiftDateKey(-4),
    },
    {
      id: 11,
      name: "Lâm Đức Long",
      cardId: "GYM011",
      packageId: 3,
      packageName: "Gói Premium 6 tháng",
      startDate: shiftDateKey(-17),
      endDate: shiftDateKey(163),
    },
    {
      id: 12,
      name: "Cao Bảo Trâm",
      cardId: "GYM012",
      packageId: 4,
      packageName: "Gói VIP 12 tháng",
      startDate: shiftDateKey(-2),
      endDate: shiftDateKey(363),
    },
  ].map((member, index) => normalizeMember(member, index));

const createSampleCheckins = (): CheckInRecord[] =>
  [
    {
      id: 1,
      memberId: 1,
      memberName: "Nguyễn Văn An",
      cardId: "GYM001",
      date: shiftDateKey(-6),
      checkInTime: createDateTime(-6, 6, 20),
      checkOutTime: createDateTime(-6, 7, 45),
    },
    {
      id: 2,
      memberId: 2,
      memberName: "Trần Thị Bình",
      cardId: "GYM002",
      date: shiftDateKey(-6),
      checkInTime: createDateTime(-6, 18, 10),
      checkOutTime: createDateTime(-6, 19, 45),
    },
    {
      id: 3,
      memberId: 3,
      memberName: "Lê Minh Cường",
      cardId: "GYM003",
      date: shiftDateKey(-5),
      checkInTime: createDateTime(-5, 7, 5),
      checkOutTime: createDateTime(-5, 8, 15),
    },
    {
      id: 4,
      memberId: 4,
      memberName: "Phạm Thu Hà",
      cardId: "GYM004",
      date: shiftDateKey(-5),
      checkInTime: createDateTime(-5, 17, 40),
      checkOutTime: createDateTime(-5, 18, 55),
    },
    {
      id: 5,
      memberId: 5,
      memberName: "Đặng Quốc Huy",
      cardId: "GYM005",
      date: shiftDateKey(-4),
      checkInTime: createDateTime(-4, 19, 5),
      checkOutTime: createDateTime(-4, 20, 20),
    },
    {
      id: 6,
      memberId: 6,
      memberName: "Vũ Thảo Ly",
      cardId: "GYM006",
      date: shiftDateKey(-4),
      checkInTime: createDateTime(-4, 16, 15),
      checkOutTime: createDateTime(-4, 17, 30),
    },
    {
      id: 7,
      memberId: 7,
      memberName: "Bùi Hoàng Nam",
      cardId: "GYM007",
      date: shiftDateKey(-3),
      checkInTime: createDateTime(-3, 6, 45),
      checkOutTime: createDateTime(-3, 8, 5),
    },
    {
      id: 8,
      memberId: 8,
      memberName: "Tạ Mỹ Linh",
      cardId: "GYM008",
      date: shiftDateKey(-3),
      checkInTime: createDateTime(-3, 18, 30),
      checkOutTime: createDateTime(-3, 20, 0),
    },
    {
      id: 9,
      memberId: 9,
      memberName: "Trương Quốc Bảo",
      cardId: "GYM009",
      date: shiftDateKey(-2),
      checkInTime: createDateTime(-2, 8, 5),
      checkOutTime: createDateTime(-2, 9, 10),
    },
    {
      id: 10,
      memberId: 10,
      memberName: "Ngô Khánh Vy",
      cardId: "GYM010",
      date: shiftDateKey(-2),
      checkInTime: createDateTime(-2, 18, 5),
      checkOutTime: createDateTime(-2, 19, 25),
    },
    {
      id: 11,
      memberId: 11,
      memberName: "Lâm Đức Long",
      cardId: "GYM011",
      date: shiftDateKey(-1),
      checkInTime: createDateTime(-1, 17, 50),
      checkOutTime: createDateTime(-1, 19, 0),
    },
    {
      id: 12,
      memberId: 12,
      memberName: "Cao Bảo Trâm",
      cardId: "GYM012",
      date: shiftDateKey(-1),
      checkInTime: createDateTime(-1, 19, 20),
      checkOutTime: createDateTime(-1, 20, 40),
    },
    {
      id: 13,
      memberId: 2,
      memberName: "Trần Thị Bình",
      cardId: "GYM002",
      date: shiftDateKey(0),
      checkInTime: createDateTime(0, 6, 35),
      checkOutTime: createDateTime(0, 7, 50),
    },
    {
      id: 14,
      memberId: 3,
      memberName: "Lê Minh Cường",
      cardId: "GYM003",
      date: shiftDateKey(0),
      checkInTime: createDateTime(0, 18, 15),
      checkOutTime: null,
    },
    {
      id: 15,
      memberId: 5,
      memberName: "Đặng Quốc Huy",
      cardId: "GYM005",
      date: shiftDateKey(0),
      checkInTime: createDateTime(0, 19, 0),
      checkOutTime: null,
    },
  ].map((record, index) => normalizeCheckInRecord(record, index));

const loadStoredMembers = () => {
  if (typeof window === "undefined") {
    return createSampleMembers();
  }

  try {
    const rawMembers = window.localStorage.getItem(MEMBERS_STORAGE_KEY);
    if (rawMembers) {
      const parsedMembers = JSON.parse(rawMembers) as Array<
        Partial<ReportMember>
      >;
      if (Array.isArray(parsedMembers) && parsedMembers.length > 0) {
        return parsedMembers.map((member, index) =>
          normalizeMember(member, index),
        );
      }
    }
  } catch {
    // Fall back to sample data below.
  }

  return createSampleMembers();
};

const loadStoredPackages = () => {
  if (typeof window === "undefined") {
    return SAMPLE_PACKAGES;
  }

  try {
    const rawPackages = window.localStorage.getItem(PACKAGES_STORAGE_KEY);
    if (rawPackages) {
      const parsedPackages = JSON.parse(rawPackages) as Array<
        Partial<ReportPackage>
      >;
      if (Array.isArray(parsedPackages) && parsedPackages.length > 0) {
        return parsedPackages.map((pkg, index) => normalizePackage(pkg, index));
      }
    }
  } catch {
    // Fall back to sample data below.
  }

  return SAMPLE_PACKAGES;
};

const loadStoredCheckins = () => {
  if (typeof window === "undefined") {
    return createSampleCheckins();
  }

  try {
    const rawCheckins = window.localStorage.getItem(CHECKINS_STORAGE_KEY);
    if (rawCheckins) {
      const parsedCheckins = JSON.parse(rawCheckins) as Array<
        Partial<CheckInRecord>
      >;
      if (Array.isArray(parsedCheckins) && parsedCheckins.length > 0) {
        return parsedCheckins.map((record, index) =>
          normalizeCheckInRecord(record, index),
        );
      }
    }
  } catch {
    // Fall back to sample data below.
  }

  return createSampleCheckins();
};

const loadStoredInvoices = () => {
  if (typeof window === "undefined") {
    return [] as InvoiceRecord[];
  }

  try {
    const rawInvoices = window.localStorage.getItem(INVOICES_STORAGE_KEY);
    if (rawInvoices) {
      const parsedInvoices = JSON.parse(rawInvoices) as Array<
        Partial<InvoiceRecord>
      >;
      if (Array.isArray(parsedInvoices) && parsedInvoices.length > 0) {
        return parsedInvoices
          .map((invoice, index) => normalizeInvoiceRecord(invoice, index))
          .sort(
            (left, right) =>
              new Date(right.createdAt).getTime() -
              new Date(left.createdAt).getTime(),
          );
      }
    }
  } catch {
    // Fall back to empty data below.
  }

  return [] as InvoiceRecord[];
};

const isExpenseInvoice = (invoice: InvoiceRecord) =>
  invoice.type === "equipment_purchase";

const getSignedInvoiceTotal = (invoice: InvoiceRecord) =>
  isExpenseInvoice(invoice) ? -invoice.total : invoice.total;

const getInvoiceStatusLabel = (status: InvoiceStatus) =>
  ({
    paid: "Đã thanh toán",
    pending: "Chờ thanh toán",
    cancelled: "Đã hủy",
  })[status];

const getInvoiceTypeLabel = (type: InvoiceType) =>
  ({
    membership: "Gói tập",
    pt: "PT",
    product: "Sản phẩm",
    other: "Khác",
    equipment_purchase: "Mua thiết bị",
    equipment_sale: "Bán thiết bị",
  })[type];

const sumInvoiceTotals = (items: InvoiceRecord[]) =>
  items.reduce((total, invoice) => total + getSignedInvoiceTotal(invoice), 0);

const buildRevenueSeries = (
  period: ReportPeriod,
  invoices: InvoiceRecord[],
) => {
  const paidInvoices = invoices.filter((invoice) => invoice.status === "paid");

  if (period === "week") {
    return Array.from({ length: 7 }, (_, index) => {
      const currentDate = addDays(new Date(), index - 6);
      const dateKey = formatDateKey(currentDate);
      const value = paidInvoices
        .filter((invoice) => {
          const invoiceDate = parseDateValue(invoice.createdAt);
          return invoiceDate ? formatDateKey(invoiceDate) === dateKey : false;
        })
        .reduce((total, invoice) => total + getSignedInvoiceTotal(invoice), 0);

      return {
        label: currentDate.toLocaleDateString("vi-VN", { weekday: "short" }),
        value,
      };
    });
  }

  if (period === "month") {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const bucketCount = Math.ceil(daysInMonth / 7);

    return Array.from({ length: bucketCount }, (_, index) => {
      const startDay = index * 7 + 1;
      const endDay = Math.min(startDay + 6, daysInMonth);
      const bucketStart = startOfDay(new Date(year, month, startDay));
      const bucketEnd = endOfDay(new Date(year, month, endDay));
      const value = sumInvoiceTotals(
        paidInvoices.filter((invoice) =>
          isDateInRange(invoice.createdAt, bucketStart, bucketEnd),
        ),
      );

      return {
        label: `T${index + 1}`,
        value,
      };
    });
  }

  if (period === "quarter") {
    const today = new Date();
    const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;

    return Array.from({ length: 3 }, (_, index) => {
      const currentDate = new Date(
        today.getFullYear(),
        quarterStartMonth + index,
        1,
      );
      const bucketStart = startOfDay(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      );
      const bucketEnd = endOfDay(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0),
      );
      const value = sumInvoiceTotals(
        paidInvoices.filter((invoice) =>
          isDateInRange(invoice.createdAt, bucketStart, bucketEnd),
        ),
      );

      return {
        label: currentDate.toLocaleDateString("vi-VN", { month: "short" }),
        value,
      };
    });
  }

  return Array.from({ length: 12 }, (_, index) => {
    const currentDate = new Date(new Date().getFullYear(), index, 1);
    const bucketStart = startOfDay(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    );
    const bucketEnd = endOfDay(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0),
    );
    const value = sumInvoiceTotals(
      paidInvoices.filter((invoice) =>
        isDateInRange(invoice.createdAt, bucketStart, bucketEnd),
      ),
    );

    return {
      label: `T${index + 1}`,
      value,
    };
  });
};

const getDirectionIcon = (direction: TrendDirection) => {
  if (direction === "up") {
    return "fa-arrow-up";
  }

  if (direction === "down") {
    return "fa-arrow-down";
  }

  return "fa-minus";
};

export default function Reports() {
  const [period, setPeriod] = useState<ReportPeriod>("month");
  const [members, setMembers] = useState<ReportMember[]>([]);
  const [packages, setPackages] = useState<ReportPackage[]>([]);
  const [checkins, setCheckins] = useState<CheckInRecord[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    // Try loading report data from API
    const loadFromAPI = async () => {
      try {
        const [revenueRes, memberRes, attendanceRes] = await Promise.allSettled(
          [
            fetch("http://localhost:7000/admin/BaoCao/doanhthu"),
            fetch("http://localhost:7000/admin/BaoCao/thanhvien"),
            fetch("http://localhost:7000/admin/BaoCao/diemdanh"),
          ],
        );
        if (revenueRes.status === "fulfilled" && revenueRes.value.ok) {
          console.log(
            "Revenue report from API:",
            await revenueRes.value.json(),
          );
        }
        if (memberRes.status === "fulfilled" && memberRes.value.ok) {
          console.log("Member stats from API:", await memberRes.value.json());
        }
      } catch {
        /* Backend unavailable */
      }
    };
    loadFromAPI();

    const syncReportData = () => {
      setMembers(loadStoredMembers());
      setPackages(loadStoredPackages());
      setCheckins(loadStoredCheckins());
      setInvoices(loadStoredInvoices());
    };

    syncReportData();
    window.addEventListener("focus", syncReportData);
    window.addEventListener("storage", syncReportData);

    return () => {
      window.removeEventListener("focus", syncReportData);
      window.removeEventListener("storage", syncReportData);
    };
  }, []);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const reportWindow = getReportWindow(period);
  const currentInvoices = invoices.filter((invoice) =>
    isDateInRange(
      invoice.createdAt,
      reportWindow.startDate,
      reportWindow.endDate,
    ),
  );
  const previousInvoices = invoices.filter((invoice) =>
    isDateInRange(
      invoice.createdAt,
      reportWindow.previousStartDate,
      reportWindow.previousEndDate,
    ),
  );
  const currentRevenueInvoices = currentInvoices.filter(
    (invoice) => invoice.status === "paid",
  );
  const previousRevenueInvoices = previousInvoices.filter(
    (invoice) => invoice.status === "paid",
  );
  const currentRevenue = sumInvoiceTotals(currentRevenueInvoices);
  const previousRevenue = sumInvoiceTotals(previousRevenueInvoices);
  const currentNewMembers = members.filter((member) =>
    isDateInRange(
      member.startDate,
      reportWindow.startDate,
      reportWindow.endDate,
    ),
  ).length;
  const previousNewMembers = members.filter((member) =>
    isDateInRange(
      member.startDate,
      reportWindow.previousStartDate,
      reportWindow.previousEndDate,
    ),
  ).length;
  const currentCheckins = checkins.filter((record) =>
    isDateInRange(
      record.checkInTime,
      reportWindow.startDate,
      reportWindow.endDate,
    ),
  );
  const previousCheckins = checkins.filter((record) =>
    isDateInRange(
      record.checkInTime,
      reportWindow.previousStartDate,
      reportWindow.previousEndDate,
    ),
  );
  const currentInvoiceCount = currentInvoices.length;
  const previousInvoiceCount = previousInvoices.length;
  const revenueTrend = getTrendMetric(currentRevenue, previousRevenue);
  const newMemberTrend = getTrendMetric(currentNewMembers, previousNewMembers);
  const checkinTrend = getTrendMetric(
    currentCheckins.length,
    previousCheckins.length,
  );
  const invoiceTrend = getTrendMetric(
    currentInvoiceCount,
    previousInvoiceCount,
  );
  const revenueSeries = buildRevenueSeries(period, invoices);
  const maxRevenueMagnitude = Math.max(
    ...revenueSeries.map((item) => Math.abs(item.value)),
    1,
  );
  const hasNegativeRevenue = revenueSeries.some((item) => item.value < 0);
  const statusCounts = members.reduce(
    (counts, member) => {
      const status = getMemberStatus(member.endDate);
      counts[status] += 1;
      return counts;
    },
    { active: 0, expiring: 0, expired: 0 },
  );
  const totalMembers =
    statusCounts.active + statusCounts.expiring + statusCounts.expired;
  const activePercent =
    totalMembers > 0 ? (statusCounts.active / totalMembers) * 100 : 0;
  const expiringPercent =
    totalMembers > 0 ? (statusCounts.expiring / totalMembers) * 100 : 0;
  const expiredPercent =
    totalMembers > 0 ? (statusCounts.expired / totalMembers) * 100 : 0;

  const periodMembershipInvoices = currentInvoices.filter(
    (invoice) =>
      invoice.type === "membership" && invoice.status !== "cancelled",
  );
  const packageSalesMap = periodMembershipInvoices.reduce<
    Record<string, number>
  >((result, invoice) => {
    result[invoice.itemName] = (result[invoice.itemName] || 0) + 1;
    return result;
  }, {});

  const packageNames = new Set(
    packages
      .filter((pkg) => pkg.status === "active")
      .map((pkg) => pkg.name.trim())
      .filter(Boolean),
  );

  const fallbackPackageMap = members.reduce<Record<string, number>>(
    (result, member) => {
      if (
        !member.packageName ||
        member.packageName === "Chưa gán gói tập" ||
        (packageNames.size > 0 && !packageNames.has(member.packageName.trim()))
      ) {
        return result;
      }

      result[member.packageName] = (result[member.packageName] || 0) + 1;
      return result;
    },
    {},
  );

  const topPackagesSource =
    Object.keys(packageSalesMap).length > 0
      ? packageSalesMap
      : fallbackPackageMap;
  const isUsingPackageFallback = Object.keys(packageSalesMap).length === 0;

  const topPackages = Object.entries(topPackagesSource)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([name, count], index) => ({
      id: name,
      name,
      count,
      rank: index + 1,
    }));

  const recentTransactions = [...invoices]
    .filter((invoice) => invoice.status !== "cancelled")
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime(),
    )
    .slice(0, 5);
  const selectedRangeCheckins =
    currentCheckins.length > 0 ? currentCheckins : checkins.slice(0, 24);
  const peakHourBuckets = [
    { label: "06:00 - 08:00", start: 6, end: 8 },
    { label: "08:00 - 10:00", start: 8, end: 10 },
    { label: "10:00 - 12:00", start: 10, end: 12 },
    { label: "12:00 - 14:00", start: 12, end: 14 },
    { label: "14:00 - 16:00", start: 14, end: 16 },
    { label: "16:00 - 18:00", start: 16, end: 18 },
    { label: "18:00 - 20:00", start: 18, end: 20 },
    { label: "20:00 - 22:00", start: 20, end: 22 },
  ].map((bucket) => {
    const count = selectedRangeCheckins.filter((record) => {
      const parsedDate = parseDateValue(record.checkInTime);
      if (!parsedDate) {
        return false;
      }

      const hour = parsedDate.getHours();
      return hour >= bucket.start && hour < bucket.end;
    }).length;

    return {
      ...bucket,
      count,
    };
  });

  const maxPeakCount = Math.max(
    ...peakHourBuckets.map((item) => item.count),
    1,
  );
  const totalPeakCount = peakHourBuckets.reduce(
    (total, item) => total + item.count,
    0,
  );
  const summaryRenewalRate =
    totalMembers > 0
      ? Math.round(
          ((statusCounts.active + statusCounts.expiring) / totalMembers) * 100,
        )
      : 0;

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <div className="page-title">
          <h1>
            <i className="fas fa-chart-line"></i> Báo cáo & Thống kê
          </h1>
          <p>Tổng quan hoạt động kinh doanh của phòng tập theo giao diện cũ</p>
        </div>
        <div className="page-actions">
          <div className="reports-period-control">
            <select
              className="reports-period-select"
              value={period}
              onChange={(event) =>
                setPeriod(event.target.value as ReportPeriod)
              }
            >
              <option value="week">7 ngày qua</option>
              <option value="month">Tháng này</option>
              <option value="quarter">Quý này</option>
              <option value="year">Năm nay</option>
            </select>
            <i className="fas fa-chevron-down reports-period-caret"></i>
          </div>
          <button
            type="button"
            className="btn btn-secondary reports-export-btn"
            onClick={() =>
              showToast(
                "Tính năng xuất báo cáo đang được hoàn thiện.",
                "success",
              )
            }
          >
            <i className="fas fa-download"></i>
            <span>Xuất báo cáo</span>
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green">
            <i className="fas fa-money-bill-wave"></i>
          </div>
          <div className="stat-info">
            <p>Tổng doanh thu</p>
            <h3>{formatSignedCurrencyShort(currentRevenue)}</h3>
          </div>
          <div className={`stat-trend ${revenueTrend.direction}`}>
            <i
              className={`fas ${getDirectionIcon(revenueTrend.direction)}`}
            ></i>
            <span>{revenueTrend.value}%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <i className="fas fa-user-plus"></i>
          </div>
          <div className="stat-info">
            <p>Hội viên mới</p>
            <h3>{currentNewMembers}</h3>
          </div>
          <div className={`stat-trend ${newMemberTrend.direction}`}>
            <i
              className={`fas ${getDirectionIcon(newMemberTrend.direction)}`}
            ></i>
            <span>{newMemberTrend.value}%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <i className="fas fa-sign-in-alt"></i>
          </div>
          <div className="stat-info">
            <p>Lượt check-in</p>
            <h3>{currentCheckins.length}</h3>
          </div>
          <div className={`stat-trend ${checkinTrend.direction}`}>
            <i
              className={`fas ${getDirectionIcon(checkinTrend.direction)}`}
            ></i>
            <span>{checkinTrend.value}%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <i className="fas fa-file-invoice"></i>
          </div>
          <div className="stat-info">
            <p>Hóa đơn</p>
            <h3>{currentInvoiceCount}</h3>
          </div>
          <div className={`stat-trend ${invoiceTrend.direction}`}>
            <i
              className={`fas ${getDirectionIcon(invoiceTrend.direction)}`}
            ></i>
            <span>{invoiceTrend.value}%</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card chart-card">
          <div className="card-header">
            <h2>
              <i className="fas fa-chart-area"></i> Biểu đồ doanh thu
            </h2>
          </div>
          <div className="card-body">
            <div
              className={`chart-container${
                hasNegativeRevenue ? " has-negative-values" : ""
              }`}
            >
              <div
                className={`chart-bars${hasNegativeRevenue ? " has-negative" : ""}`}
              >
                {revenueSeries.map((item) => (
                  <div
                    key={item.label}
                    className={`chart-bar-column ${
                      item.value < 0
                        ? "negative"
                        : item.value > 0
                          ? "positive"
                          : "neutral"
                    }`}
                  >
                    <span className="chart-value">
                      {formatSignedCurrencyShort(item.value)}
                    </span>
                    <div className="chart-bar-track">
                      {hasNegativeRevenue ? (
                        <>
                          <div className="chart-bar-zone positive">
                            {item.value > 0 ? (
                              <div
                                className="chart-bar positive"
                                style={{
                                  height: `${Math.max(
                                    (Math.abs(item.value) /
                                      maxRevenueMagnitude) *
                                      100,
                                    8,
                                  )}%`,
                                }}
                              ></div>
                            ) : null}
                          </div>
                          <div className="chart-bar-zone negative">
                            {item.value < 0 ? (
                              <div
                                className="chart-bar negative"
                                style={{
                                  height: `${Math.max(
                                    (Math.abs(item.value) /
                                      maxRevenueMagnitude) *
                                      100,
                                    8,
                                  )}%`,
                                }}
                              ></div>
                            ) : null}
                          </div>
                        </>
                      ) : (
                        <div className="chart-bar-zone single">
                          <div
                            className={`chart-bar ${item.value === 0 ? "neutral" : "positive"}`}
                            style={{
                              height: `${
                                item.value === 0
                                  ? 8
                                  : Math.max(
                                      (Math.abs(item.value) /
                                        maxRevenueMagnitude) *
                                        100,
                                      8,
                                    )
                              }%`,
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="chart-labels">
                {revenueSeries.map((item) => (
                  <div key={item.label} className="chart-label">
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card chart-card">
          <div className="card-header">
            <h2>
              <i className="fas fa-chart-pie"></i> Phân bố hội viên
            </h2>
          </div>
          <div className="card-body">
            <div className="pie-chart-container">
              <div
                className="pie-chart"
                style={{
                  background:
                    totalMembers === 0
                      ? "var(--bg-tertiary)"
                      : `conic-gradient(
                          #10b981 0% ${activePercent}%,
                          #f59e0b ${activePercent}% ${activePercent + expiringPercent}%,
                          #ef4444 ${activePercent + expiringPercent}% ${activePercent + expiringPercent + expiredPercent}%
                        )`,
                }}
              >
                <div className="pie-chart-center">
                  <strong>{totalMembers}</strong>
                  <span>Hội viên</span>
                </div>
              </div>

              <div className="pie-legend">
                <div className="legend-item">
                  <span className="legend-color green"></span>
                  <span>Còn hạn</span>
                  <span className="legend-value">{statusCounts.active}</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color orange"></span>
                  <span>Sắp hết hạn</span>
                  <span className="legend-value">{statusCounts.expiring}</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color red"></span>
                  <span>Hết hạn</span>
                  <span className="legend-value">{statusCounts.expired}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="details-grid">
        <div className="card">
          <div className="card-header">
            <h2>
              <i className="fas fa-trophy"></i> Gói tập bán chạy
            </h2>
          </div>
          <div className="card-body">
            {topPackages.length === 0 ? (
              <div className="empty-state">Chưa có dữ liệu gói tập.</div>
            ) : (
              <div className="ranking-list">
                {topPackages.map((pkg) => (
                  <div key={pkg.id} className="ranking-item">
                    <div
                      className={`ranking-position ${
                        pkg.rank === 1
                          ? "gold"
                          : pkg.rank === 2
                            ? "silver"
                            : pkg.rank === 3
                              ? "bronze"
                              : "normal"
                      }`}
                    >
                      {pkg.rank}
                    </div>
                    <div className="ranking-info">
                      <h4>{pkg.name}</h4>
                      <p>
                        {pkg.count}{" "}
                        {isUsingPackageFallback
                          ? "hội viên đang dùng"
                          : "lượt đăng ký"}
                      </p>
                    </div>
                    <span className="ranking-value">{pkg.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>
              <i className="fas fa-exchange-alt"></i> Giao dịch gần đây
            </h2>
          </div>
          <div className="card-body">
            {recentTransactions.length === 0 ? (
              <div className="empty-state">Chưa có giao dịch gần đây.</div>
            ) : (
              <div className="transaction-list">
                {recentTransactions.map((invoice) => (
                  <div key={invoice.id} className="transaction-item">
                    <div
                      className={`transaction-icon ${
                        invoice.status === "pending"
                          ? "pending"
                          : getSignedInvoiceTotal(invoice) < 0
                            ? "expense"
                            : "income"
                      }`}
                    >
                      <i
                        className={`fas ${
                          invoice.status === "pending"
                            ? "fa-clock"
                            : getSignedInvoiceTotal(invoice) < 0
                              ? "fa-arrow-trend-down"
                              : "fa-arrow-trend-up"
                        }`}
                      ></i>
                    </div>
                    <div className="transaction-info">
                      <h4>{invoice.customerName}</h4>
                      <p>
                        {getInvoiceTypeLabel(invoice.type)} •{" "}
                        {getInvoiceStatusLabel(invoice.status)} •{" "}
                        {formatDisplayDate(invoice.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`transaction-amount ${
                        invoice.status === "pending"
                          ? "pending"
                          : getSignedInvoiceTotal(invoice) < 0
                            ? "expense"
                            : "income"
                      }`}
                    >
                      {formatSignedCurrency(getSignedInvoiceTotal(invoice))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>
              <i className="fas fa-clock"></i> Giờ cao điểm
            </h2>
          </div>
          <div className="card-body">
            <div className="peak-hours">
              {peakHourBuckets.map((bucket) => {
                const width = (bucket.count / maxPeakCount) * 100;
                const share =
                  totalPeakCount > 0
                    ? Math.round((bucket.count / totalPeakCount) * 100)
                    : 0;

                return (
                  <div key={bucket.label} className="peak-hour-item">
                    <span className="peak-hour-time">{bucket.label}</span>
                    <div className="peak-hour-bar">
                      <div
                        className="peak-hour-fill"
                        style={{ width: `${width}%` }}
                      ></div>
                    </div>
                    <span className="peak-hour-value">{share}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="summary-content">
            <h4>Tổng hội viên</h4>
            <p>{totalMembers} người</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <i className="fas fa-user-check"></i>
          </div>
          <div className="summary-content">
            <h4>Hội viên hoạt động</h4>
            <p>{statusCounts.active + statusCounts.expiring} người</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <i className="fas fa-user-clock"></i>
          </div>
          <div className="summary-content">
            <h4>Sắp hết hạn</h4>
            <p>{statusCounts.expiring} người</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <i className="fas fa-percentage"></i>
          </div>
          <div className="summary-content">
            <h4>Tỷ lệ gia hạn</h4>
            <p>{summaryRenewalRate}%</p>
          </div>
        </div>
      </div>

      {toast ? (
        <div className={`reports-toast ${toast.type}`}>
          <i
            className={`fas ${
              toast.type === "success"
                ? "fa-check-circle"
                : "fa-circle-exclamation"
            }`}
          ></i>
          <span>{toast.message}</span>
        </div>
      ) : null}
    </div>
  );
}
