import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <>
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>

      {/* 請求書作成クイックアクセス */}
      <div className="px-4 lg:px-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              請求書作成
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              スタッフを選択して請求書を作成し、PDFダウンロードまたはA4用紙に印刷できます。
            </p>
            <Button asChild className="flex items-center gap-2">
              <Link href="/dashboard/invoice">
                請求書を作成する
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
