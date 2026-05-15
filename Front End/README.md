# FitZone Gym Management System

Hệ thống quản lý phòng tập gym được xây dựng bằng React + TypeScript + Vite.

## Tính năng

### Đã hoàn thành ✅

- **Login**: Đăng nhập với authentication
- **Dashboard**: Tổng quan thống kê, biểu đồ doanh thu
- **Members**: Quản lý hội viên (thêm, sửa, xóa, gia hạn)
- **Packages**: Quản lý gói tập
- **Trainers**: Quản lý huấn luyện viên
- **Check-in**: Quản lý check-in/check-out hội viên
- **Reports**: Báo cáo và thống kê

### Đang phát triển 🚧

- **Schedule**: Quản lý lịch tập
- **Facilities**: Quản lý thiết bị
- **Invoices**: Quản lý hóa đơn

## Công nghệ sử dụng

- React 18
- TypeScript
- Vite
- React Router DOM
- Font Awesome Icons
- CSS Variables (Dark/Light theme)

## Cài đặt

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build production
npm run build
```

## Tài khoản demo

### Admin

- Username: `admin`
- Password: `admin123`

### Trainer

- Username: `trainer`
- Password: `trainer123`

## Cấu trúc thư mục

```
src/
├── components/
│   └── layout/
│       ├── Layout.tsx
│       ├── Sidebar.tsx
│       └── Header.tsx
├── pages/
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Members.tsx
│   ├── Packages.tsx
│   ├── Trainers.tsx
│   ├── CheckIn.tsx
│   ├── Reports.tsx
│   ├── Schedule.tsx
│   ├── Facilities.tsx
│   └── Invoices.tsx
├── services/
│   └── api.ts
├── types/
│   └── index.ts
├── App.tsx
├── main.tsx
└── styles.css
```

## Tính năng nổi bật

### Theme

- Hỗ trợ Light/Dark mode
- Lưu preference vào localStorage

### Responsive

- Tối ưu cho desktop, tablet, mobile
- Sidebar collapse trên mobile

### Authentication

- Protected routes
- Auto redirect khi chưa đăng nhập
- Remember me functionality

### UI/UX

- Thiết kế hiện đại, chuyên nghiệp
- Animations mượt mà
- Icons đầy đủ
- Modal components
- Toast notifications

## Port

Server chạy trên port: **3001**

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Author

FitZone Gym Management Team
