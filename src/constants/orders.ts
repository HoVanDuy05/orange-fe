export const ORDER_TABLE_COLUMNS = [
  { key: 'id', label: 'ID / Mã Đơn', width: 140 },
  { key: 'type', label: 'Phân loại', width: 120 },
  { key: 'customer', label: 'Khách hàng', width: 220 },
  { key: 'amount', label: 'Tổng tiền', width: 140, align: 'right' as const },
  { key: 'status', label: 'Trạng thái', width: 160, align: 'center' as const },
  { key: 'time', label: 'Thời gian', width: 120, align: 'center' as const },
  { key: 'actions', label: 'Thao tác', width: 240, align: 'center' as const },
];

export const ORDER_TABS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ', color: 'gray' },
  { value: 'confirmed', label: 'Xác nhận', color: 'blue' },
  { value: 'preparing', label: 'Đang làm', color: 'brand' },
  { value: 'delivering', label: 'Giao', color: 'yellow' },
  { value: 'served', label: 'Chờ khách', color: 'teal' },
  { value: 'completed', label: 'Hoàn tất', color: 'green' },
  { value: 'cancelled', label: 'Hủy', color: 'red' },
];

export const ORDER_TYPE_FILTERS = [
  { value: null, label: 'Tất cả loại', color: 'gray' },
  { value: 'dine_in', label: 'Tại bàn', color: 'brand' },
  { value: 'take_away', label: 'Mang đi', color: 'teal' },
  { value: 'delivery', label: 'Delivery', color: 'indigo' },
];
