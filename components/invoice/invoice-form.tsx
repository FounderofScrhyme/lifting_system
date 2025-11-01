"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FileText, Printer, User, Phone, MapPin, Eye } from "lucide-react";
import { InvoicePreview } from "./invoice-preview";

interface Staff {
  id: string;
  name: string;
  phone: string;
  address: string;
  employmentType: string;
}

interface InvoiceFormProps {
  selectedStaff: Staff | null;
  onBack: () => void;
}

export function InvoiceForm({ selectedStaff, onBack }: InvoiceFormProps) {
  const [amount, setAmount] = useState("");
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [siteNames, setSiteNames] = useState(["", "", ""]);
  const [showPreview, setShowPreview] = useState(false);

  if (!selectedStaff) {
    return null;
  }

  const handleAmountChange = (value: string) => {
    setAmount(value);
  };

  const handleSiteNameChange = (index: number, value: string) => {
    const newSiteNames = [...siteNames];
    newSiteNames[index] = value;
    setSiteNames(newSiteNames);
  };

  const handlePrint = () => {
    if (!amount) {
      alert("請求金額を入力してください。");
      return;
    }

    // プレビューを表示状態にする
    if (!showPreview) {
      setShowPreview(true);
      // プレビューが完全に表示されるまで待ってから印刷
      setTimeout(() => {
        window.print();
      }, 300);
    } else {
      // 既にプレビューが表示されている場合は即座に印刷
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* スタッフ情報表示 */}
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            選択されたスタッフ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{selectedStaff.name}</h3>
                <Badge
                  variant={
                    selectedStaff.employmentType === "REGULAR"
                      ? "default"
                      : "secondary"
                  }
                >
                  {selectedStaff.employmentType === "REGULAR"
                    ? "レギュラー"
                    : "スポット"}
                </Badge>
              </div>
              <Button variant="outline" onClick={onBack}>
                変更
              </Button>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {selectedStaff.phone}
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5" />
                {selectedStaff.address}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 請求書情報入力フォーム */}
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            請求書情報
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">請求金額</Label>
              <Input
                id="amount"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="100,000"
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issueDate">発行日</Label>
              <Input
                id="issueDate"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>現場名（品名）</Label>
            {siteNames.map((siteName, index) => (
              <div key={index} className="space-y-1">
                <Label
                  htmlFor={`siteName-${index}`}
                  className="text-sm text-muted-foreground"
                >
                  現場名 {index + 1}
                </Label>
                <Input
                  id={`siteName-${index}`}
                  value={siteName}
                  onChange={(e) => handleSiteNameChange(index, e.target.value)}
                  placeholder={`現場名 ${index + 1} を入力してください`}
                />
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={() => setShowPreview(!showPreview)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {showPreview ? "プレビューを隠す" : "プレビューを表示"}
            </Button>
            <Button
              onClick={handlePrint}
              disabled={!amount}
              variant="default"
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              印刷
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* プレビュー表示 */}
      {showPreview && (
        <InvoicePreview
          staff={selectedStaff}
          amount={amount}
          issueDate={issueDate}
          siteNames={siteNames}
        />
      )}
    </div>
  );
}
