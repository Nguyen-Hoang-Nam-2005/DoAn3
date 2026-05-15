import { useState, useEffect } from "react";
import MemberSidebar from "../components/layout/MemberSidebar";
import MemberHeader from "../components/layout/MemberHeader";
import "../styles.css";
import "./memberInvoices.css";

/* ─── Types ─────────────────────────────────────────── */
interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: "paid" | "pending" | "overdue" | "cancelled" | "awaiting_approval";
  paymentMethod?: string;
  paidDate?: string;
  notes?: string;
  memberId?: number;
  memberName?: string;
}

/* ─── localStorage keys ─────────────────────────────── */
const INVOICES_KEY = "gymMemberInvoices";
const MEMBERS_KEY = "gymMembers";

/* ─── Helpers ────────────────────────────────────────── */
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount,
  );

const formatDate = (dateStr: string) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN");
};

const getStatusInfo = (status: string) => {
  const map: Record<string, { cls: string; text: string; icon: string }> = {
    paid: { cls: "success", text: "Đã thanh toán", icon: "check-circle" },
    pending: { cls: "warning", text: "Chờ thanh toán", icon: "clock" },
    awaiting_approval: {
      cls: "info",
      text: "Chờ admin xác nhận",
      icon: "hourglass-half",
    },
    overdue: { cls: "danger", text: "Quá hạn", icon: "exclamation-triangle" },
    cancelled: { cls: "secondary", text: "Đã hủy", icon: "ban" },
  };
  return map[status] || map.pending;
};

/* ─── Generate invoices from subscriptions ───────────── */
const generateInvoicesFromData = (): Invoice[] => {
  const userId = localStorage.getItem("userId") || "1";
  const numericId = Number(userId);

  try {
    const raw = localStorage.getItem(MEMBERS_KEY);
    if (raw) {
      const members = JSON.parse(raw);
      const member = members.find((m: any) => m.id === numericId);
      if (member && member.subscriptions && member.subscriptions.length > 0) {
        return member.subscriptions.map((sub: any, idx: number) => {
          const startDate = new Date(sub.startDate);
          const isPast = new Date(sub.endDate) < new Date();
          return {
            id: idx + 1,
            invoiceNumber: `INV-${startDate.getFullYear()}-${String(idx + 1).padStart(3, "0")}`,
            date: sub.startDate,
            dueDate: sub.startDate,
            items: [
              {
                id: 1,
                description: sub.packageName,
                quantity: 1,
                unitPrice: sub.price,
                total: sub.price,
              },
            ],
            subtotal: sub.price,
            discount: 0,
            tax: 0,
            total: sub.price,
            status: "paid" as const,
            paymentMethod: "Chuyển khoản",
            paidDate: sub.startDate,
            notes: isPast ? "Gói đã hết hạn" : "Gói đang hoạt động",
          };
        });
      }
    }
  } catch {
    /* ignore */
  }

  return DEFAULT_INVOICES;
};

