import { useState, useEffect } from "react";
import TrainerSidebar from "../components/layout/TrainerSidebar";
import TrainerHeader from "../components/layout/TrainerHeader";
import "../styles.css";
import "./trainerIncome.css";

interface IncomeRecord {
  id: number;
  month: string;
  year: number;
  baseSalary: number;
  ptCommission: number;
  classBonus: number;
  total: number;
  status: string;
}

export default function TrainerIncome() {
  const [selectedMonth, setSelectedMonth] = useState(5);
  const [selectedYear, setSelectedYear] = useState(2026);

  useEffect(() => {
    const loadFromAPI = async () => {
      try {
        const res = await fetch("http://localhost:7000/trainer/Schedule");
        if (res.ok) {
          console.log("TrainerIncome: API connected");
        }
      } catch {
        /* Backend unavailable */
      }
    };
    loadFromAPI();
  }, []);

  const [incomeRecords] = useState<IncomeRecord[]>([
    {
      id: 1,
      month: "Tháng 5",
      year: 2026,
      baseSalary: 15000000,
      ptCommission: 8000000,
      classBonus: 2000000,
      total: 25000000,
      status: "paid",
    },
    {
      id: 2,
      month: "Tháng 4",
      year: 2026,
      baseSalary: 15000000,
      ptCommission: 7500000,
      classBonus: 1800000,
      total: 24300000,
      status: "paid",
    },
    {
      id: 3,
      month: "Tháng 3",
      year: 2026,
      baseSalary: 15000000,
      ptCommission: 9000000,
      classBonus: 2200000,
      total: 26200000,
      status: "paid",
    },
    {
      id: 4,
      month: "Tháng 2",
      year: 2026,
      baseSalary: 15000000,
      ptCommission: 6500000,
      classBonus: 1500000,
      total: 23000000,
      status: "paid",
    },
    {
      id: 5,
      month: "Tháng 1",
      year: 2026,
      baseSalary: 15000000,
      ptCommission: 7000000,
      classBonus: 1800000,
      total: 23800000,
      status: "paid",
    },
  ]);

  const currentMonthIncome = incomeRecords[0];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      paid: { class: "paid", text: "Đã thanh toán" },
      pending: { class: "pending", text: "Chờ thanh toán" },
      processing: { class: "processing", text: "Đang xử lý" },
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const totalYearIncome = incomeRecords.reduce(
    (sum, record) => sum + record.total,
    0,
  );
  const avgMonthIncome = totalYearIncome / incomeRecords.length;

  return (
    <div className="admin-layout">
      <TrainerSidebar />
      <div className="main-content">
        <TrainerHeader />
        <main className="content">
          <div className="trainer-income-page">
            {/* Page Header */}
            <div className="page-header">
              <div>
                <h1>Thu nhập của tôi</h1>
                <p>Theo dõi và quản lý thu nhập hàng tháng</p>
              </div>
              <div className="month-selector">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                  <option value={1}>Tháng 1</option>
                  <option value={2}>Tháng 2</option>
                  <option value={3}>Tháng 3</option>
                  <option value={4}>Tháng 4</option>
                  <option value={5}>Tháng 5</option>
                  <option value={6}>Tháng 6</option>
                  <option value={7}>Tháng 7</option>
                  <option value={8}>Tháng 8</option>
                  <option value={9}>Tháng 9</option>
                  <option value={10}>Tháng 10</option>
                  <option value={11}>Tháng 11</option>
                  <option value={12}>Tháng 12</option>
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                </select>
              </div>
            </div>

            {/* Current Month Summary */}
            <div className="income-summary-card">
              <div className="summary-header">
                <h2>
                  Thu nhập tháng {selectedMonth}/{selectedYear}
                </h2>
                <span
                  className={`status-badge ${getStatusBadge(currentMonthIncome.status).class}`}
                >
                  {getStatusBadge(currentMonthIncome.status).text}
                </span>
              </div>

              <div className="summary-total">
                <div className="total-amount">
                  {formatCurrency(currentMonthIncome.total)}
                </div>
                <p className="total-label">Tổng thu nhập</p>
              </div>

              <div className="summary-breakdown">
                <div className="breakdown-item">
                  <div className="breakdown-icon blue">
                    <i className="fas fa-wallet"></i>
                  </div>
                  <div className="breakdown-info">
                    <p className="breakdown-label">Lương cơ bản</p>
                    <p className="breakdown-amount">
                      {formatCurrency(currentMonthIncome.baseSalary)}
                    </p>
                  </div>
                </div>

                <div className="breakdown-item">
                  <div className="breakdown-icon green">
                    <i className="fas fa-dumbbell"></i>
                  </div>
                  <div className="breakdown-info">
                    <p className="breakdown-label">Hoa hồng PT</p>
                    <p className="breakdown-amount">
                      {formatCurrency(currentMonthIncome.ptCommission)}
                    </p>
                  </div>
                </div>

                <div className="breakdown-item">
                  <div className="breakdown-icon orange">
                    <i className="fas fa-gift"></i>
                  </div>
                  <div className="breakdown-info">
                    <p className="breakdown-label">Thưởng lớp học</p>
                    <p className="breakdown-amount">
                      {formatCurrency(currentMonthIncome.classBonus)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="income-stats">
              <div className="stat-card">
                <div className="stat-icon blue">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="stat-info">
                  <h3>{formatCurrency(totalYearIncome)}</h3>
                  <p>Tổng thu nhập năm</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon green">
                  <i className="fas fa-calculator"></i>
                </div>
                <div className="stat-info">
                  <h3>{formatCurrency(avgMonthIncome)}</h3>
                  <p>Trung bình/tháng</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon orange">
                  <i className="fas fa-trophy"></i>
                </div>
                <div className="stat-info">
                  <h3>{formatCurrency(26200000)}</h3>
                  <p>Tháng cao nhất</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon purple">
                  <i className="fas fa-percentage"></i>
                </div>
                <div className="stat-info">
                  <h3>20%</h3>
                  <p>Tỷ lệ hoa hồng PT</p>
                </div>
              </div>
            </div>

            {/* Income History */}
            <div className="card">
              <div className="card-header">
                <h2>
                  <i className="fas fa-history"></i> Lịch sử thu nhập
                </h2>
                <button className="btn-export">
                  <i className="fas fa-download"></i>
                  Xuất báo cáo
                </button>
              </div>
              <div className="card-body">
                <div className="income-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Tháng</th>
                        <th>Lương cơ bản</th>
                        <th>Hoa hồng PT</th>
                        <th>Thưởng</th>
                        <th>Tổng</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incomeRecords.map((record) => {
                        const statusBadge = getStatusBadge(record.status);
                        return (
                          <tr key={record.id}>
                            <td className="month-cell">
                              <strong>
                                {record.month} {record.year}
                              </strong>
                            </td>
                            <td>{formatCurrency(record.baseSalary)}</td>
                            <td className="commission-cell">
                              {formatCurrency(record.ptCommission)}
                            </td>
                            <td>{formatCurrency(record.classBonus)}</td>
                            <td className="total-cell">
                              <strong>{formatCurrency(record.total)}</strong>
                            </td>
                            <td>
                              <span
                                className={`status-badge ${statusBadge.class}`}
                              >
                                {statusBadge.text}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Income Chart */}
            <div className="card">
              <div className="card-header">
                <h2>
                  <i className="fas fa-chart-bar"></i> Biểu đồ thu nhập
                </h2>
              </div>
              <div className="card-body">
                <div className="income-chart">
                  {incomeRecords.reverse().map((record, index) => {
                    const maxIncome = Math.max(
                      ...incomeRecords.map((r) => r.total),
                    );
                    const height = (record.total / maxIncome) * 100;
                    return (
                      <div key={index} className="chart-bar-group">
                        <div className="chart-bar-container">
                          <div
                            className="chart-bar"
                            style={{ height: `${height}%` }}
                          >
                            <span className="bar-value">
                              {(record.total / 1000000).toFixed(1)}M
                            </span>
                          </div>
                        </div>
                        <span className="chart-label">{record.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
