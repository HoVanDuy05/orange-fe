export interface Employee {
  id: number;
  full_name: string;
  email: string;
  role: 'admin' | 'staff' | 'manager' | 'chef';
  branch_id?: number;
  branch_name?: string;
  phone?: string;
}

export interface Branch {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  is_active: boolean;
}

export interface BrandTheme {
  id: number;
  brand_name: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  font_family?: string;
  target_type?: 'admin' | 'client' | 'global';
  active: boolean;
}
