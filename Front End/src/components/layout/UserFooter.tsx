import React from "react";
import { Link } from "react-router-dom";

const UserFooter: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Footer */}
      <footer className="footer-user">
        <div className="container">
          <div className="footer-top">
            <button className="back-to-top" onClick={scrollToTop}>
              BACK TO TOP
            </button>
          </div>

          <div className="footer-content">
            <div className="footer-col">
              <div className="footer-logo-fitzone">
                <i className="fas fa-dumbbell"></i>
                <span>FitZone</span>
              </div>
              <button className="btn-app">TẢI APP NGAY</button>
            </div>

            <div className="footer-col">
              <h4>Thông Tin</h4>
              <ul>
                <li>
                  <a href="#">Về Chúng Tôi</a>
                </li>
                <li>
                  <a href="#">Hệ Thống Phòng Tập</a>
                </li>
                <li>
                  <Link to="/blog">Tin Tức</Link>
                </li>
                <li>
                  <a href="#">Tuyển Dụng</a>
                </li>
                <li>
                  <a href="#">Liên Hệ</a>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Phòng Tập</h4>
              <ul>
                <li>
                  <a href="#">Hệ Thống Phòng Tập</a>
                </li>
                <li>
                  <a href="#">Giá Hội Viên</a>
                </li>
                <li>
                  <a href="#">Cơ Sở Vật Chất</a>
                </li>
                <li>
                  <a href="#">Ứng Dụng</a>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Chính sách</h4>
              <ul>
                <li>
                  <a href="#">Chính Sách Bảo Mật</a>
                </li>
                <li>
                  <a href="#">Điều Khoản</a>
                </li>
                <li>
                  <a href="#">Chăm Sóc Khách Hàng</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="social-links">
              <a
                href="https://www.facebook.com/fitzone"
                className="social-icon facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a
                href="https://www.instagram.com/fitzone"
                className="social-icon instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a
                href="https://www.tiktok.com/@fitzone"
                className="social-icon tiktok"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-tiktok"></i>
              </a>
              <a
                href="https://youtube.com/@fitzone"
                className="social-icon youtube"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-youtube"></i>
              </a>
            </div>
            <p>&copy; 2026 FitZone Gym.</p>
          </div>
        </div>
      </footer>

      {/* Floating Buttons */}
      <div className="floating-buttons">
        <a
          href="tel:0866197406"
          className="float-btn phone"
          title="Gọi ngay: 0866 197 406"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
            <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
          </svg>
        </a>
        <a
          href="https://zalo.me/0866197406"
          className="float-btn zalo"
          target="_blank"
          rel="noopener noreferrer"
          title="Chat Zalo"
        >
          <svg viewBox="0 0 48 48" fill="currentColor" width="32" height="32">
            <path d="M24 4C13 4 4 12.1 4 22c0 4.8 2.1 9.2 5.5 12.3l-.9 6.9 7.3-3.8c1.9.6 4 1 6.1 1 11 0 20-8.1 20-18S35 4 24 4zm9.7 25.7l-4.5-4.8-8.8 4.6 9.7-10.3 4.6 4.8 8.7-4.6-9.7 10.3z" />
          </svg>
        </a>
        <a
          href="https://m.me/fitzonegym"
          className="float-btn messenger"
          target="_blank"
          rel="noopener noreferrer"
          title="Chat Messenger"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
            <path d="M12 2C6.5 2 2 6.14 2 11.25c0 2.88 1.42 5.45 3.65 7.15V22l3.45-1.89c.92.25 1.89.39 2.9.39 5.5 0 10-4.14 10-9.25S17.5 2 12 2zm1 12.5l-2.5-2.67-4.88 2.67L11 9l2.56 2.67L18.5 9l-5.5 5.5z" />
          </svg>
        </a>
      </div>
    </>
  );
};

export default UserFooter;
