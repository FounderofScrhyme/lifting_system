"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SupportStaffFormData } from "@/types/staff";
import { Plus } from "lucide-react";

interface SupportStaffModalProps {
  onAddSupportStaff: (data: SupportStaffFormData) => void;
  selectedDate: string;
}

interface FormErrors {
  companyName?: string;
  count?: string;
}

export function SupportStaffModal({
  onAddSupportStaff,
  selectedDate,
}: SupportStaffModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<SupportStaffFormData>({
    companyName: "",
    count: 1,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    const newErrors: FormErrors = {};
    if (!formData.companyName.trim()) {
      newErrors.companyName = "応援会社名は必須です";
    }
    if (formData.count < 1) {
      newErrors.count = "人数は1以上である必要があります";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 応援スタッフを追加
    onAddSupportStaff(formData);

    // フォームをリセット
    setFormData({
      companyName: "",
      count: 1,
    });
    setErrors({});
    setOpen(false);
  };

  const handleCancel = () => {
    setFormData({
      companyName: "",
      count: 1,
    });
    setErrors({});
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          応援スタッフ追加
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>応援スタッフ追加</DialogTitle>
          <DialogDescription>
            {selectedDate}の応援スタッフを追加します
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="companyName">
                応援会社名 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                placeholder="応援会社名を入力してください"
                className={errors.companyName ? "border-red-500" : ""}
              />
              {errors.companyName && (
                <p className="text-sm text-red-500">{errors.companyName}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="count">
                人数 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="count"
                type="number"
                min="1"
                value={formData.count}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    count: parseInt(e.target.value) || 1,
                  })
                }
                className={errors.count ? "border-red-500" : ""}
              />
              {errors.count && (
                <p className="text-sm text-red-500">{errors.count}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              キャンセル
            </Button>
            <Button type="submit">追加</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
