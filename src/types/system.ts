export interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  is_active: boolean;
  created_at?: string;
}

export interface Employee {
  id: number;
  full_name: string;
  email: string;
  role: 'admin' | 'staff';
  branch_id?: number;
  branch_name?: string;
}

export interface BrandTheme {
  id: number;
  target_type: 'admin' | 'client';
  brand_name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string | null;
  font_family: string | null;
  is_active: boolean;
  updated_at?: string;
}
