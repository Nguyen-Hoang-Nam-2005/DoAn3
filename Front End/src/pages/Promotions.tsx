import React from "react";
import UserHeader from "../components/layout/UserHeader";
import UserFooter from "../components/layout/UserFooter";
import Breadcrumb from "../components/layout/Breadcrumb";

const Promotions: React.FC = () => {
  const promotions = [
    {
      id: 1,
      title: "Ưu đãi thành viên mới",
      discount: "Giảm 30%",
      description:
        "Giảm 30% cho gói tập 3 tháng đầu tiên dành cho thành viên mới đăng ký",
      validUntil: "31/12/2024",
      terms: [
        "Áp dụng cho khách hàng đăng ký lần đầu",
        "Không áp dụng đồng thời với chương trình khác",
        "Thanh toán một lần toàn bộ gói tập",
      ],
      badge: "HOT",
      color: "#ff6b6b",
    },
    {
      id: 2,
      title: "Giới thiệu bạn bè",
      discount: "Tặng 2 tuần",
      description:
        "Giới thiệu bạn bè đăng ký gói tập, cả hai nhận 2 tuần tập miễn phí",
      validUntil: "Không giới hạn",
      terms: [
        "Bạn bè phải đăng ký gói tập tối thiểu 3 tháng",
        "Không giới hạn số lượng bạn bè giới thiệu",
        "2 tuần miễn phí được cộng vào thời gian gói tập",
      ],
      badge: "MỚI",
      color: "#4ecdc4",
    },
    {
      id: 3,
      title: "Gói tập sinh viên",
      discount: "Giảm 20%",
      description:
        "Ưu đãi đặc biệt dành cho sinh viên với giảm giá 20% mọi gói tập",
      validUntil: "31/08/2025",
      terms: [
        "Xuất trình thẻ sinh viên còn hiệu lực",
        "Áp dụng cho tất cả các gói tập",
        "Gia hạn được hưởng ưu đãi nếu còn là sinh viên",
      ],
      badge: "SV",
      color: "#95e1d3",
    },
    {
      id: 4,
      title: "Combo gia đình",
      discount: "Giảm 25%",
      description:
        "Đăng ký từ 3 thành viên trong gia đình, giảm 25% tổng hóa đơn",
      validUntil: "31/12/2024",
      terms: [
        "Tối thiểu 3 người trong cùng gia đình",
        "Đăng ký cùng lúc và cùng thời hạn",
        "Xuất trình giấy tờ chứng minh quan hệ gia đình",
      ],
      badge: "GIA ĐÌNH",
      color: "#f38181",
    },
    {
      id: 5,
      title: "Khuyến mãi Black Friday",
      discount: "Giảm 50%",
      description: "Siêu ưu đãi Black Friday - Giảm 50% gói tập 6 tháng",
      validUntil: "30/11/2024",
      terms: [
        "Chỉ áp dụng trong ngày Black Friday",
        "Số lượng có giới hạn - 100 suất đầu tiên",
        "Thanh toán trước toàn bộ 6 tháng",
      ],
      badge: "SỐC",
      color: "#000000",
    },
    {
      id: 6,
      title: "Tập sớm - Giá tốt",
      discount: "Giảm 15%",
      description:
        "Đăng ký gói tập buổi sáng (5h-10h), giảm 15% so với giá thường",
      validUntil: "Không giới hạn",
      terms: [
        "Chỉ được tập trong khung giờ 5h-10h sáng",
        "Áp dụng cho tất cả các ngày trong tuần",
        "Không được chuyển đổi sang khung giờ khác",
      ],
      badge: "SÁNG",
      color: "#feca57",
    },
  ];

  return (
    <div className="promotions-page">
      <UserHeader />

      <Breadcrumb
        items={[{ label: "Trang chủ", path: "/" }, { label: "Khuyến mãi" }]}
      />

      {/* Promotions Grid */}
      <section className="promotions-content">
        <div className="container">
          <div className="promotions-intro">
            <h1>Chương trình khuyến mãi</h1>
            <p>
              Đừng bỏ lỡ các ưu đãi hấp dẫn từ FitZone. Đăng ký ngay để nhận
              được mức giá tốt nhất!
            </p>
          </div>

          <div className="promotions-grid">
            {promotions.map((promo) => (
              <div key={promo.id} className="promotion-card">
                <div
                  className="promotion-badge"
                  style={{ background: promo.color }}
                >
                  {promo.badge}
                </div>
                <div className="promotion-header">
                  <h3>{promo.title}</h3>
                  <div
                    className="promotion-discount"
                    style={{ color: promo.color }}
                  >
                    {promo.discount}
                  </div>
                </div>
                <p className="promotion-description">{promo.description}</p>
                <div className="promotion-valid">
                  <i className="fas fa-clock"></i>
                  <span>Có hiệu lực đến: {promo.validUntil}</span>
                </div>
                <div className="promotion-terms">
                  <h4>Điều kiện áp dụng:</h4>
                  <ul>
                    {promo.terms.map((term, index) => (
                      <li key={index}>
                        <i className="fas fa-check"></i>
                        <span>{term}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button className="btn-promotion">Đăng ký ngay</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <h2>Đăng ký nhận thông tin khuyến mãi</h2>
            <p>Nhận thông báo về các chương trình ưu đãi mới nhất qua email</p>
            <div className="newsletter-form">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="newsletter-input"
              />
              <button className="btn-newsletter">Đăng ký</button>
            </div>
          </div>
        </div>
      </section>

      <UserFooter />
    </div>
  );
};

export default Promotions;
