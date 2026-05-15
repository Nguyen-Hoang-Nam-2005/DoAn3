# Website Quản Lý Phòng Gym
---

## 1. Giới thiệu hệ thống
Website Quản Lý Phòng Gym là một hệ thống phần mềm được xây dựng nhằm hỗ trợ việc quản lý và vận hành các hoạt động trong phòng tập một cách hiệu quả. Hệ thống giúp quản lý hội viên, gói tập và toàn bộ quá trình đăng ký – sử dụng dịch vụ.

Thông qua website, hội viên có thể dễ dàng đăng ký tài khoản, lựa chọn gói tập, xem thông tin chi tiết và theo dõi quá trình luyện tập. Nhân viên có thể quản lý hội viên, xử lý đăng ký và theo dõi tình trạng hoạt động. Quản trị viên có thể quản lý người dùng và theo dõi hoạt động chung của hệ thống.

Việc sử dụng hệ thống giúp giảm bớt công việc thủ công, tăng độ chính xác khi lưu trữ dữ liệu và nâng cao hiệu quả quản lý.

---

## 2. Các Actor trong hệ thống

### Quản trị viên (Admin)
Quản trị viên là người có quyền cao nhất trong hệ thống, chịu trách nhiệm quản lý toàn bộ hoạt động của website.

#### Chức năng của Admin

**Quản lý người dùng**
- Xem danh sách tất cả người dùng trong hệ thống  
- Thêm mới tài khoản người dùng  
- Cập nhật thông tin tài khoản  
- Khóa hoặc mở khóa tài khoản khi cần thiết  

**Phân quyền hệ thống**
- Phân quyền cho các tài khoản (Admin, Nhân viên, Hội viên)

**Thống kê và báo cáo**
- Thống kê tổng số hội viên  
- Thống kê số lượng gói tập  
- Thống kê doanh thu  
- Thống kê lượt đăng ký  
- Thống kê gói tập phổ biến  

---

### Nhân viên (Staff)
Nhân viên là người trực tiếp quản lý hoạt động của phòng gym.

#### Chức năng của Nhân viên

**Quản lý hội viên**
- Xem danh sách hội viên  
- Cập nhật thông tin hội viên  
- Kiểm tra trạng thái gói tập  

**Quản lý gói tập**
- Thêm gói tập  
- Cập nhật gói tập  
- Xóa gói tập  

**Quản lý đăng ký**
- Xem danh sách đăng ký  
- Xác nhận đăng ký  
- Gia hạn gói tập  

---

### Hội viên (User)
Hội viên là người sử dụng hệ thống để đăng ký và tập luyện.

#### Chức năng của Hội viên

**Quản lý tài khoản**
- Đăng ký  
- Đăng nhập  
- Cập nhật thông tin  

**Đăng ký gói tập**
- Xem gói tập  
- Đăng ký  
- Theo dõi trạng thái  

**Lịch sử**
- Xem lịch sử đăng ký  
- Theo dõi thời hạn  
- Nhận thông báo  

---

## 3. Quy trình nghiệp vụ tổng quát

1. Quản lý hội viên  
2. Quản lý gói tập  
3. Quản lý đăng ký  
4. Theo dõi hoạt động  

---

## 4. Quy trình nghiệp vụ chi tiết

### 4.1 Quản lý gói tập
**Bước 1:** Nhân viên đăng nhập  
**Bước 2:** Truy cập chức năng quản lý  
**Bước 3:** Thực hiện thêm / sửa / xóa  
**Bước 4:** Lưu dữ liệu  

---

### 4.2 Quản lý hội viên
**Bước 1:** Đăng ký tài khoản  
- Họ tên  
- Email  
- Mật khẩu  
- SĐT  

**Bước 2:** Quản lý tài khoản  
- Xem danh sách  
- Cập nhật  
- Khóa tài khoản  

---

### 4.3 Đăng ký gói tập
**Bước 1:** Đăng nhập  
**Bước 2:** Chọn gói tập  
**Bước 3:** Gửi yêu cầu  
**Bước 4:** Nhân viên xác nhận  
**Bước 5:** Hệ thống lưu  

---

### 4.4 Gia hạn gói tập
**Bước 1:** Theo dõi thời hạn  
**Bước 2:** Thông báo  
**Bước 3:** Gia hạn  
**Bước 4:** Cập nhật hệ thống  

---

## 5. Các chức năng chính

### Hội viên
- Đăng ký / đăng nhập  
- Xem gói tập  
- Đăng ký  
- Theo dõi  

### Nhân viên
- Quản lý hội viên  
- Quản lý gói tập  
- Xác nhận đăng ký  

### Admin
- Quản lý người dùng  
- Phân quyền  
- Thống kê  

