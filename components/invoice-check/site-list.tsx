"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText } from "lucide-react";

interface InvoiceCheckSite {
  id: string;
  name: string;
  workContent?: string;
  notes?: string;
  client: {
    name: string;
  };
}

interface SiteListProps {
  sites: InvoiceCheckSite[];
  loading?: boolean;
  additionalTexts?: Record<string, string>;
  onTextChange?: (siteId: string, value: string) => void;
}

export function SiteList({
  sites,
  loading = false,
  additionalTexts = {},
  onTextChange,
}: SiteListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (sites.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <FileText className="h-8 w-8 text-muted-foreground mb-2" />
          <h3 className="text-sm font-semibold mb-1">現場がありません</h3>
          <p className="text-xs text-muted-foreground text-center">
            選択した日付には現場が登録されていません。
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">現場一覧</h3>
        <Badge variant="secondary" className="text-xs">
          {sites.length}件
        </Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead className="w-[80px] px-2 py-1">取引先名</TableHead>
                  <TableHead className="w-[100px] px-2 py-1">現場名</TableHead>
                  <TableHead className="w-[120px] px-2 py-1">
                    作業内容
                  </TableHead>
                  <TableHead className="w-[120px] px-2 py-1">備考</TableHead>
                  <TableHead className="w-[150px] px-2 py-1">
                    追加テキスト
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sites.map((site, index) => (
                  <TableRow key={site.id} className="text-xs">
                    <TableCell className="px-2 py-1 font-medium">
                      {site.client.name}
                    </TableCell>
                    <TableCell className="px-2 py-1">{site.name}</TableCell>
                    <TableCell className="px-2 py-1">
                      <div className="max-h-[60px] overflow-y-auto">
                        {site.workContent || "-"}
                      </div>
                    </TableCell>
                    <TableCell className="px-2 py-1">
                      <div className="max-h-[60px] overflow-y-auto">
                        {site.notes || "-"}
                      </div>
                    </TableCell>
                    <TableCell className="px-2 py-1">
                      <textarea
                        value={additionalTexts[site.id] || ""}
                        onChange={(e) =>
                          onTextChange
                            ? onTextChange(site.id, e.target.value)
                            : undefined
                        }
                        placeholder="追加テキストを入力..."
                        className="w-full h-[60px] text-xs p-1 border rounded resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                        readOnly={!onTextChange}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
