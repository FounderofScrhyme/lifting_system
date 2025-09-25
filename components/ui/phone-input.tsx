import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePhoneFormat } from "@/hooks/use-phone-format";

interface PhoneInputProps {
  id: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  className?: string;
}

/**
 * 電話番号の自動ハイフン付与を行う入力コンポーネント
 */
export function PhoneInput({
  id,
  label,
  placeholder = "090-1234-5678",
  required = false,
  value = "",
  onChange,
  error,
  className,
}: PhoneInputProps) {
  const phoneFormat = usePhoneFormat(value);

  // 外部からの値変更を監視
  React.useEffect(() => {
    if (value !== phoneFormat.value) {
      phoneFormat.setValue(value);
    }
  }, [value]);

  // 値が変更されたときに外部に通知
  React.useEffect(() => {
    if (onChange && phoneFormat.value !== value) {
      onChange(phoneFormat.value);
    }
  }, [phoneFormat.value, onChange, value]);

  return (
    <div className={`space-y-2 ${className || ""}`}>
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Input
        id={id}
        value={phoneFormat.value}
        onChange={phoneFormat.onChange}
        placeholder={placeholder}
        className={error ? "border-red-500" : ""}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
