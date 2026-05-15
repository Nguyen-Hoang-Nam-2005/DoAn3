import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import UserHeader from "../components/layout/UserHeader";
import UserFooter from "../components/layout/UserFooter";

const UserHome: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCity, setSelectedCity] = useState("");

  const slides = [
    "https://thenewgym.vn/wp-content/uploads/2025/10/THEM-BAN-THEM-VUI.WEB_.2.1.jpg",
    "https://thenewgym.vn/wp-content/uploads/2025/11/banner-ads-TNG-24112025.png",
    "https://thenewgym.vn/wp-content/uploads/2025/11/ADS-21-TNG-1-1.jpg",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    // Load packages for pricing section from API
    const loadFromAPI = async () => {
      try {
        const res = await fetch("http://localhost:7000/admin/GoiTap/active");
        if (res.ok) {
          console.log("UserHome: Backend connected, packages loaded");
        }
      } catch {
        /* Backend unavailable */
      }
    };
    loadFromAPI();

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="user-home">
      <UserHeader />

      {/* Hero Slider */}
      <section className="hero-slider">
        <div className="slider-container">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`slide ${index === currentSlide ? "active" : ""}`}
            >
              <img src={slide} alt={`Banner ${index + 1}`} />
            </div>
          ))}
        </div>
        <button className="slider-prev" onClick={prevSlide}>
          ❮
        </button>
        <button className="slider-next" onClick={nextSlide}>
          ❯
        </button>
        <div className="slider-dots">
          {slides.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentSlide ? "active" : ""}`}
              onClick={() => setCurrentSlide(index)}
            ></span>
          ))}
        </div>
      </section>

      {/* Location Selector */}
      <section className="location-section">
        <div className="container">
          <h2>The New Gym hiện đang có 14+ chi nhánh trên toàn quốc</h2>
          <div className="location-selector">
            <select
              className="city-select"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="">Chọn thành phố</option>
              <option value="hcm">TP. Hồ Chí Minh</option>
              <option value="dn">Đà Nẵng</option>
              <option value="ct">Cần Thơ</option>
              <option value="dongnai">Đồng Nai</option>
            </select>
            <Link to="/login" className="btn-primary">
              Tham gia
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section" id="pricing">
        <div className="container">
          <h2>HỘI VIÊN THE NEW GYM</h2>
          <p className="section-subtitle">
            The New Gym cung cấp cho Hội Viên gói tập Tất Cả Chi Nhánh và 1 Chi
            Nhánh. Cả hai đều cho bạn tham gia tập luyện không giới hạn trong
            không gian <strong>Không phán xét</strong>, nơi mọi người cảm thấy
            luôn được chào đón và thuộc về từ khi bước vào.
          </p>

          <div className="pricing-cards">
            <div className="pricing-card featured">
              <div className="card-header">
                <div className="card-duration">1 THÁNG</div>
                <div className="card-tag">TẤT CẢ CHI NHÁNH</div>
              </div>
              <div className="price">
                399.000 ₫<span>/ Tháng</span>
              </div>
              <div className="price-divider"></div>
              <p>
                Tập luyện tại toàn hệ thống The New Gym trên toàn quốc, miễn phí
                kiểm tra sức khỏe và sai lệch tư thế, và nhiều hơn nữa!
              </p>
              <div className="card-buttons">
                <button className="btn-outline-light">Xem chi tiết</button>
                <Link to="/login" className="btn-primary-light">
                  Tham gia
                </Link>
              </div>
            </div>

            <div className="pricing-card">
              <div className="card-header">
                <div className="card-duration">1 THÁNG</div>
                <div className="card-tag">1 CHI NHÁNH</div>
              </div>
              <div className="price price-dark">
                299.000 ₫<span>/ Tháng</span>
              </div>
              <div className="price-divider price-divider-dark"></div>
              <p>
                Gói hội viên cơ bản của The New Gym, bạn được tập luyện không
                giới hạn tại câu lạc bộ đăng ký!
              </p>
              <div className="card-buttons">
                <button className="btn-outline-dark">Xem chi tiết</button>
                <Link to="/login" className="btn-primary-light">
                  Tham gia
                </Link>
              </div>
            </div>
          </div>

          <button className="btn-compare">SO SÁNH 2 GÓI</button>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="feature-block welcome-block">
            <div className="feature-content">
              <h3>CHÀO MỪNG BẠN ĐẾN VỚI THE NEW GYM</h3>
              <p>
                Chúng tôi tạo ra một môi trường nơi mà mọi người đều có thể cảm
                thấy thoải mái tập luyện một mình hoặc cùng bạn bè của mình, bất
                kể trình độ thể chất và hiểu biết về gym như thế nào mà không
                bao giờ lo lắng về việc bị đánh giá.
              </p>
              <a href="#" className="feature-link">
                <span className="arrow">→</span>
                <span>Tìm hiểu thêm</span>
              </a>
            </div>
            <div className="feature-image">
              <img
                src="https://thenewgym.vn/wp-content/uploads/2025/09/chao-mung-ban-den-the-new-gym-2-1.webp"
                alt="Chào mừng"
              />
            </div>
          </div>

          <div className="feature-block guide-block">
            <div className="feature-image">
              <img
                src="https://thenewgym.vn/wp-content/uploads/2025/09/huong-dan-tap-luyen-mien-phi-tai-the-new-gym-1.webp"
                alt="Hướng dẫn"
              />
            </div>
            <div className="feature-content">
              <h3>HƯỚNG DẪN TẬP LUYỆN MIỄN PHÍ</h3>
              <p>
                The New Gym khuyến khích bạn nên tải App The New Gym sau đó truy
                cập vào tab "Tập Luyện" ở đó có video hướng dẫn các bài cơ bản
                để giúp mọi người dễ dàng hơn cho hành trình tập luyện của bản
                thân.
              </p>
              <a href="#" className="feature-link">
                <span className="arrow">→</span>
                <span>Tìm hiểu thêm</span>
              </a>
            </div>
          </div>

          <div className="feature-block friend-block">
            <div className="feature-content">
              <h3>THÊM BẠN THÊM VUI</h3>
              <p>
                Bạn của bạn là bạn của The New Gym. Thêm một người bạn tập luyện
                sẽ tạo ra niềm vui và động lực không ngừng. Hội viên khi giới
                thiệu bạn mới đăng ký gói tập ở tất cả chi nhánh, cả hai bạn sẽ
                nhận được 2 tuần tập luyện miễn phí.
              </p>
              <a href="#" className="feature-link">
                <span className="arrow">→</span>
                <span>Giới thiệu bạn</span>
              </a>
            </div>
            <div className="feature-image">
              <img
                src="https://thenewgym.vn/wp-content/uploads/2025/09/gioi-thieu-ban-be-cung-tap-tai-the-new-gym-1.webp"
                alt="Giới thiệu bạn"
              />
            </div>
          </div>

          <div className="feature-block visit-block">
            <div className="feature-image">
              <img
                src="https://thenewgym.vn/wp-content/uploads/2025/09/Tham-quan-he-thong-phong-tap-tai-the-new-gym-1.webp"
                alt="Tham quan"
              />
            </div>
            <div className="feature-content">
              <h3>THAM QUAN PHÒNG TẬP MỞ CỬA 24/7</h3>
              <p>
                Dù bạn đang tìm kiếm điều gì ở một phòng gym, The New Gym đều có
                lựa chọn phù hợp dành cho bạn. Cùng The New Gym tham quan không
                gian thân thiện, chào đón phù hợp với tất cả mọi người.
              </p>
              <a href="#" className="feature-link">
                <span className="arrow">→</span>
                <span>Khám phá không gian</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="map-section" id="locations">
        <div className="container">
          <div className="map-content-wrapper">
            <div className="map-text-content">
              <h2>HỆ THỐNG PHÒNG TẬP</h2>
              <p>
                The New Gym tin rằng mọi người, ở mọi nơi, đều nên được tiếp cận
                với hoạt động thể chất và những lợi ích tuyệt vời về thể chất,
                tinh thần và cảm xúc mà nó mang lại.
              </p>
              <p>
                Hệ thống The New Gym hiện có hơn 15 phòng tập, tập trung ở các
                thành phố lớn: TP. HCM, Đồng Nai, Cần Thơ, Đà Nẵng. Hãy tìm câu
                lạc bộ gần bạn nhất để bắt đầu những trải nghiệm tuyệt vời tại
                The New Gym!
              </p>
              <a href="#locations" className="find-gym-link">
                <span className="arrow">→</span>
                <span>Tìm phòng tập</span>
              </a>
            </div>
            <div className="map-locations-card">
              <img
                src="https://thenewgym.vn/wp-content/uploads/2025/09/Dia-Chi-Moi-Fix-1-768x768.webp"
                alt="Hệ thống phòng tập The New Gym"
              />
            </div>
          </div>
        </div>
      </section>

      {/* App Section */}
      <section className="app-section">
        <div className="container">
          <div className="app-content">
            <div className="app-text">
              <h2>TẢI ỨNG DỤNG THE NEW GYM</h2>
              <p>
                Ứng dụng The New Gym cho bạn tất cả tiện ích bạn cần: ra/vào
                phòng tập 24/7, quản lý gói tập, chọn lớp học miễn phí, theo dõi
                các hoạt động của bạn và nhiều hơn thế nữa!
              </p>
              <p className="app-question">Bạn đã sẵn sàng chưa?</p>
              <p className="app-callout">
                Hãy cùng bước vào môi trường tập luyện không phán xét hôm nay!
              </p>
              <a href="#" className="app-download-link">
                <span className="arrow">→</span>
                <span>Tải ứng dụng ngay!</span>
              </a>
            </div>
            <div className="app-image">
              <img
                src="https://thenewgym.vn/wp-content/uploads/2025/09/Tai-ung-dung-app-the-new-gym-1.webp"
                alt="App"
              />
            </div>
          </div>
        </div>
      </section>

      <UserFooter />
    </div>
  );
};

export default UserHome;