const DEFAULT_INVOICES: Invoice[] = [
  {
    id: 1,
    invoiceNumber: "INV-2026-001",
    date: "2026-01-01",
    dueDate: "2026-01-15",
    status: "paid",
    paymentMethod: "Chuyển khoản",
    paidDate: "2026-01-05",
    items: [
      {
        id: 1,
        description: "Gói tập 3 tháng",
        quantity: 1,
        unitPrice: 1500000,
        total: 1500000,
      },
      {
        id: 2,
        description: "Giảm giá thành viên cũ",
        quantity: 1,
        unitPrice: -300000,
        total: -300000,
      },
    ],
    subtotal: 1500000,
    discount: 300000,
    tax: 0,
    total: 1200000,
    notes: "Đã thanh toán đầy đủ",
  },
  {
    id: 2,
    invoiceNumber: "INV-2026-002",
    date: "2026-02-15",
    dueDate: "2026-03-01",
    status: "pending",
    items: [
      {
        id: 3,
        description: "Gói PT 10 buổi",
        quantity: 1,
        unitPrice: 2000000,
        total: 2000000,
      },
    ],
    subtotal: 2000000,
    discount: 0,
    tax: 0,
    total: 2000000,
    notes: "Chờ thanh toán",
  },
  {
    id: 3,
    invoiceNumber: "INV-2025-089",
    date: "2025-12-01",
    dueDate: "2025-12-15",
    status: "paid",
    paymentMethod: "Tiền mặt",
    paidDate: "2025-12-10",
    items: [
      {
        id: 4,
        description: "Gói tập 1 tháng",
        quantity: 1,
        unitPrice: 500000,
        total: 500000,
      },
    ],
    subtotal: 500000,
    discount: 0,
    tax: 0,
    total: 500000,
  },
  {
    id: 4,
    invoiceNumber: "INV-2025-078",
    date: "2025-11-20",
    dueDate: "2025-12-05",
    status: "overdue",
    items: [
      {
        id: 5,
        description: "Dịch vụ massage",
        quantity: 2,
        unitPrice: 300000,
        total: 600000,
      },
    ],
    subtotal: 600000,
    discount: 0,
    tax: 0,
    total: 600000,
    notes: "Quá hạn thanh toán",
  },
  {
    id: 5,
    invoiceNumber: "INV-2025-065",
    date: "2025-10-15",
    dueDate: "2025-10-30",
    status: "cancelled",
    items: [
      {
        id: 6,
        description: "Gói PT 20 buổi",
        quantity: 1,
        unitPrice: 3500000,
        total: 3500000,
      },
    ],
    subtotal: 3500000,
    discount: 0,
    tax: 0,
    total: 3500000,
    notes: "Đã hủy theo yêu cầu",
  },
];

