import { LucideIcon } from 'lucide-react';

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}
