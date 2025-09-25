"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePhoneFormat } from "@/hooks/use-phone-format";
import { usePostalCodeFormat } from "@/hooks/use-postal-code-format";
import { getAddressFromPostalCode } from "@/lib/address-api";
import { siteApiService } from "@/services/site-api";
import { ErrorHandler } from "@/lib/error-handler";
import { Site, SiteFormData, SiteType, SiteSuggestion } from "@/types/site";

const siteFormSchema = z.object({
  name: z.string().min(1, "現場名を入力してください"),
  clientId: z.string().min(1, "取引先を選択してください"),
  date: z.string().min(1, "日付を入力してください"),
  startTime: z.string().min(1, "開始時間を入力してください"),
  siteType: z.nativeEnum(SiteType, {
    message: "現場タイプを選択してください",
  }),
  managerName: z.string().optional(),
  managerPhone: z.string().optional(),
  postalCode: z.string().optional(),
  address: z.string().min(1, "住所を入力してください"),
  googleMapUrl: z.string().optional(),
  notes: z.string().optional(),
});

interface SiteFormProps {
  initialData?: Site | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function SiteForm({ initialData, onSuccess, onCancel }: SiteFormProps) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [siteSuggestions, setSiteSuggestions] = useState<SiteSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SiteFormData>({
    resolver: zodResolver(siteFormSchema),
    defaultValues: {
      siteType: SiteType.FULL,
    },
  });

  const managerPhoneFormat = usePhoneFormat(initialData?.managerPhone || "");
  const postalCodeFormat = usePostalCodeFormat(initialData?.postalCode || "");

