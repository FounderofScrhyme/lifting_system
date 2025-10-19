"use client";

import { useState } from "react";
import { InvoiceCheckCalendar } from "@/components/invoice-check/invoice-check-calendar";
import { SiteList } from "@/components/invoice-check/site-list";
// import { InvoiceCheckForm } from "@/components/invoice-check/invoice-check-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  FileText,
  Save,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

interface InvoiceCheckSite {
  id: string;
  name: string;
  workContent?: string;
  notes?: string;
  client: {
    name: string;
  };
}

export default function InvoiceCheckPage() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [sites, setSites] = useState<InvoiceCheckSite[]>([]);
  const [loading, setLoading] = useState(false);
  const [additionalTexts, setAdditionalTexts] = useState<
    Record<string, string>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 選択された日付の現場データを取得
  const fetchSitesByDate = async (date: string) => {
    if (!date) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/invoice-check/sites?date=${date}`);
      if (response.ok) {
        const data = await response.json();
        setSites(data);
      } else {
        toast.error("現場データの取得に失敗しました");
        setSites([]);
      }
    } catch (error) {
      console.error("現場データ取得エラー:", error);
      toast.error("現場データの取得に失敗しました");
      setSites([]);
    } finally {
      setLoading(false);
    }
  };

  // 既存の請求書確認データを取得
  const fetchExistingInvoiceData = async (date: string) => {
    if (!date) return;

    try {
      const response = await fetch(`/api/invoice-check?date=${date}`);
      if (response.ok) {
        const data = await response.json();
        // 追加テキストのデータをマッピング
        const additionalTextsMap: Record<string, string> = {};
        data.forEach((item: any) => {
          if (item.additionalText) {
            additionalTextsMap[item.siteId] = item.additionalText;
          }
        });
        setAdditionalTexts(additionalTextsMap);
      }
    } catch (error) {
      console.error("既存データ取得エラー:", error);
    }
  };

  // テキスト変更ハンドラー
  const handleTextChange = (siteId: string, value: string) => {
    setAdditionalTexts((prev) => ({
      ...prev,
      [siteId]: value,
    }));
  };

  // 請求書確認データを保存
  const handleSave = async () => {
    if (sites.length === 0) {
      toast.error("保存する現場がありません");
      return;
    }

    setIsSubmitting(true);
    try {
      const siteData = sites.map((site) => ({
        id: site.id,
        name: site.name,
        clientName: site.client.name,
        workContent: site.workContent,
        notes: site.notes,
        additionalText: additionalTexts[site.id] || "",
      }));

      const response = await fetch("/api/invoice-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: selectedDate,
          siteData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details || errorData.error || "保存に失敗しました"
        );
      }

      toast.success("請求書確認データが保存されました");

      // 保存後に既存データを取得してフォームに反映
      await fetchExistingInvoiceData(selectedDate);
    } catch (error) {
      console.error("保存エラー:", error);
      const errorMessage =
        error instanceof Error ? error.message : "保存に失敗しました";
      toast.error(`保存に失敗しました: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // リセットハンドラー
  const handleReset = () => {
    setAdditionalTexts({});
    toast.info("入力内容をリセットしました");
  };

  // 日付選択時の処理
  const handleDateSelect = async (date: string) => {
    setSelectedDate(date);
    setAdditionalTexts({}); // 日付変更時にテキストをリセット
    await fetchSitesByDate(date);
    // 現場データ取得後に既存の請求書確認データを取得
    await fetchExistingInvoiceData(date);
  };

  // 変更状態の確認（表示用ではない）
  const hasChanges = Object.values(additionalTexts).some(
    (text) => text.trim() !== ""
  );

  return (
    <div className="space-y-6 p-2">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">取引先向け請求書確認</h1>
          <p className="text-muted-foreground">
            日付を選択して現場の請求書確認を行います
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            請求書確認
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左側: カレンダー */}
        <div className="space-y-4">
          <InvoiceCheckCalendar
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
            loading={loading}
          />
        </div>

        {/* 右側: 現場一覧とフォーム */}
        <div className="space-y-4">
          {selectedDate ? (
            <>
              {/* 選択された日付の表示 */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="h-4 w-4" />
                    選択された日付
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {selectedDate}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {sites.length}件の現場
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* 現場一覧 */}
              <SiteList
                sites={sites}
                loading={loading}
                additionalTexts={additionalTexts}
                onTextChange={handleTextChange}
              />

              {/* 操作ボタン */}
              {sites.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                        disabled={isSubmitting || !hasChanges}
                        className="flex items-center gap-1 text-xs"
                      >
                        <RotateCcw className="h-3 w-3" />
                        リセット
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isSubmitting || loading}
                        className="flex items-center gap-1 text-xs"
                      >
                        <Save className="h-3 w-3" />
                        {isSubmitting ? "保存中..." : "確定"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            /* 日付未選択時の表示 */
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <CalendarIcon className="h-8 w-8 text-muted-foreground mb-2" />
                <h3 className="text-sm font-semibold mb-1">
                  日付を選択してください
                </h3>
                <p className="text-xs text-muted-foreground text-center">
                  左側のカレンダーから日付を選択すると、
                  <br />
                  その日の現場一覧が表示されます。
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
