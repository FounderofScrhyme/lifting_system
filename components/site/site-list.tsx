"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Site } from "@/types/site";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  MoreHorizontal,
  Edit,
  Trash2,
  MapPin,
  Clock,
  User,
  Phone,
} from "lucide-react";
import { toast } from "sonner";

interface SiteListProps {
  selectedDate: string;
  onEdit: (site: Site) => void;
  onRefresh: () => void;
}

export function SiteList({ selectedDate, onEdit, onRefresh }: SiteListProps) {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedDate) {
      fetchSites();
    }
  }, [selectedDate]);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/site?date=${selectedDate}`);
      setSites(response.data.data);
    } catch (error) {
      console.error("Error fetching sites:", error);
      toast.error("現場一覧の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この現場を削除しますか？")) return;

    try {
      await axios.delete(`/api/site/${id}`);
      toast.success("現場を削除しました");
      fetchSites();
      onRefresh();
    } catch (error) {
      console.error("Error deleting site:", error);
      toast.error("削除に失敗しました");
    }
  };

  const handleToggleCancelled = async (id: string, currentStatus: boolean) => {
    try {
      await axios.patch(`/api/site/${id}`, {
        cancelled: !currentStatus,
      });
      toast.success(
        currentStatus ? "現場を有効にしました" : "現場をキャンセルしました"
      );
      fetchSites();
      onRefresh();
    } catch (error) {
      console.error("Error toggling site status:", error);
      toast.error("ステータスの変更に失敗しました");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const getSiteTypeLabel = (siteType: string) => {
    switch (siteType) {
      case "FULL":
        return "終日";
      case "AM":
        return "午前";
      case "PM":
        return "午後";
      default:
        return siteType;
    }
  };

  const getSiteTypeColor = (siteType: string) => {
    switch (siteType) {
      case "FULL":
        return "bg-yello-100 text-yello-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "AM":
        return "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300";
      case "PM":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDate ? formatDate(selectedDate) : "現場一覧"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                読み込み中...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {selectedDate ? formatDate(selectedDate) : "現場一覧"} ({sites.length}
          件)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sites.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {selectedDate
                ? "この日の現場はありません"
                : "現場データがありません"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>現場名</TableHead>
                  <TableHead>取引先</TableHead>
                  <TableHead>時間</TableHead>
                  <TableHead>タイプ</TableHead>
                  <TableHead>担当者</TableHead>
                  <TableHead>住所</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sites.map((site) => (
                  <TableRow key={site.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        {site.name}
                      </div>
                    </TableCell>
                    <TableCell>{site.client.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        {formatTime(site.startTime)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getSiteTypeColor(site.siteType)}>
                        {getSiteTypeLabel(site.siteType)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {site.managerName ? (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="font-medium">
                              {site.managerName}
                            </div>
                            {site.managerPhone && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Phone className="h-3 w-3" />
                                {site.managerPhone}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="text-sm">{site.address}</div>
                        {site.postalCode && (
                          <div className="text-xs text-gray-500">
                            〒{site.postalCode}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={site.cancelled ? "destructive" : "default"}
                        className={
                          site.cancelled
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        }
                      >
                        {site.cancelled ? "キャンセル" : "有効"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(site)}>
                            <Edit className="h-4 w-4 mr-2" />
                            編集
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleToggleCancelled(site.id, site.cancelled)
                            }
                          >
                            {site.cancelled ? (
                              <>
                                <User className="h-4 w-4 mr-2" />
                                有効にする
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                キャンセル
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(site.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
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
        )}
      </CardContent>
    </Card>
  );
}