/* ─── Component ──────────────────────────────────────── */
export default function MemberInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  /* Load invoices */
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
          const res = await fetch("http://localhost:7000/user/Invoices", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              const mapped: Invoice[] = data.map((inv: any, idx: number) => ({
                id: inv.maHoaDon || idx + 1,
                invoiceNumber: `INV-${new Date(inv.ngayLap).getFullYear()}-${String(inv.maHoaDon).padStart(3, "0")}`,
                date: new Date(inv.ngayLap).toISOString().split("T")[0],
                dueDate: new Date(inv.ngayLap).toISOString().split("T")[0],
                items: [
                  {
                    id: 1,
                    description: inv.ghiChu || "Dịch vụ gym",
                    quantity: 1,
                    unitPrice: Number(inv.soTienPhaiTra),
                    total: Number(inv.soTienPhaiTra),
                  },
                ],
                subtotal: Number(inv.tongTien),
                discount: Number(inv.giamGia),
                tax: 0,
                total: Number(inv.soTienPhaiTra),
                status:
                  inv.trangThai === 2
                    ? "paid"
                    : inv.trangThai === 3
                      ? "awaiting_approval"
                      : "pending",
                notes: inv.ghiChu,
              }));
              setInvoices(mapped);
              return;
            }
          }
        }
      } catch {
        /* Backend unavailable */
      }

      // Fallback to localStorage
      const stored = localStorage.getItem(INVOICES_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setInvoices(parsed);
            return;
          }
        } catch {
          /* ignore */
        }
      }
      const generated = generateInvoicesFromData();
      setInvoices(generated);
      localStorage.setItem(INVOICES_KEY, JSON.stringify(generated));
    };
    loadFromAPI();
  }, []);

  /* Listen for admin approval - refresh data */
  useEffect(() => {
    const handleUpdate = () => {
      const stored = localStorage.getItem(INVOICES_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setInvoices(parsed);
          }
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener("focus", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("gymDataUpdated", handleUpdate);
    return () => {
      window.removeEventListener("focus", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("gymDataUpdated", handleUpdate);
    };
  }, []);

  /* Auto-dismiss toast */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  /* ── Filters ── */
  const filteredInvoices = invoices.filter((inv) => {
    const matchStatus =
      selectedStatus === "all" || inv.status === selectedStatus;
    const matchSearch =
      !searchTerm ||
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.items.some((item) =>
        item.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    return matchStatus && matchSearch;
  });

  /* ── Stats ── */
  const totalAll = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPaid = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.total, 0);
  const totalPending = invoices
    .filter((inv) => inv.status === "pending" || inv.status === "overdue")
    .reduce((sum, inv) => sum + inv.total, 0);
  const countPending = invoices.filter(
    (inv) => inv.status === "pending" || inv.status === "overdue",
  ).length;

  const statusFilters = [
    { value: "all", label: "Tất cả", count: invoices.length },
    {
      value: "paid",
      label: "Đã thanh toán",
      count: invoices.filter((inv) => inv.status === "paid").length,
    },
    {
      value: "awaiting_approval",
      label: "Chờ xác nhận",
      count: invoices.filter((inv) => inv.status === "awaiting_approval")
        .length,
    },
    {
      value: "pending",
      label: "Chờ thanh toán",
      count: invoices.filter((inv) => inv.status === "pending").length,
    },
    {
      value: "overdue",
      label: "Quá hạn",
      count: invoices.filter((inv) => inv.status === "overdue").length,
    },
  ];

  /* ── Actions ── */
  const handlePayNow = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPayModal(true);
  };

  const handleConfirmPayment = () => {
    if (!selectedInvoice) return;
    const methods: Record<string, string> = {
      bank: "Chuyển khoản ngân hàng",
      momo: "Ví MoMo",
      zalopay: "ZaloPay",
      cash: "Tiền mặt",
    };
    const today = new Date().toISOString().split("T")[0];
    const memberName = localStorage.getItem("memberName") || "Hội viên";
    const userId = Number(localStorage.getItem("userId") || "1");
    const updated = invoices.map((inv) =>
      inv.id === selectedInvoice.id
        ? {
            ...inv,
            status: "awaiting_approval" as const,
            paymentMethod: methods[paymentMethod],
            paidDate: today,
            notes: "Đã thanh toán - Chờ admin xác nhận",
            memberId: userId,
            memberName: memberName,
          }
        : inv,
    );
    setInvoices(updated);
    localStorage.setItem(INVOICES_KEY, JSON.stringify(updated));
    // Dispatch event for admin to see
    window.dispatchEvent(
      new CustomEvent("gymDataUpdated", { detail: { type: "invoice" } }),
    );
    setShowPayModal(false);
    setSelectedInvoice(null);
    setToast({
      msg: `Đã gửi yêu cầu thanh toán ${selectedInvoice.invoiceNumber}. Chờ admin xác nhận!`,
      type: "success",
    });
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Trình duyệt chặn popup. Hãy cho phép và thử lại.");
      return;
    }
    const memberName = localStorage.getItem("memberName") || "Hội viên";
    const statusInfo = getStatusInfo(invoice.status);
    printWindow.document
      .write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Hóa đơn ${invoice.invoiceNumber}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;padding:40px;color:#1f2937}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid #e5e7eb}
.logo{font-size:24px;font-weight:800;color:#6366f1}.invoice-title{text-align:right}
.invoice-title h1{font-size:28px;color:#1f2937;margin-bottom:4px}.invoice-title p{color:#6b7280;font-size:14px}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:32px}
.info-box h3{font-size:12px;text-transform:uppercase;color:#6b7280;margin-bottom:8px;letter-spacing:0.5px}
.info-box p{font-size:14px;color:#374151;line-height:1.6}
table{width:100%;border-collapse:collapse;margin-bottom:24px}
th{background:#f8fafc;padding:12px;text-align:left;font-size:13px;color:#374151;border-bottom:2px solid #e5e7eb}
td{padding:12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#4b5563}
.total-section{text-align:right;margin-top:16px}
.total-row{display:flex;justify-content:flex-end;gap:40px;padding:6px 0;font-size:14px}
.total-row.grand{font-size:18px;font-weight:700;color:#6366f1;border-top:2px solid #e5e7eb;padding-top:12px;margin-top:8px}
.status{display:inline-block;padding:6px 14px;border-radius:20px;font-size:13px;font-weight:600}
.status-success{background:#d1fae5;color:#059669}.status-warning{background:#fef3c7;color:#d97706}
.status-danger{background:#fee2e2;color:#dc2626}.status-secondary{background:#f3f4f6;color:#6b7280}
.footer{margin-top:40px;padding-top:20px;border-top:1px solid #e5e7eb;text-align:center;color:#9ca3af;font-size:12px}
@media print{body{padding:20px}}</style></head><body>
<div class="header"><div class="logo">FitZone Gym</div><div class="invoice-title"><h1>HÓA ĐƠN</h1><p>${invoice.invoiceNumber}</p></div></div>
<div class="info-grid"><div class="info-box"><h3>Thông tin khách hàng</h3><p><strong>${memberName}</strong><br>Hội viên FitZone Gym</p></div>
<div class="info-box"><h3>Thông tin hóa đơn</h3><p>Ngày tạo: ${formatDate(invoice.date)}<br>Hạn thanh toán: ${formatDate(invoice.dueDate)}<br>
Trạng thái: <span class="status status-${statusInfo.cls}">${statusInfo.text}</span></p></div></div>
<table><thead><tr><th>Mô tả</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead><tbody>
${invoice.items.map((item) => `<tr><td>${item.description}</td><td>${item.quantity}</td><td>${formatCurrency(item.unitPrice)}</td><td>${formatCurrency(item.total)}</td></tr>`).join("")}
</tbody></table>
<div class="total-section"><div class="total-row"><span>Tạm tính:</span><span>${formatCurrency(invoice.subtotal)}</span></div>
${invoice.discount > 0 ? `<div class="total-row"><span>Giảm giá:</span><span>-${formatCurrency(invoice.discount)}</span></div>` : ""}
<div class="total-row grand"><span>Tổng cộng:</span><span>${formatCurrency(invoice.total)}</span></div></div>
${invoice.paymentMethod ? `<p style="margin-top:20px;font-size:13px;color:#6b7280">Phương thức: ${invoice.paymentMethod} | Ngày thanh toán: ${formatDate(invoice.paidDate || "")}</p>` : ""}
<div class="footer"><p>FitZone Gym - Hệ thống phòng tập hiện đại</p><p>Cảm ơn bạn đã sử dụng dịch vụ!</p></div>
<script>window.onload=function(){setTimeout(function(){window.print()},200)}</script></body></html>`);
    printWindow.document.close();
  };

  const handleExportReport = () => {
    const paidInvoices = invoices.filter((inv) => inv.status === "paid");
    const data = {
      totalInvoices: invoices.length,
      totalPaid: paidInvoices.length,
      totalAmount: totalAll,
      paidAmount: totalPaid,
      pendingAmount: totalPending,
      invoices: invoices.map((inv) => ({
        number: inv.invoiceNumber,
        date: inv.date,
        total: inv.total,
        status: inv.status,
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bao-cao-hoa-don-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToast({ msg: "Xuất báo cáo thành công!", type: "success" });
  };

  return (
    <div className="admin-layout">
      <MemberSidebar />
      <div className="main-content">
        <MemberHeader />
        <main className="content">
          <div className="invoices-page">
            {/* Toast */}
            {toast && (
              <div className={`inv-toast inv-toast--${toast.type}`}>
                <i
                  className={`fas fa-${toast.type === "success" ? "check-circle" : "exclamation-circle"}`}
                ></i>
                {toast.msg}
              </div>
            )}

            {/* Page Header */}
            <div className="page-header">
              <div className="page-title">
                <h1>
                  <i className="fas fa-file-invoice-dollar"></i> Hóa đơn
                </h1>
                <p>Quản lý và theo dõi các hóa đơn thanh toán</p>
              </div>
              <div className="page-actions">
                <button
                  className="btn btn-outline"
                  onClick={handleExportReport}
                >
                  <i className="fas fa-download"></i> Xuất báo cáo
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="inv-summary-grid">
              <div className="inv-summary-card">
                <div className="inv-summary-icon blue">
                  <i className="fas fa-file-invoice"></i>
                </div>
                <div className="inv-summary-info">
                  <span className="inv-summary-value">{invoices.length}</span>
                  <span className="inv-summary-label">Tổng hóa đơn</span>
                </div>
              </div>
              <div className="inv-summary-card">
                <div className="inv-summary-icon green">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="inv-summary-info">
                  <span className="inv-summary-value">
                    {formatCurrency(totalPaid)}
                  </span>
                  <span className="inv-summary-label">Đã thanh toán</span>
                </div>
              </div>
              <div className="inv-summary-card">
                <div className="inv-summary-icon orange">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="inv-summary-info">
                  <span className="inv-summary-value">
                    {formatCurrency(totalPending)}
                  </span>
                  <span className="inv-summary-label">Chờ thanh toán</span>
                </div>
              </div>
              <div className="inv-summary-card">
                <div className="inv-summary-icon purple">
                  <i className="fas fa-exclamation-circle"></i>
                </div>
                <div className="inv-summary-info">
                  <span className="inv-summary-value">{countPending}</span>
                  <span className="inv-summary-label">Cần thanh toán</span>
                </div>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="inv-toolbar">
              <div className="inv-search">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Tìm kiếm hóa đơn..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="inv-filters">
                {statusFilters.map((f) => (
                  <button
                    key={f.value}
                    className={`inv-filter-btn ${selectedStatus === f.value ? "active" : ""}`}
                    onClick={() => setSelectedStatus(f.value)}
                  >
                    {f.label}{" "}
                    <span className="inv-filter-count">{f.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Invoices List */}
            <div className="inv-list">
              {filteredInvoices.length === 0 ? (
                <div className="inv-empty">
                  <i className="fas fa-file-invoice"></i>
                  <h3>Không có hóa đơn</h3>
                  <p>Chưa có hóa đơn nào phù hợp với bộ lọc</p>
                </div>
              ) : (
                filteredInvoices.map((invoice) => {
                  const status = getStatusInfo(invoice.status);
                  return (
                    <div key={invoice.id} className="inv-card">
                      <div className="inv-card-header">
                        <div className="inv-card-left">
                          <div className="inv-card-icon">
                            <i className="fas fa-file-invoice"></i>
                          </div>
                          <div>
                            <strong className="inv-card-number">
                              {invoice.invoiceNumber}
                            </strong>
                            <span className="inv-card-date">
                              {formatDate(invoice.date)}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`inv-status inv-status--${status.cls}`}
                        >
                          <i className={`fas fa-${status.icon}`}></i>{" "}
                          {status.text}
                        </span>
                      </div>

                      <div className="inv-card-body">
                        <div className="inv-card-items">
                          {invoice.items.map((item) => (
                            <div key={item.id} className="inv-item-row">
                              <span>{item.description}</span>
                              <span
                                className={item.total < 0 ? "text-red" : ""}
                              >
                                {formatCurrency(item.total)}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="inv-card-total">
                          {invoice.discount > 0 && (
                            <div className="inv-total-row">
                              <span>Giảm giá:</span>
                              <span className="text-green">
                                -{formatCurrency(invoice.discount)}
                              </span>
                            </div>
                          )}
                          <div className="inv-total-row grand">
                            <span>Tổng cộng:</span>
                            <strong>{formatCurrency(invoice.total)}</strong>
                          </div>
                        </div>

                        {invoice.paymentMethod && (
                          <div className="inv-payment-info">
                            <i className="fas fa-credit-card"></i>
                            {invoice.paymentMethod} —{" "}
                            {formatDate(invoice.paidDate || "")}
                          </div>
                        )}
                      </div>

                      <div className="inv-card-actions">
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setShowDetailModal(true);
                          }}
                        >
                          <i className="fas fa-eye"></i> Chi tiết
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleDownloadPDF(invoice)}
                        >
                          <i className="fas fa-file-pdf"></i> Tải PDF
                        </button>
                        {(invoice.status === "pending" ||
                          invoice.status === "overdue") && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handlePayNow(invoice)}
                          >
                            <i className="fas fa-credit-card"></i> Thanh toán
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ── Detail Modal ── */}
      {showDetailModal && selectedInvoice && (
        <div className="modal">
          <div
            className="modal-overlay"
            onClick={() => setShowDetailModal(false)}
          ></div>
          <div className="modal-content inv-detail-modal">
            <div className="modal-header">
              <h2>
                <i className="fas fa-file-invoice"></i> Chi tiết hóa đơn
              </h2>
              <button
                className="close-btn"
                onClick={() => setShowDetailModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="inv-detail-top">
                <div>
                  <h3>{selectedInvoice.invoiceNumber}</h3>
                  <p>Ngày tạo: {formatDate(selectedInvoice.date)}</p>
                  <p>Hạn thanh toán: {formatDate(selectedInvoice.dueDate)}</p>
                </div>
                <span
                  className={`inv-status inv-status--${getStatusInfo(selectedInvoice.status).cls}`}
                >
                  <i
                    className={`fas fa-${getStatusInfo(selectedInvoice.status).icon}`}
                  ></i>{" "}
                  {getStatusInfo(selectedInvoice.status).text}
                </span>
              </div>

              <table className="inv-detail-table">
                <thead>
                  <tr>
                    <th>Mô tả</th>
                    <th>SL</th>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.description}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.unitPrice)}</td>
                      <td className={item.total < 0 ? "text-red" : ""}>
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="inv-detail-summary">
                <div className="inv-detail-row">
                  <span>Tạm tính:</span>
                  <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                </div>
                {selectedInvoice.discount > 0 && (
                  <div className="inv-detail-row">
                    <span>Giảm giá:</span>
                    <span className="text-green">
                      -{formatCurrency(selectedInvoice.discount)}
                    </span>
                  </div>
                )}
                {selectedInvoice.tax > 0 && (
                  <div className="inv-detail-row">
                    <span>Thuế:</span>
                    <span>{formatCurrency(selectedInvoice.tax)}</span>
                  </div>
                )}
                <div className="inv-detail-row grand">
                  <span>Tổng cộng:</span>
                  <strong>{formatCurrency(selectedInvoice.total)}</strong>
                </div>
              </div>

              {selectedInvoice.paymentMethod && (
                <div className="inv-detail-payment">
                  <i className="fas fa-credit-card"></i>
                  <div>
                    <strong>
                      Phương thức: {selectedInvoice.paymentMethod}
                    </strong>
                    <p>
                      Ngày thanh toán:{" "}
                      {formatDate(selectedInvoice.paidDate || "")}
                    </p>
                  </div>
                </div>
              )}

              {selectedInvoice.notes && (
                <div className="inv-detail-notes">
                  <i className="fas fa-sticky-note"></i> {selectedInvoice.notes}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-outline"
                onClick={() => handleDownloadPDF(selectedInvoice)}
              >
                <i className="fas fa-file-pdf"></i> Tải PDF
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowDetailModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Payment Modal ── */}
      {showPayModal && selectedInvoice && (
        <div className="modal">
          <div
            className="modal-overlay"
            onClick={() => setShowPayModal(false)}
          ></div>
          <div className="modal-content inv-pay-modal">
            <div className="modal-header">
              <h2>
                <i className="fas fa-credit-card"></i> Thanh toán hóa đơn
              </h2>
              <button
                className="close-btn"
                onClick={() => setShowPayModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="inv-pay-info">
                <div className="inv-pay-invoice">
                  <span>Hóa đơn:</span>
                  <strong>{selectedInvoice.invoiceNumber}</strong>
                </div>
                <div className="inv-pay-amount">
                  <span>Số tiền:</span>
                  <strong className="inv-pay-price">
                    {formatCurrency(selectedInvoice.total)}
                  </strong>
                </div>
              </div>

              <div className="inv-pay-methods">
                <h4>
                  <i className="fas fa-wallet"></i> Chọn phương thức thanh toán
                </h4>
                <div className="inv-method-list">
                  {[
                    {
                      id: "bank",
                      icon: "university",
                      label: "Chuyển khoản ngân hàng",
                      desc: "Vietcombank, Techcombank, MB...",
                    },
                    {
                      id: "momo",
                      icon: "mobile-alt",
                      label: "Ví MoMo",
                      desc: "Thanh toán qua ví điện tử MoMo",
                    },
                    {
                      id: "zalopay",
                      icon: "wallet",
                      label: "ZaloPay",
                      desc: "Thanh toán qua ZaloPay",
                    },
                    {
                      id: "cash",
                      icon: "money-bill-wave",
                      label: "Tiền mặt",
                      desc: "Thanh toán tại quầy lễ tân",
                    },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className={`inv-method-item ${paymentMethod === method.id ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="inv-method-icon">
                        <i className={`fas fa-${method.icon}`}></i>
                      </div>
                      <div className="inv-method-info">
                        <strong>{method.label}</strong>
                        <span>{method.desc}</span>
                      </div>
                      <div className="inv-method-check">
                        <i className="fas fa-check-circle"></i>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="inv-pay-notice">
                <i className="fas fa-shield-alt"></i>
                Thanh toán được bảo mật và xử lý an toàn. Hóa đơn sẽ được cập
                nhật ngay sau khi thanh toán thành công.
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowPayModal(false)}
              >
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmPayment}
              >
                <i className="fas fa-lock"></i> Xác nhận thanh toán{" "}
                {formatCurrency(selectedInvoice.total)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
