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
