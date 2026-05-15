import React, { useState, useEffect } from "react";
import UserHeader from "../components/layout/UserHeader";
import UserFooter from "../components/layout/UserFooter";
import Breadcrumb from "../components/layout/Breadcrumb";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  date: string;
  author: string;
  readTime: string;
}

const Blog: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Load blog posts from API when available
  useEffect(() => {
    const loadFromAPI = async () => {
      try {
        const res = await fetch("http://localhost:7000/admin/Dashboard");
        if (res.ok) {
          console.log("Blog: Backend connected");
        }
      } catch {
        /* Backend unavailable - using static data */
      }
    };
    loadFromAPI();
  }, []);

  const blogPosts: BlogPost[] = [
    {
      id: 1,
      title: "10 Bài Tập Cardio Giúp Đốt Cháy Mỡ Hiệu Quả",
      excerpt:
        "Khám phá những bài tập cardio đơn giản nhưng cực kỳ hiệu quả giúp bạn đốt cháy calo và giảm cân nhanh chóng.",
      category: "Tập luyện",
      image:
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800",
      date: "15/04/2026",
      author: "HLV Minh Anh",
      readTime: "5 phút đọc",
    },
    {
      id: 2,
      title: "Chế Độ Dinh Dưỡng Cho Người Tập Gym",
      excerpt:
        "Hướng dẫn chi tiết về chế độ ăn uống khoa học giúp tăng cơ, giảm mỡ và cải thiện hiệu suất tập luyện.",
      category: "Dinh dưỡng",
      image:
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800",
      date: "12/04/2026",
      author: "Chuyên gia Hương Giang",
      readTime: "8 phút đọc",
    },
    {
      id: 3,
      title: "Tầm Quan Trọng Của Giấc Ngủ Với Sức Khỏe",
      excerpt:
        "Giấc ngủ đóng vai trò quan trọng như thế nào đối với quá trình phục hồi cơ bắp và sức khỏe tổng thể.",
      category: "Sức khỏe",
      image:
        "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800",
      date: "10/04/2026",
      author: "BS. Tuấn Anh",
      readTime: "6 phút đọc",
    },
    {
      id: 4,
      title: "Cách Tập Squat Đúng Kỹ Thuật Cho Người Mới",
      excerpt:
        "Hướng dẫn chi tiết từng bước để thực hiện động tác squat an toàn và hiệu quả nhất.",
      category: "Tập luyện",
      image:
        "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800",
      date: "08/04/2026",
      author: "HLV Đức Thắng",
      readTime: "7 phút đọc",
    },
    {
      id: 5,
      title: "Lợi Ích Của Yoga Đối Với Người Tập Gym",
      excerpt:
        "Tại sao bạn nên kết hợp yoga vào lịch tập gym để cải thiện độ linh hoạt và giảm căng thẳng.",
      category: "Sức khỏe",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800",
      date: "05/04/2026",
      author: "HLV Phương Anh",
      readTime: "5 phút đọc",
    },
    {
      id: 6,
      title: "Thực Đơn Tăng Cơ Cho Nam Giới",
      excerpt:
        "Gợi ý thực đơn chi tiết 7 ngày giúp nam giới tăng cơ bắp hiệu quả và khoa học.",
      category: "Dinh dưỡng",
      image:
        "https://images.unsplash.com/photo-1532384816664-01b8b7238c8d?w=800",
      date: "02/04/2026",
      author: "Chuyên gia Hương Giang",
      readTime: "10 phút đọc",
    },
    {
      id: 7,
      title: "Những Sai Lầm Phổ Biến Khi Tập Gym",
      excerpt:
        "Tránh những sai lầm này để tập luyện an toàn và đạt hiệu quả tối ưu.",
      category: "Tập luyện",
      image:
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800",
      date: "30/03/2026",
      author: "HLV Minh Anh",
      readTime: "6 phút đọc",
    },
    {
      id: 8,
      title: "Cách Phục Hồi Cơ Bắp Sau Tập Luyện",
      excerpt:
        "Các phương pháp khoa học giúp cơ bắp phục hồi nhanh chóng và phòng tránh chấn thương.",
      category: "Sức khỏe",
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
      date: "28/03/2026",
      author: "BS. Tuấn Anh",
      readTime: "7 phút đọc",
    },
    {
      id: 9,
      title: "Bí Quyết Giảm Mỡ Bụng Hiệu Quả",
      excerpt:
        "Kết hợp tập luyện và chế độ ăn để giảm mỡ bụng một cách khoa học và bền vững.",
      category: "Tập luyện",
      image:
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800",
      date: "25/03/2026",
      author: "HLV Đức Thắng",
      readTime: "8 phút đọc",
    },
  ];

  const filteredPosts =
    selectedCategory === "all"
      ? blogPosts
      : blogPosts.filter((post) => post.category === selectedCategory);

  return (
    <div className="blog-page">
      <UserHeader />

      <Breadcrumb
        items={[{ label: "Trang chủ", path: "/" }, { label: "Blog" }]}
      />

      {/* Submenu */}
      <div className="submenu-section">
        <div className="container">
          <div className="submenu">
            <button
              className={`submenu-item ${selectedCategory === "all" ? "active" : ""}`}
              onClick={() => setSelectedCategory("all")}
            >
              KIẾN THỨC
            </button>
            <button
              className={`submenu-item ${selectedCategory === "Tập luyện" ? "active" : ""}`}
              onClick={() => setSelectedCategory("Tập luyện")}
            >
              BÀI TẬP
            </button>
            <button
              className={`submenu-item ${selectedCategory === "Dinh dưỡng" ? "active" : ""}`}
              onClick={() => setSelectedCategory("Dinh dưỡng")}
            >
              DINH DƯỠNG
            </button>
            <button
              className={`submenu-item ${selectedCategory === "Sức khỏe" ? "active" : ""}`}
              onClick={() => setSelectedCategory("Sức khỏe")}
            >
              GIẢM CÂN
            </button>
            <button className="submenu-item">TIN KHUYẾN MÃI</button>
          </div>
        </div>
      </div>

      {/* Categories Filter - Hidden, using submenu instead */}
      {/* <section className="blog-categories">
        <div className="container">
          <div className="category-filters">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`category-btn ${selectedCategory === cat.id ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section> */}

      {/* Blog Posts Grid */}
      <section className="blog-posts">
        <div className="container">
          <div className="posts-grid">
            {filteredPosts.map((post) => (
              <article key={post.id} className="blog-card">
                <div className="blog-card-image">
                  <img src={post.image} alt={post.title} />
                  <span className="blog-category">{post.category}</span>
                </div>
                <div className="blog-card-content">
                  <div className="blog-meta">
                    <span>
                      <i className="far fa-calendar"></i> {post.date}
                    </span>
                    <span>
                      <i className="far fa-clock"></i> {post.readTime}
                    </span>
                  </div>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <div className="blog-footer">
                    <div className="blog-author">
                      <i className="fas fa-user-circle"></i>
                      <span>{post.author}</span>
                    </div>
                    <a href="#" className="read-more">
                      Đọc thêm <i className="fas fa-arrow-right"></i>
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <h2>Đăng ký nhận bài viết mới</h2>
            <p>
              Nhận những bài viết mới nhất về tập luyện và sức khỏe qua email
            </p>
            <div className="newsletter-form">
              <input type="email" placeholder="Nhập email của bạn" />
              <button className="btn-subscribe">Đăng ký</button>
            </div>
          </div>
        </div>
      </section>

      <UserFooter />
    </div>
  );
};

export default Blog;
