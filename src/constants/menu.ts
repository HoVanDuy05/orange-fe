import {
  LayoutDashboard, ShoppingCart, Package, Tag, TableProperties,
  Image as ImageIcon, Layers, Zap, Settings, Users
} from 'lucide-react';
import { AdminNavGroup } from '@/types/menu';

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: 'Tổng quan',
    items: [
      { href: '/',         label: 'Dashboard',    icon: LayoutDashboard },
      { href: '/orders',   label: 'Đơn hàng',     icon: ShoppingCart,   badge: 'Live' },
      { href: '/pos',      label: 'POS Bán hàng', icon: Zap },
    ]
  },
  {
    label: 'Quản lý Menu',
    items: [
      { href: '/products',   label: 'Sản phẩm',  icon: Package },
      { href: '/categories', label: 'Danh mục',  icon: Tag },
    ]
  },
  {
    label: 'Vận hành',
    items: [
      { href: '/tables', label: 'Bàn phục vụ', icon: TableProperties },
      { href: '/stock',  label: 'Kho nguyên liệu', icon: Layers },
      { href: '/media',  label: 'Thư viện ảnh', icon: ImageIcon },
    ]
  },
  {
    label: 'Cấu hình',
    items: [
      { href: '/employees', label: 'Quản lý Nhân sự', icon: Users },
      { href: '/system',    label: 'Cài đặt Hệ thống', icon: Settings },
    ]
  }
];
