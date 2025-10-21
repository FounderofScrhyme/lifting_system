"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StaffSelector } from "@/components/invoice/staff-selector";
import { InvoiceForm } from "@/components/invoice/invoice-form";
import { FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Staff {
  id: string;
  name: string;
  phone: string;
  address: string;
  employmentType: string;
}

export default function InvoicePage() {
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [currentStep, setCurrentStep] = useState<"select" | "create">("select");

  const handleStaffSelect = (staff: Staff) => {
    setSelectedStaff(staff);
    setCurrentStep("create");
  };

  const handleBackToSelection = () => {
    setSelectedStaff(null);
    setCurrentStep("select");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        {currentStep === "create" && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToSelection}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            戻る
          </Button>
        )}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            請求書作成
          </h1>
          <p className="text-muted-foreground">
            {currentStep === "select"
              ? "スタッフを選択して請求書を作成します"
              : "請求書の詳細を入力してPDFを生成します"}
          </p>
        </div>
      </div>

      {/* ステップインジケーター */}
      <div className="flex items-center gap-4">
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
            currentStep === "select"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <span className="w-6 h-6 rounded-full bg-current flex items-center justify-center text-xs font-bold">
            1
          </span>
          スタッフ選択
        </div>
        <div className="w-8 h-px bg-border"></div>
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
            currentStep === "create"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <span className="w-6 h-6 rounded-full bg-current flex items-center justify-center text-xs font-bold">
            2
          </span>
          請求書作成
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="grid gap-6">
        {currentStep === "select" ? (
          <StaffSelector onStaffSelect={handleStaffSelect} />
        ) : (
          <InvoiceForm
            selectedStaff={selectedStaff}
            onBack={handleBackToSelection}
          />
        )}
      </div>

      {/* 使用方法の説明 */}
      <Card>
        <CardHeader>
          <CardTitle>使用方法</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">1. スタッフ選択</h4>
            <p>
              検索機能を使用してスタッフを検索し、請求書を作成するスタッフを選択してください。
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">2. 請求書情報入力</h4>
            <p>請求金額、発行日、現場名（品名）を入力してください。</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">
              3. プレビュー・PDF生成・印刷
            </h4>
            <p>
              <strong>プレビュー表示:</strong>{" "}
              入力内容を確認してから請求書を生成できます。
            </p>
            <p>
              <strong>PDFダウンロード:</strong>{" "}
              請求書をPDFファイルとしてダウンロードします。
            </p>
            <p>
              <strong>A4用紙2枚印刷:</strong>{" "}
              請求書をA4用紙に2枚印刷します（1枚は控え、1枚は原本用）。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
