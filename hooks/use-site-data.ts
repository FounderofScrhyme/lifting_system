import { useState, useCallback, useEffect, useMemo } from "react";
import axios from "axios";
import { Site, SiteApiResponse } from "@/types/site";

interface UseSiteDataOptions {
  autoFetch?: boolean;
  filters?: Record<string, any>;
  monthRange?: {
    startDate: string; // ISO形式の日付文字列
    endDate: string; // ISO形式の日付文字列
  };
}

interface UseSiteDataReturn {
  sites: Site[];
  loading: boolean;
  error: string | null;
  fetchSites: () => Promise<void>;
  refreshSites: () => Promise<void>;
  setSites: React.Dispatch<React.SetStateAction<Site[]>>;
}

/**
 * 月の開始日と終了日を計算する（表示月の前後1ヶ月を含む）
 */
function calculateMonthRange(centerDate: Date = new Date()) {
  const start = new Date(centerDate);
  start.setMonth(start.getMonth() - 1);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(centerDate);
  end.setMonth(end.getMonth() + 2);
  end.setDate(0); // 前月の最終日
  end.setHours(23, 59, 59, 999);

  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
}

export function useSiteData(
  options: UseSiteDataOptions = {}
): UseSiteDataReturn {
  const { autoFetch = true, filters = {}, monthRange } = options;

  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // フィルターを安定化
  const stableFilters = useMemo(() => filters, [JSON.stringify(filters)]);

  // 月範囲を計算（指定がない場合は現在の月を中心に前後1ヶ月）
  const calculatedMonthRange = useMemo(() => {
    if (monthRange) {
      return monthRange;
    }
    return calculateMonthRange();
  }, [monthRange]);

  const fetchSites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      // 月単位取得を使用（全件取得を廃止）
      params.append("startDate", calculatedMonthRange.startDate);
      params.append("endDate", calculatedMonthRange.endDate);

      // フィルターを適用
      Object.entries(stableFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });

      const response = await axios.get<SiteApiResponse>(
        `/api/site?${params.toString()}`
      );
      setSites(response.data.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "現場データの取得に失敗しました";
      setError(errorMessage);
      console.error("Error fetching sites:", err);
    } finally {
      setLoading(false);
    }
  }, [stableFilters, calculatedMonthRange]);

  const refreshSites = useCallback(async () => {
    await fetchSites();
  }, [fetchSites]);

  useEffect(() => {
    if (autoFetch) {
      fetchSites();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch, calculatedMonthRange.startDate, calculatedMonthRange.endDate]);

  return {
    sites,
    loading,
    error,
    fetchSites,
    refreshSites,
    setSites,
  };
}
