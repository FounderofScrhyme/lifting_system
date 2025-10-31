"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { usePhoneFormat } from "@/hooks/use-phone-format";
import { useAddressAutofill } from "@/hooks/use-address-autofill";
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
import { toast } from "sonner";

const staffSchema = z.object({
  name: z
    .string({
      message: "名前を入力してください",
    })
    .min(1, "名前は必須です"),

  birthDate: z
    .string({
      message: "生年月日を入力してください",
    })
    .min(1, "生年月日は必須です"),

  phone: z
    .string({
      message: "電話番号を入力してください",
    })
    .min(1, "電話番号は必須です"),

  email: z
    .string({
      message: "メールアドレスを正しく入力してください",
    })
    .email("有効なメールアドレスを入力してください")
    .optional()
    .or(z.literal("")),

  postalCode: z
    .string({
      message: "郵便番号は文字列で入力してください",
    })
    .optional(),

  address: z
    .string({
      message: "住所は文字列で入力してください",
    })
    .optional(),

  emergencyName: z
    .string({
      message: "緊急連絡先の名前を入力してください",
    })
    .min(1, "緊急連絡先の名前は必須です"),

  emergencyPhone: z
    .string({
      message: "緊急連絡先の電話番号を入力してください",
    })
    .min(1, "緊急連絡先の電話番号は必須です"),

  bloodType: z
    .string({
      message: "血液型は文字列で入力してください",
    })
    .optional(),

  bloodPressure: z
    .string({
      message: "血圧は文字列で入力してください",
    })
    .optional(),

  lastCheckupDate: z
    .string({
      message: "最終健診日は正しい日付形式で入力してください",
    })
    .optional(),

  employmentType: z.enum(["SPOT", "REGULAR"], {
    message: "雇用形態を選択してください",
  }),

  notes: z
    .string({
      message: "備考は文字列で入力してください",
    })
    .optional(),
});

type StaffFormData = z.infer<typeof staffSchema>;

interface StaffFormProps {
  onSuccess?: () => void;
  initialData?: Partial<StaffFormData>;
  staffId?: string;
}

