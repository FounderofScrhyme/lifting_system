"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Eye, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Site } from "@/types/site";

interface SiteSearchProps {
  onEdit: (site: Site) => void;
  onViewDetail: (site: Site) => void;
  onRefresh: () => void;
}

export function SiteSearch({
  onEdit,
  onViewDetail,
  onRefresh,
}: SiteSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Site[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("現場名を入力してください");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `/api/site/suggestions?name=${encodeURIComponent(searchQuery.trim())}`
      );
      setSearchResults(response.data.data || []);
      setHasSearched(true);
    } catch (error) {
      console.error("Error searching sites:", error);
      toast.error("現場検索に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この現場を削除しますか？")) return;

    try {
      await axios.delete(`/api/site/${id}`);
      toast.success("現場を削除しました");
      handleSearch(); // 検索結果を更新
      onRefresh();
    } catch (error) {
      console.error("Error deleting site:", error);
      toast.error("削除に失敗しました");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP");
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const getSiteTypeLabel = (type: string) => {
    switch (type) {
      case "FULL":
        return "終日";
      case "AM":
        return "午前";
      case "PM":
        return "午後";
      default:
        return type;
    }
  };

  const getSiteTypeColor = (type: string) => {
    switch (type) {
      case "FULL":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "AM":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "PM":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>現場名検索</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 検索フォーム */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                id="siteSearch"
                placeholder="現場名を入力してください"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSearch} disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                {loading ? "検索中..." : "検索"}
              </Button>
              {hasSearched && (
                <Button onClick={handleClearSearch} variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  クリア
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 検索結果 */}
        {hasSearched && (
          <>
            {searchResults.length === 0 ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  「{searchQuery}」に一致する現場が見つかりませんでした
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">
                    「{searchQuery}」の検索結果: {searchResults.length}件
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>現場名</TableHead>
                        <TableHead>取引先</TableHead>
                        <TableHead>日付</TableHead>
                        <TableHead>開始時間</TableHead>
                        <TableHead>現場種別</TableHead>
                        <TableHead>現場責任者</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchResults.map((site) => (
                        <TableRow key={site.id}>
                          <TableCell className="font-medium">
                            {site.name}
                          </TableCell>
                          <TableCell>{site.client.name}</TableCell>
                          <TableCell>{formatDate(site.date)}</TableCell>
                          <TableCell>{formatTime(site.startTime)}</TableCell>
                          <TableCell>
                            <Badge className={getSiteTypeColor(site.siteType)}>
                              {getSiteTypeLabel(site.siteType)}
                            </Badge>
                          </TableCell>
                          <TableCell>{site.managerName || "-"}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => onViewDetail(site)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  詳細表示
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onEdit(site)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  編集
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(site.id)}
                                  className="text-red-600"
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  削除
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </>
        )}

        {!hasSearched && (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">現場名を入力して検索してください</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
