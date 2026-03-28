import { NotificationItem } from "@/types/notifications";

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  { 
    id: 1, 
    type: 'info', 
    title: 'Đơn hàng mới', 
    message: 'Bạn có đơn hàng #OR-2045 đang chờ xác nhận từ khách hàng Nguyen Van A.', 
    time: '2026-03-28T13:45:00Z', 
    read: false 
  },
  { 
    id: 2, 
    type: 'warning', 
    title: 'Sắp hết hàng', 
    message: 'Sản phẩm "Cà phê Robusta" trong kho chỉ còn lại 5kg. Vui lòng nhập thêm hàng.', 
    time: '2026-03-28T12:30:00Z', 
    read: false 
  },
  { 
    id: 3, 
    type: 'error', 
    title: 'Lỗi thiết bị', 
    message: 'Máy in hóa đơn tại quầy Bar đã mất kết nối. Vui lòng kiểm tra lại dây cáp.', 
    time: '2026-03-28T11:15:00Z', 
    read: false 
  },
  { 
    id: 4, 
    type: 'success', 
    title: 'Báo cáo doanh thu', 
    message: 'Báo cáo doanh thu ngày 27/03 đã được gửi đến email quản trị viên thành công.', 
    time: '2026-03-27T18:00:00Z', 
    read: true 
  },
  { 
    id: 5, 
    type: 'info', 
    title: 'Cập nhật hệ thống', 
    message: 'Phiên bản 2.4.0 đã được cập nhật với các tính năng quản lý kho mới.', 
    time: '2026-03-27T10:00:00Z', 
    read: true 
  },
  { 
    id: 6, 
    type: 'success', 
    title: 'Nhập kho thành công', 
    message: 'Lô hàng sữa tươi 50 thùng đã được cập nhật vào kho dữ liệu.', 
    time: '2026-03-26T15:20:00Z', 
    read: true 
  },
];
