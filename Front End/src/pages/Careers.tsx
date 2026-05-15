import React, { useState } from "react";
import UserHeader from "../components/layout/UserHeader";
import UserFooter from "../components/layout/UserFooter";
import Breadcrumb from "../components/layout/Breadcrumb";

const Careers: React.FC = () => {
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const jobs = [
    {
      id: 1,
      title: "Huấn luyện viên cá nhân (PT)",
      department: "training",
      location: "TP. Hồ Chí Minh",
      type: "Full-time",
      salary: "15-30 triệu",
      requirements: [
        "Có chứng chỉ PT quốc tế (ACE, NASM, ISSA...)",
        "Kinh nghiệm tối thiểu 1 năm",
        "Kỹ năng giao tiếp tốt",
        "Đam mê thể thao và sức khỏe",
      ],
      benefits: [
        "Lương cơ bản + hoa hồng hấp dẫn",
        "Bảo hiểm đầy đủ",
        "Đào tạo chuyên môn định kỳ",
        "Môi trường làm việc chuyên nghiệp",
      ],
    },
    {
      id: 2,
      title: "Nhân viên lễ tân",
      department: "admin",
      location: "Đà Nẵng",
      type: "Full-time",
      salary: "8-12 triệu",
      requirements: [
        "Ngoại hình ưa nhìn, giao tiếp tốt",
        "Sử dụng thành thạo tin học văn phòng",
        "Có kinh nghiệm ưu tiên",
        "Làm việc theo ca",
      ],
      benefits: [
        "Lương cạnh tranh + thưởng",
        "Tập gym miễn phí",
        "Bảo hiểm xã hội",
        "Môi trường trẻ trung, năng động",
      ],
    },
    {
      id: 3,
      title: "Giáo viên Yoga",
      department: "training",
      location: "Cần Thơ",
      type: "Part-time",
      salary: "200-400k/buổi",
      requirements: [
        "Có chứng chỉ giảng dạy Yoga",
        "Kinh nghiệm giảng dạy tối thiểu 6 tháng",
        "Nhiệt tình, yêu nghề",
        "Có thể dạy nhiều phong cách Yoga",
      ],
      benefits: [
        "Lương theo buổi dạy",
        "Lịch dạy linh hoạt",
        "Tập luyện miễn phí",
        "Hỗ trợ phát triển sự nghiệp",
      ],
    },
    {
      id: 4,
      title: "Quản lý chi nhánh",
      department: "management",
      location: "TP. Hồ Chí Minh",
      type: "Full-time",
      salary: "20-35 triệu",
      requirements: [
        "Kinh nghiệm quản lý gym/fitness tối thiểu 2 năm",
        "Kỹ năng lãnh đạo và quản lý nhân sự",
        "Hiểu biết về kinh doanh fitness",
        "Có laptop cá nhân",
      ],
      benefits: [
        "Lương cao + thưởng KPI",
        "Thưởng theo doanh thu chi nhánh",
        "Bảo hiểm cao cấp",
        "Cơ hội thăng tiến",
      ],
    },
    {
      id: 5,
      title: "Nhân viên Marketing",
      department: "marketing",
      location: "TP. Hồ Chí Minh",
      type: "Full-time",
      salary: "10-18 triệu",
      requirements: [
        "Kinh nghiệm marketing online 1-2 năm",
        "Thành thạo Facebook Ads, Google Ads",
        "Kỹ năng viết content, thiết kế cơ bản",
        "Sáng tạo, chủ động trong công việc",
      ],
      benefits: [
        "Lương cạnh tranh + thưởng",
        "Môi trường sáng tạo",
        "Học hỏi và phát triển",
        "Team building định kỳ",
      ],
    },
    {
      id: 6,
      title: "Nhân viên vệ sinh",
      department: "operations",
      location: "Đồng Nai",
      type: "Full-time",
      salary: "6-8 triệu",
      requirements: [
        "Chăm chỉ, cẩn thận",
        "Sức khỏe tốt",
        "Có thể làm việc theo ca",
        "Không yêu cầu kinh nghiệm",
      ],
      benefits: [
        "Lương ổn định",
        "Bảo hiểm đầy đủ",
        "Môi trường làm việc tốt",
        "Tăng lương định kỳ",
      ],
    },
  ];

  const departments = [
    { value: "all", label: "Tất cả vị trí" },
    { value: "training", label: "Huấn luyện" },
    { value: "admin", label: "Hành chính" },
    { value: "management", label: "Quản lý" },
    { value: "marketing", label: "Marketing" },
    { value: "operations", label: "Vận hành" },
  ];

  const filteredJobs =
    selectedDepartment === "all"
      ? jobs
      : jobs.filter((job) => job.department === selectedDepartment);

  return (
    <div className="careers-page">
      <UserHeader />

      <Breadcrumb
        items={[{ label: "Trang chủ", path: "/" }, { label: "Tuyển dụng" }]}
      />

      {/* Filter Section */}
      <section className="careers-filter">
        <div className="container">
          <div className="filter-buttons">
            {departments.map((dept) => (
              <button
                key={dept.value}
                className={`filter-btn ${selectedDepartment === dept.value ? "active" : ""}`}
                onClick={() => setSelectedDepartment(dept.value)}
              >
                {dept.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Jobs List */}
      <section className="careers-content">
        <div className="container">
          <div className="jobs-grid">
            {filteredJobs.map((job) => (
              <div key={job.id} className="job-card">
                <div className="job-header">
                  <h3>{job.title}</h3>
                  <span className="job-type">{job.type}</span>
                </div>
                <div className="job-meta">
                  <div className="job-meta-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{job.location}</span>
                  </div>
                  <div className="job-meta-item">
                    <i className="fas fa-money-bill-wave"></i>
                    <span>{job.salary}</span>
                  </div>
                </div>
                <div className="job-section">
                  <h4>Yêu cầu:</h4>
                  <ul>
                    {job.requirements.map((req, index) => (
                      <li key={index}>
                        <i className="fas fa-check-circle"></i>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="job-section">
                  <h4>Quyền lợi:</h4>
                  <ul>
                    {job.benefits.map((benefit, index) => (
                      <li key={index}>
                        <i className="fas fa-gift"></i>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button className="btn-apply">Ứng tuyển ngay</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="why-join-section">
        <div className="container">
          <h2>Tại sao nên làm việc tại FitZone?</h2>
          <div className="why-join-grid">
            <div className="why-join-item">
              <div className="why-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3>Đội ngũ chuyên nghiệp</h3>
              <p>Làm việc cùng những người đam mê và tài năng</p>
            </div>
            <div className="why-join-item">
              <div className="why-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3>Phát triển sự nghiệp</h3>
              <p>Cơ hội thăng tiến và đào tạo liên tục</p>
            </div>
            <div className="why-join-item">
              <div className="why-icon">
                <i className="fas fa-heart"></i>
              </div>
              <h3>Môi trường tích cực</h3>
              <p>Văn hóa làm việc năng động, thân thiện</p>
            </div>
            <div className="why-join-item">
              <div className="why-icon">
                <i className="fas fa-trophy"></i>
              </div>
              <h3>Thu nhập hấp dẫn</h3>
              <p>Lương thưởng cạnh tranh và nhiều phúc lợi</p>
            </div>
          </div>
        </div>
      </section>

      <UserFooter />
    </div>
  );
};

export default Careers;
