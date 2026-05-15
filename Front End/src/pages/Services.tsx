import React from "react";
import UserHeader from "../components/layout/UserHeader";
import UserFooter from "../components/layout/UserFooter";
import Breadcrumb from "../components/layout/Breadcrumb";

const Services: React.FC = () => {
  const services = [
    {
      id: 1,
      icon: "fa-dumbbell",
      title: "Gói tập Gym",
      description: "Đa dạng gói tập phù hợp với mọi nhu cầu và ngân sách",
      features: [
        "Tập không giới hạn",
        "Thiết bị hiện đại",
        "Phòng tập rộng rãi",
        "Tư vấn chế độ tập",
      ],
      price: "Từ 500.000đ/tháng",
      color: "#00bcd4",
    },
    {
      id: 2,
      icon: "fa-user-tie",
      title: "Huấn luyện viên cá nhân",
      description: "PT 1-1 với huấn luyện viên chuyên nghiệp, giàu kinh nghiệm",
      features: [
        "Lộ trình cá nhân hóa",
        "Theo dõi sát sao",
        "Tư vấn dinh dưỡng",
        "Đạt mục tiêu nhanh chóng",
      ],
      price: "Từ 300.000đ/buổi",
      color: "#ff9800",
    },
    {
      id: 3,
      icon: "fa-users",
      title: "Lớp tập nhóm",
      description: "Các lớp học sôi động với nhiều môn thể thao đa dạng",
      features: [
        "Yoga, Zumba, Boxing",
        "Lịch học linh hoạt",
        "Không khí vui vẻ",
        "Giáo viên nhiệt tình",
      ],
      price: "Từ 150.000đ/buổi",
      color: "#e91e63",
    },
    {
      id: 4,
      icon: "fa-heartbeat",
      title: "Tư vấn dinh dưỡng",
      description: "Chế độ ăn khoa học giúp tối ưu hiệu quả tập luyện",
      features: [
        "Phân tích cơ thể",
        "Thực đơn cá nhân",
        "Theo dõi tiến độ",
        "Hỗ trợ 24/7",
      ],
      price: "Từ 500.000đ/tháng",
      color: "#4caf50",
    },
    {
      id: 5,
      icon: "fa-spa",
      title: "Massage & Thư giãn",
      description: "Dịch vụ massage phục hồi cơ bắp sau tập luyện",
      features: [
        "Massage thể thao",
        "Xông hơi",
        "Phòng thư giãn",
        "Chuyên gia giàu kinh nghiệm",
      ],
      price: "Từ 200.000đ/buổi",
      color: "#9c27b0",
    },
    {
      id: 6,
      icon: "fa-swimming-pool",
      title: "Bể bơi & Sauna",
      description: "Bể bơi tiêu chuẩn Olympic và phòng xông hơi cao cấp",
      features: [
        "Bể bơi 4 mùa",
        "Nước sạch, an toàn",
        "Phòng sauna hiện đại",
        "Khu vực riêng tư",
      ],
      price: "Miễn phí cho hội viên",
      color: "#00acc1",
    },
  ];

  return (
    <div className="services-page">
      <UserHeader />

      <Breadcrumb
        items={[{ label: "Trang chủ", path: "/" }, { label: "Dịch vụ" }]}
      />

      {/* Services Grid */}
      <section className="services-content">
        <div className="container">
          <div className="services-grid">
            {services.map((service) => (
              <div key={service.id} className="service-card">
                <div
                  className="service-icon"
                  style={{
                    background: `linear-gradient(135deg, ${service.color}, ${service.color}dd)`,
                  }}
                >
                  <i className={`fas ${service.icon}`}></i>
                </div>
                <h3>{service.title}</h3>
                <p className="service-description">{service.description}</p>
                <ul className="service-features">
                  {service.features.map((feature, index) => (
                    <li key={index}>
                      <i className="fas fa-check-circle"></i>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="service-price">{service.price}</div>
                <button className="btn-service">Đăng ký ngay</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="services-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Sẵn sàng bắt đầu hành trình của bạn?</h2>
            <p>
              Đăng ký ngay hôm nay để nhận ưu đãi đặc biệt dành cho thành viên
              mới
            </p>
            <button className="btn-cta">Tham gia ngay</button>
          </div>
        </div>
      </section>

      <UserFooter />
    </div>
  );
};

export default Services;
