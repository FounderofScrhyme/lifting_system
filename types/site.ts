export interface Site {
  id: string;
  name: string;
  clientId: string;
  date: string;
  startTime: string;
  siteType: SiteType;
  managerName?: string;
  managerPhone?: string;
  postalCode?: string;
  address: string;
  googleMapUrl?: string;
  cancelled: boolean;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  client: {
    id: string;
    name: string;
  };
}

export enum SiteType {
  FULL = "FULL",
  AM = "AM",
  PM = "PM",
}

export interface SiteFormData {
  name: string;
  clientId: string;
  date: string;
  startTime: string;
  siteType: SiteType;
  managerName?: string;
  managerPhone?: string;
  postalCode?: string;
  address: string;
  googleMapUrl?: string;
  notes?: string;
}

export interface SiteSuggestion {
  id: string;
  name: string;
  clientId: string;
  managerName?: string;
  managerPhone?: string;
  postalCode?: string;
  address: string;
  googleMapUrl?: string;
  client: {
    id: string;
    name: string;
  };
}

export interface SiteCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Site;
}

export interface SiteFilters {
  clientId?: string;
  date?: string;
  siteType?: SiteType;
  cancelled?: boolean;
}

export interface SitePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SiteApiResponse {
  data: Site[];
  pagination?: SitePagination;
}
