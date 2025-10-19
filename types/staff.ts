export interface Staff {
  id: string;
  name: string;
  birthDate: string;
  phone: string;
  emergencyName: string;
  emergencyPhone: string;
  employmentType: "SPOT" | "REGULAR";
  email?: string;
  postalCode?: string;
  address?: string;
  bloodType?: string;
  lastCheckupDate?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StaffApiResponse {
  data: Staff[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 応援スタッフ用の型定義
export interface SupportStaff {
  id: string;
  companyName: string;
  count: number;
  date: string;
  createdAt: Date;
  updatedAt: Date;
}

// 応援スタッフ追加用のフォームデータ
export interface SupportStaffFormData {
  companyName: string;
  count: number;
}
