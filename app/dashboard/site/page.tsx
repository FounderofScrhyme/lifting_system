"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { SiteForm } from "@/components/site/site-form";
import { SiteList } from "@/components/site/site-list";
import { SiteCalendar } from "@/components/site/site-calendar";
import { SiteSearch } from "@/components/site/site-search";
import { useSiteData } from "@/hooks/use-site-data";
import { Site } from "@/types/site";
import { ErrorHandler } from "@/lib/error-handler";
import { useRouter } from "next/navigation";

export default function SitePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("calendar");
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [previousTab, setPreviousTab] = useState<string>("calendar");

  const { sites, loading, error, refreshSites } = useSiteData({
    autoFetch: true,
    filters: {}, // 明示的に空のフィルターを指定
  });

  const handleDateSelect = useCallback((date: string) => {
    setSelectedDate(date);
    setActiveTab("list");
  }, []);

  const handleEdit = useCallback(
    (site: Site) => {
      setPreviousTab(activeTab); // 現在のタブを記録
      setEditingSite(site);
      setActiveTab("form");
    },
    [activeTab]
  );

  const handleFormSuccess = useCallback(async () => {
    setEditingSite(null);
    setActiveTab(previousTab); // 前のタブに戻る
    await refreshSites();
    ErrorHandler.showSuccess(
      editingSite ? "現場情報を更新しました" : "現場を登録しました"
    );
  }, [editingSite, previousTab, refreshSites]);

  const handleNewSite = useCallback(() => {
    setPreviousTab(activeTab); // 現在のタブを記録
    setEditingSite(null);
    setActiveTab("form");
  }, [activeTab]);

  const handleCalendarMonthChange = useCallback(async () => {
    await refreshSites();
  }, [refreshSites]);

  const handleViewDetail = useCallback(
    (site: Site) => {
      console.log("Navigating to site detail for ID:", site.id);
      router.push(`/dashboard/site/${site.id}`);
    },
    [router]
  );

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            エラーが発生しました
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refreshSites} variant="outline">
            再試行
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">現場管理</h1>
        <p className="text-gray-600">現場の登録・編集・確認ができます</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calendar">カレンダー</TabsTrigger>
          <TabsTrigger value="list">現場一覧</TabsTrigger>
          <TabsTrigger value="search">現場名検索</TabsTrigger>
          <TabsTrigger value="form">
            <Plus className="h-4 w-4" />
            {editingSite ? "編集" : "新規登録"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <SiteCalendar
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
            sites={sites}
            loading={loading}
            onMonthChange={handleCalendarMonthChange}
          />
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          {selectedDate ? (
            <SiteList
              selectedDate={selectedDate}
              onEdit={handleEdit}
              onRefresh={refreshSites}
              onViewDetail={handleViewDetail}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                カレンダーから日付を選択してください
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <SiteSearch
            onEdit={handleEdit}
            onViewDetail={handleViewDetail}
            onRefresh={refreshSites}
          />
        </TabsContent>

        <TabsContent value="form" className="space-y-4">
          <SiteForm
            initialData={editingSite}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setEditingSite(null);
              setActiveTab(previousTab);
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
