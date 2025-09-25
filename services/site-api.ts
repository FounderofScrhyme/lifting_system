import axios from "axios";
import {
  Site,
  SiteFormData,
  SiteSuggestion,
  SiteApiResponse,
  SiteFilters,
} from "@/types/site";

class SiteApiService {
  private baseUrl = "/api/site";

  async getAllSites(filters: SiteFilters = {}): Promise<Site[]> {
    const params = new URLSearchParams();
    params.append("all", "true");

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });

    const response = await axios.get<SiteApiResponse>(
      `${this.baseUrl}?${params.toString()}`
    );
    return response.data.data;
  }

  async getSitesByDate(date: string): Promise<Site[]> {
    const response = await axios.get<SiteApiResponse>(
      `${this.baseUrl}?date=${date}`
    );
    return response.data.data;
  }

  async getSiteById(id: string): Promise<Site> {
    const response = await axios.get<Site>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async createSite(data: SiteFormData): Promise<Site> {
    const response = await axios.post<Site>(this.baseUrl, data);
    return response.data;
  }

  async updateSite(id: string, data: Partial<SiteFormData>): Promise<Site> {
    const response = await axios.put<Site>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deleteSite(id: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/${id}`);
  }

  async toggleCancelled(id: string): Promise<Site> {
    const response = await axios.patch<Site>(`${this.baseUrl}/${id}`, {
      cancelled: true,
    });
    return response.data;
  }

  async getSiteSuggestions(name: string): Promise<SiteSuggestion[]> {
    const response = await axios.get<{ data: SiteSuggestion[] }>(
      `${this.baseUrl}/suggestions?name=${encodeURIComponent(name)}`
    );
    return response.data.data;
  }
}

export const siteApiService = new SiteApiService();
