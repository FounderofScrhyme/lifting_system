"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { usePhoneFormat } from "@/hooks/use-phone-format";
import { usePostalCodeFormat } from "@/hooks/use-postal-code-format";
import { getAddressFromPostalCode } from "@/lib/address-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const clientSchema = z.object({
  name: z.string().min(1, "取引先名は必須です"),
  phone: z.string().min(1, "電話番号は必須です"),
  postalCode: z.string().optional(),
  address: z.string().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  notes: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  onSuccess?: () => void;
  initialData?: Partial<ClientFormData>;
  clientId?: string;
}

export function ClientForm({
  onSuccess,
  initialData,
  clientId,
}: ClientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialData,
  });

  // 電話番号の自動ハイフン付与
  const phoneFormat = usePhoneFormat(initialData?.phone || "");
  const contactPhoneFormat = usePhoneFormat(initialData?.contactPhone || "");

  // 郵便番号の自動ハイフン付与
  const postalCodeFormat = usePostalCodeFormat(initialData?.postalCode || "");

  // 日付フォーマット関数
  const formatDateForInput = (dateString: string | undefined): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  // 初期データが変更された時にフォームの値を更新
  useEffect(() => {
    if (initialData) {
      setValue("name", initialData.name || "");
      setValue("phone", initialData.phone || "");
      setValue("postalCode", initialData.postalCode || "");
      setValue("address", initialData.address || "");
      setValue("contactName", initialData.contactName || "");
      setValue("contactPhone", initialData.contactPhone || "");
      setValue("notes", initialData.notes || "");
    }
  }, [
    initialData?.name,
    initialData?.phone,
    initialData?.postalCode,
    initialData?.address,
    initialData?.contactName,
    initialData?.contactPhone,
    initialData?.notes,
    setValue,
  ]);

  // 郵便番号から住所を自動取得
  const handlePostalCodeChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    postalCodeFormat.onChange(e);

    const postalCode = e.target.value;
    const cleanPostalCode = postalCode.replace(/\D/g, "");

    // 7桁の数字が入力された場合のみ住所を取得
    if (cleanPostalCode.length === 7) {
      setIsLoadingAddress(true);
      try {
        const address = await getAddressFromPostalCode(postalCode);
        if (address) {
          setValue("address", address);
        }
      } catch (error) {
        console.error("住所取得エラー:", error);
      } finally {
        setIsLoadingAddress(false);
      }
    }
  };

  const onSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true);
    try {
      // フォーマットされた電話番号と郵便番号を設定
      const formData = {
        ...data,
        phone: phoneFormat.value,
        contactPhone: contactPhoneFormat.value,
        postalCode: postalCodeFormat.value,
      };

      if (clientId) {
        // 更新
        await axios.put(`/api/client/${clientId}`, formData);
        toast.success("取引先情報を更新しました");
      } else {
        // 新規作成
        await axios.post("/api/client", formData);
        toast.success("取引先を登録しました");
      }
      onSuccess?.();
    } catch (error) {
      console.error("Error saving client:", error);
      toast.error("エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{clientId ? "取引先情報編集" : "取引先登録"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">取引先名 *</Label>
              <Input id="name" {...register("name")} placeholder="●●工務店" />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">電話番号 *</Label>
              <Input
                id="phone"
                value={phoneFormat.value}
                onChange={(e) => {
                  phoneFormat.onChange(e);
                  setValue("phone", e.target.value);
                }}
                placeholder="03-1234-5678"
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">郵便番号</Label>
              <Input
                id="postalCode"
                value={postalCodeFormat.value}
                onChange={(e) => {
                  handlePostalCodeChange(e);
                  setValue("postalCode", e.target.value);
                }}
                placeholder="100-0001"
              />
              {isLoadingAddress && (
                <p className="text-sm text-blue-500">住所を取得中...</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">住所</Label>
              <Input
                id="address"
                {...register("address")}
                placeholder="東京都千代田区..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactName">担当者名</Label>
              <Input
                id="contactName"
                {...register("contactName")}
                placeholder="田中太郎"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">担当者電話番号</Label>
              <Input
                id="contactPhone"
                value={contactPhoneFormat.value}
                onChange={(e) => {
                  contactPhoneFormat.onChange(e);
                  setValue("contactPhone", e.target.value);
                }}
                placeholder="090-1234-5678"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">備考</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="その他の情報..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : clientId ? "更新" : "登録"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