  // 取引先データを取得
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoadingClients(true);
        const response = await fetch("/api/client");
        const data = await response.json();
        setClients(data.data || []);
      } catch (error) {
        ErrorHandler.showError(error, "取引先データの取得に失敗しました");
      } finally {
        setLoadingClients(false);
      }
    };

    fetchClients();
  }, []);

  // 初期データを設定
  useEffect(() => {
    if (initialData) {
      const formatDateForInput = (dateString: string) => {
        return new Date(dateString).toISOString().split("T")[0];
      };

      setValue("name", initialData.name);
      setValue("clientId", initialData.clientId);
      setValue("date", formatDateForInput(initialData.date));
      setValue("startTime", initialData.startTime);
      setValue("siteType", initialData.siteType);
      setValue("managerName", initialData.managerName || "");
      setValue("managerPhone", initialData.managerPhone || "");
      setValue("postalCode", initialData.postalCode || "");
      setValue("address", initialData.address);
      setValue("googleMapUrl", initialData.googleMapUrl || "");
      setValue("notes", initialData.notes || "");

      if (initialData.managerPhone) {
        managerPhoneFormat.setValue(initialData.managerPhone);
      }
      if (initialData.postalCode) {
        postalCodeFormat.setValue(initialData.postalCode);
      }
    }
  }, [initialData, setValue, managerPhoneFormat, postalCodeFormat]);

  const handlePostalCodeChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    postalCodeFormat.onChange(e);
    setValue("postalCode", e.target.value);

    if (e.target.value.replace(/\D/g, "").length === 7) {
      try {
        const address = await getAddressFromPostalCode(e.target.value);
        if (address) {
          setValue("address", address);
        }
      } catch (error) {
        console.error("住所取得エラー:", error);
      }
    }
  };

  const handleSiteNameChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const siteName = e.target.value;
    setValue("name", siteName);

    if (siteName.length >= 2) {
      try {
        const suggestions = await siteApiService.getSiteSuggestions(siteName);
        setSiteSuggestions(suggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error("現場名サジェスト取得エラー:", error);
      }
    } else {
      setSiteSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = (site: SiteSuggestion) => {
    setValue("name", site.name);
    setValue("clientId", site.clientId);
    setValue("managerName", site.managerName || "");
    setValue("managerPhone", site.managerPhone || "");
    setValue("postalCode", site.postalCode || "");
    setValue("address", site.address);
    setValue("googleMapUrl", site.googleMapUrl || "");

    if (site.managerPhone) {
      managerPhoneFormat.setValue(site.managerPhone);
    }
    if (site.postalCode) {
      postalCodeFormat.setValue(site.postalCode);
    }

    setShowSuggestions(false);
  };

  const onSubmit = async (data: SiteFormData) => {
    try {
      setLoading(true);

      const formData = {
        ...data,
        managerPhone: managerPhoneFormat.value,
        postalCode: postalCodeFormat.value,
      };

      if (initialData) {
        await siteApiService.updateSite(initialData.id, formData);
      } else {
        await siteApiService.createSite(formData);
      }

      onSuccess();
    } catch (error) {
      ErrorHandler.showError(error, "現場の保存に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const siteTypeOptions = [
    { value: SiteType.FULL, label: "全日" },
    { value: SiteType.AM, label: "午前" },
    { value: SiteType.PM, label: "午後" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "現場情報編集" : "現場登録"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 現場名 */}
            <div className="space-y-2">
              <Label htmlFor="name">現場名 *</Label>
              <div className="relative">
                <Input
                  id="name"
                  value={watch("name") || ""}
                  onChange={handleSiteNameChange}
                  placeholder="○○様邸"
                />
                {showSuggestions && siteSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {siteSuggestions.map((site) => (
                      <div
                        key={site.id}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                        onClick={() => handleSuggestionSelect(site)}
                      >
                        <div className="font-medium text-sm">{site.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {site.client.name} -{" "}
                          {site.managerName || "担当者未設定"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* 取引先 */}
            <div className="space-y-2">
              <Label htmlFor="clientId">取引先 *</Label>
              <Select
                value={watch("clientId") || ""}
                onValueChange={(value) => setValue("clientId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="取引先を選択" />
                </SelectTrigger>
                <SelectContent>
                  {loadingClients ? (
                    <SelectItem value="loading" disabled>
                      読み込み中...
                    </SelectItem>
                  ) : (
                    clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.clientId && (
                <p className="text-sm text-red-500">
                  {errors.clientId.message}
                </p>
              )}
            </div>

            {/* 日付 */}
            <div className="space-y-2">
              <Label htmlFor="date">日付 *</Label>
              <Input
                id="date"
                type="date"
                value={watch("date") || ""}
                onChange={(e) => setValue("date", e.target.value)}
              />
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date.message}</p>
              )}
            </div>

            {/* 開始時間 */}
            <div className="space-y-2">
              <Label htmlFor="startTime">開始時間 *</Label>
              <Input
                id="startTime"
                type="time"
                value={watch("startTime") || ""}
                onChange={(e) => setValue("startTime", e.target.value)}
              />
              {errors.startTime && (
                <p className="text-sm text-red-500">
                  {errors.startTime.message}
                </p>
              )}
            </div>

            {/* 現場タイプ */}
            <div className="space-y-2">
              <Label htmlFor="siteType">現場タイプ *</Label>
              <Select
                value={watch("siteType") || ""}
                onValueChange={(value) =>
                  setValue("siteType", value as SiteType)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="現場タイプを選択" />
                </SelectTrigger>
                <SelectContent>
                  {siteTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.siteType && (
                <p className="text-sm text-red-500">
                  {errors.siteType.message}
                </p>
              )}
            </div>

            {/* 現場担当者名 */}
            <div className="space-y-2">
              <Label htmlFor="managerName">現場担当者名</Label>
              <Input
                id="managerName"
                value={watch("managerName") || ""}
                onChange={(e) => setValue("managerName", e.target.value)}
                placeholder="田中太郎"
              />
            </div>

            {/* 現場担当者電話番号 */}
            <div className="space-y-2">
              <Label htmlFor="managerPhone">現場担当者電話番号</Label>
              <Input
                id="managerPhone"
                value={managerPhoneFormat.value}
                onChange={(e) => {
                  managerPhoneFormat.onChange(e);
                  setValue("managerPhone", e.target.value);
                }}
                placeholder="090-1234-5678"
              />
            </div>

            {/* 郵便番号 */}
            <div className="space-y-2">
              <Label htmlFor="postalCode">郵便番号</Label>
              <Input
                id="postalCode"
                value={postalCodeFormat.value}
                onChange={handlePostalCodeChange}
                placeholder="100-0001"
              />
            </div>

            {/* 住所 */}
            <div className="space-y-2">
              <Label htmlFor="address">住所 *</Label>
              <Input
                id="address"
                value={watch("address") || ""}
                onChange={(e) => setValue("address", e.target.value)}
                placeholder="東京都千代田区丸の内1-1-1"
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>

            {/* Google Map URL */}
            <div className="space-y-2">
              <Label htmlFor="googleMapUrl">Google Map URL</Label>
              <Input
                id="googleMapUrl"
                value={watch("googleMapUrl") || ""}
                onChange={(e) => setValue("googleMapUrl", e.target.value)}
                placeholder="https://maps.google.com/..."
              />
            </div>
          </div>

          {/* 備考 */}
          <div className="space-y-2">
            <Label htmlFor="notes">備考</Label>
            <Textarea
              id="notes"
              value={watch("notes") || ""}
              onChange={(e) => setValue("notes", e.target.value)}
              placeholder="特記事項があれば入力してください"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              キャンセル
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "保存中..." : initialData ? "更新" : "登録"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
