import { useEffect } from "react";

export default function Logout() {
  useEffect(() => {
    // Xóa tất cả localStorage
    localStorage.clear();

    // Chuyển về trang chủ và reload để xóa cache
    window.location.href = "/";
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <div style={{ fontSize: "2rem" }}>🔄</div>
      <div>Đang đăng xuất...</div>
    </div>
  );
}