export function StaffForm({ onSuccess, initialData, staffId }: StaffFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: initialData,
  });

  const employmentType = watch("employmentType");

  // 電話番号の自動ハイフン付与
  const phoneFormat = usePhoneFormat(initialData?.phone || "");
  const emergencyPhoneFormat = usePhoneFormat(
    initialData?.emergencyPhone || ""
  );

  // 住所自動取得（郵便番号入力）共通フック
  const {
    postalCodeFormat,
    handlePostalCodeChange,
    handlePostalCodeCompositionEnd,
    isLoadingAddress,
  } = useAddressAutofill({
    onAddressFound: (address) => setValue("address", address),
    onPostalCodeChange: (code) => setValue("postalCode", code),
  });

  // 日付フォーマット関数
  const formatDateForInput = (dateString: string | undefined): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split("T")[0]; // YYYY-MM-DD形式に変換
    } catch {
      return "";
    }
  };

  // 初期データが変更された時にフォームの値を更新
  useEffect(() => {
    if (initialData) {
      // 基本フィールドの設定
      setValue("name", initialData.name || "");
      setValue("birthDate", formatDateForInput(initialData.birthDate));
      setValue("phone", initialData.phone || "");
      setValue("email", initialData.email || "");
      setValue("postalCode", initialData.postalCode || "");
      setValue("address", initialData.address || "");
      setValue("emergencyName", initialData.emergencyName || "");
      setValue("emergencyPhone", initialData.emergencyPhone || "");
      setValue("bloodType", initialData.bloodType || "");
      setValue("bloodPressure", initialData.bloodPressure || "");
      setValue(
        "lastCheckupDate",
        formatDateForInput(initialData.lastCheckupDate)
      );
      setValue("employmentType", initialData.employmentType || "SPOT");
      setValue("notes", initialData.notes || "");
    }
  }, [
    initialData?.name,
    initialData?.birthDate,
    initialData?.phone,
    initialData?.email,
    initialData?.postalCode,
    initialData?.address,
    initialData?.emergencyName,
    initialData?.emergencyPhone,
    initialData?.bloodType,
    initialData?.bloodPressure,
    initialData?.lastCheckupDate,
    initialData?.employmentType,
    initialData?.notes,
    setValue,
  ]);

  // 郵便番号から住所自動取得は共通フックに委譲

  const onSubmit = async (data: StaffFormData) => {
    setIsSubmitting(true);
    try {
      // フォーマットされた電話番号と郵便番号を設定
      const formData = {
        ...data,
        phone: phoneFormat.value,
        emergencyPhone: emergencyPhoneFormat.value,
        postalCode: postalCodeFormat.value,
      };

      if (staffId) {
        // 更新
        await axios.put(`/api/staff/${staffId}`, formData);
        toast.success("スタッフ情報を更新しました");
      } else {
        // 新規作成
        await axios.post("/api/staff", formData);
        toast.success("スタッフを登録しました");
      }
      onSuccess?.();
    } catch (error) {
      console.error("Error saving staff:", error);
      toast.error("エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{staffId ? "スタッフ情報編集" : "スタッフ登録"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">名前 *</Label>
              <Input id="name" {...register("name")} placeholder="山田太郎" />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">生年月日 *</Label>
              <Input
                id="birthDate"
                type="date"
                value={watch("birthDate") || ""}
                onChange={(e) => setValue("birthDate", e.target.value)}
              />
              {errors.birthDate && (
                <p className="text-sm text-red-500">
                  {errors.birthDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">電話番号 *</Label>
              <Input
                id="phone"
                value={phoneFormat.value}
                onChange={(e) => {
                  phoneFormat.onChange(e);
                  setValue("phone", phoneFormat.value);
                }}
                onInput={phoneFormat.onInput}
                onCompositionStart={phoneFormat.onCompositionStart}
                onCompositionEnd={phoneFormat.onCompositionEnd}
                inputMode="numeric"
                autoComplete="tel"
                placeholder="090-1234-5678"
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="example@email.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">郵便番号</Label>
              <Input
                id="postalCode"
                value={postalCodeFormat.value}
                onChange={(e) => {
                  handlePostalCodeChange(e);
                  setValue("postalCode", postalCodeFormat.value);
                }}
                onInput={postalCodeFormat.onInput}
                onCompositionStart={postalCodeFormat.onCompositionStart}
                onCompositionEnd={handlePostalCodeCompositionEnd}
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="123-4567"
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
                placeholder="東京都渋谷区..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyName">緊急連絡先名前 *</Label>
              <Input
                id="emergencyName"
                {...register("emergencyName")}
                placeholder="山田花子"
              />
              {errors.emergencyName && (
                <p className="text-sm text-red-500">
                  {errors.emergencyName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">緊急連絡先電話番号 *</Label>
              <Input
                id="emergencyPhone"
                value={emergencyPhoneFormat.value}
                onChange={(e) => {
                  emergencyPhoneFormat.onChange(e);
                  setValue("emergencyPhone", emergencyPhoneFormat.value);
                }}
                onInput={emergencyPhoneFormat.onInput}
                onCompositionStart={emergencyPhoneFormat.onCompositionStart}
                onCompositionEnd={emergencyPhoneFormat.onCompositionEnd}
                inputMode="numeric"
                autoComplete="tel"
                placeholder="090-1234-5678"
              />
              {errors.emergencyPhone && (
                <p className="text-sm text-red-500">
                  {errors.emergencyPhone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bloodType">血液型</Label>
              <Select
                value={watch("bloodType") || ""}
                onValueChange={(value) => setValue("bloodType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="血液型を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A型</SelectItem>
                  <SelectItem value="B">B型</SelectItem>
                  <SelectItem value="AB">AB型</SelectItem>
                  <SelectItem value="O">O型</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bloodPressure">血圧</Label>
              <Input
                id="bloodPressure"
                {...register("bloodPressure")}
                placeholder="120/80"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastCheckupDate">最終健康診断日</Label>
              <Input
                id="lastCheckupDate"
                type="date"
                value={watch("lastCheckupDate") || ""}
                onChange={(e) => setValue("lastCheckupDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employmentType">雇用形態 *</Label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="employmentType-spot"
                    name="employmentType"
                    value="SPOT"
                    checked={watch("employmentType") === "SPOT"}
                    onChange={(e) =>
                      setValue(
                        "employmentType",
                        e.target.value as "SPOT" | "REGULAR"
                      )
                    }
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <Label
                    htmlFor="employmentType-spot"
                    className="text-sm font-normal cursor-pointer"
                  >
                    スポット
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="employmentType-regular"
                    name="employmentType"
                    value="REGULAR"
                    checked={watch("employmentType") === "REGULAR"}
                    onChange={(e) =>
                      setValue(
                        "employmentType",
                        e.target.value as "SPOT" | "REGULAR"
                      )
                    }
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <Label
                    htmlFor="employmentType-regular"
                    className="text-sm font-normal cursor-pointer"
                  >
                    レギュラー
                  </Label>
                </div>
              </div>
              {errors.employmentType && (
                <p className="text-sm text-red-500">
                  {errors.employmentType.message}
                </p>
              )}
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
              {isSubmitting ? "保存中..." : staffId ? "更新" : "登録"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
