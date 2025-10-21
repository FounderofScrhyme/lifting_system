"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, User, Phone, MapPin, Calendar, DollarSign } from "lucide-react";

interface Staff {
  id: string;
  name: string;
  phone: string;
  address: string;
  employmentType: string;
}

interface InvoicePreviewProps {
  staff: Staff;
  amount: string;
  issueDate: string;
  siteNames: string[];
}

export function InvoicePreview({
  staff,
  amount,
  issueDate,
  siteNames,
}: InvoicePreviewProps) {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          請求書プレビュー
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* ヘッダー */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-blue-600 mb-2">請求書</h1>
          </div>

          {/* 会社情報 */}
          <div className="text-right text-sm text-gray-600">
            <p className="font-semibold">(株)LIFTING</p>
            <p>〒123-4567 東京都渋谷区1-2-3</p>
            <p>TEL: 03-1234-5678</p>
            <p>Email: info@liftingsystem.co.jp</p>
          </div>

          {/* 請求書情報 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              <span className="font-semibold">発行日:</span>
              <span>{new Date(issueDate).toLocaleDateString("ja-JP")}</span>
            </div>
          </div>

          {/* スタッフ情報 */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              請求先情報
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold w-20">氏名:</span>
                <span>{staff.name}</span>
                <Badge
                  variant={
                    staff.employmentType === "REGULAR" ? "default" : "secondary"
                  }
                  className="ml-2"
                >
                  {staff.employmentType === "REGULAR"
                    ? "レギュラー"
                    : "スポット"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span className="font-semibold w-20">電話番号:</span>
                <span>{staff.phone}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span className="font-semibold w-20">住所:</span>
                <span>{staff.address}</span>
              </div>
            </div>
          </div>

          {/* 品名欄 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-blue-800">品名</h3>
            <div className="space-y-2">
              {siteNames.map((siteName, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 py-2 border-b border-gray-200"
                >
                  <span className="font-semibold text-sm w-6">
                    {index + 1}.
                  </span>
                  <span className="text-sm">
                    {siteName || (
                      <span className="text-gray-400 italic">
                        現場名を入力してください
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 請求金額 */}
          <div className="bg-orange-50 p-6 rounded-lg border-2 border-orange-300">
            <div className="text-center">
              <h3 className="text-lg font-bold text-orange-800 mb-2">
                請求金額
              </h3>
              <div className="flex items-center justify-center gap-2">
                <DollarSign className="h-6 w-6 text-red-600" />
                <span className="text-2xl font-bold text-red-600">
                  ¥{amount || "0"}
                </span>
              </div>
            </div>
          </div>

          {/* 備考 */}
          <div className="bg-gray-50 p-3 rounded text-xs text-gray-600">
            <p>・支払いは上記支払期限までにお願いいたします。</p>
            <p>・ご不明な点がございましたら、お気軽にお問い合わせください。</p>
          </div>

          {/* フッター */}
          <div className="text-center text-xs text-gray-500 border-t pt-3">
            <p>この請求書はシステムにより自動生成されました。</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

