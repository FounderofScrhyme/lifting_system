"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const saleSchema = z.object({
  clientId: z.string().min(1, "取引先を選択してください"),
  month: z.string().min(1, "月を選択してください"),
  amount: z.number().min(1, "売上金額は必須です"),
  notes: z.string().optional(),
});

type SaleFormData = z.infer<typeof saleSchema>;

interface Client {
  id: string;
  name: string;
}

interface SaleFormProps {
  onSuccess?: () => void;
  initialData?: Partial<SaleFormData>;
  saleId?: string;
}

export function SaleForm({ onSuccess, initialData, saleId }: SaleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: initialData,
  });

  const selectedClientId = watch("clientId");

  // 取引先一覧を取得
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get("/api/client?limit=1000");
        setClients(response.data.data);
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast.error("取引先一覧の取得に失敗しました");
      } finally {
        setLoadingClients(false);
      }
    };

    fetchClients();
  }, []);

  // 初期データが変更された時にフォームの値を更新
  useEffect(() => {
    if (initialData) {
      setValue("clientId", initialData.clientId || "");
      setValue("month", initialData.month || "");
      setValue("amount", initialData.amount || 0);
      setValue("notes", initialData.notes || "");
    }
  }, [
    initialData?.clientId,
    initialData?.month,
    initialData?.amount,
    initialData?.notes,
    setValue,
  ]);

  // 月の選択肢を生成
  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();

    // 過去24ヶ月分の選択肢を生成
    for (let i = 0; i < 24; i++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const value = `${year}-${month}`;
      const label = `${year}年${month}月`;
      options.push({ value, label });
    }

    return options;
  };

  const monthOptions = generateMonthOptions();

  const onSubmit = async (data: SaleFormData) => {
    setIsSubmitting(true);
    try {
      if (saleId) {
        // 更新
        await axios.put(`/api/sale/${saleId}`, data);
        toast.success("売上情報を更新しました");
      } else {
        // 新規作成
        await axios.post("/api/sale", data);
        toast.success("売上を登録しました");
      }
      onSuccess?.();
    } catch (error) {
      console.error("Error saving sale:", error);
      toast.error("エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{saleId ? "売上情報編集" : "売上登録"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="month">月 *</Label>
              <Select
                value={watch("month") || ""}
                onValueChange={(value) => setValue("month", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="月を選択" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.month && (
                <p className="text-sm text-red-500">{errors.month.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">売上金額 *</Label>
              <Input
                id="amount"
                type="number"
                {...register("amount", { valueAsNumber: true })}
                placeholder="1000000"
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">備考</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="売上に関する詳細情報..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : saleId ? "更新" : "登録"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
