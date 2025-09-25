import { useState, useCallback, useEffect, useMemo } from "react";
import axios from "axios";
import { Site, SiteApiResponse } from "@/types/site";

interface UseSiteDataOptions {
  autoFetch?: boolean;
  filters?: Record<string, any>;
}

interface UseSiteDataReturn {
  sites: Site[];
  loading: boolean;
  error: string | null;
  fetchSites: () => Promise<void>;
  refreshSites: () => Promise<void>;
  setSites: React.Dispatch<React.SetStateAction<Site[]>>;
}

export function useSiteData(
  options: UseSiteDataOptions = {}
): UseSiteDataReturn {
  const { autoFetch = true, filters = {} } = options;

  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // フィルターを安定化
  const stableFilters = useMemo(() => filters, [JSON.stringify(filters)]);

  const fetchSites = useCallback(async () => {
    try {
      console.log("fetchSites called with filters:", stableFilters);
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append("all", "true");

      // フィルターを適用
      Object.entries(stableFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });

      const response = await axios.get<SiteApiResponse>(
        `/api/site?${params.toString()}`
      );
      console.log("Fetched sites:", response.data.data);
      setSites(response.data.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "現場データの取得に失敗しました";
      setError(errorMessage);
      console.error("Error fetching sites:", err);
    } finally {
      setLoading(false);
    }
  }, [stableFilters]);

  const refreshSites = useCallback(async () => {
    await fetchSites();
  }, [fetchSites]);

  useEffect(() => {
    if (autoFetch) {
      fetchSites();
    }
  }, [autoFetch, fetchSites]);

  return {
    sites,
    loading,
    error,
    fetchSites,
    refreshSites,
    setSites,
  };
}
