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
  Eye,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

interface SiteListProps {
  selectedDate: string;
  onEdit: (site: Site) => void;
  onRefresh: () => void;
  onViewDetail?: (site: Site) => void;
}

export function SiteList({
  selectedDate,
  onEdit,
  onRefresh,
  onViewDetail,
}: SiteListProps) {
  const [sites, setSites] = useState<Site[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedDate) {
      fetchSites();
    }
  }, [selectedDate]);

  const fetchSites = async () => {
    try {
      setLoading(true);
      // 並列でデータを取得
      const [sitesResponse, assignmentsResponse, staffResponse] =
        await Promise.all([
          axios.get(`/api/site?date=${selectedDate}`),
          axios.get(`/api/assignment/assignments?date=${selectedDate}`),
          axios.get(`/api/staff`),
        ]);

      setSites(sitesResponse.data.data);
      setAssignments(assignmentsResponse.data.data);
      setStaff(staffResponse.data.data);

      // デバッグ用ログ
      console.log("Fetched data:", {
        sites: sitesResponse.data.data.length,
        assignments: assignmentsResponse.data.data.length,
        staff: staffResponse.data.data.length,
      });
    } catch (error) {
      console.error("Error fetching sites:", error);
      toast.error("現場一覧の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // 現場に割り当てられたスタッフの名前を取得
  const getAssignedStaffNames = (siteId: string) => {
    const siteAssignments = assignments.filter(
      (assignment) => assignment.site.id === siteId
    );

    const staffNames = siteAssignments
      .map((assignment) => {
        // assignment.staff.id または assignment.staffId を確認
        const staffId = assignment.staff?.id || assignment.staffId;
        if (!staffId) {
          console.warn("Staff ID not found in assignment:", assignment);
          return null;
        }

        const staffMember = staff.find((s) => s.id === staffId);
        if (!staffMember) {
          console.warn("Staff member not found for ID:", staffId);
          return null;
        }

        return staffMember.name;
      })
      .filter((name) => name !== null); // null値を除外

    return staffNames;
  };

  // 現場詳細をコピーする関数
  const handleCopySiteDetails = async (site: Site) => {
    try {
      // 振り分けられたスタッフの名前を取得
      const assignedStaffNames = getAssignedStaffNames(site.id);

      // Google Mapリンクを生成
      const googleMapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        site.address
      )}`;

      // 日付をフォーマット（年月日のみ）
      const formattedDate = new Date(selectedDate).toLocaleDateString("ja-JP", {
        month: "long",
        day: "numeric",
      });

      // コピーする内容を構築
      const copyText = [
        `●${formattedDate}の詳細です`,
        "",
        `【現場名】${site.name}`,
        `【開始時間】${formatTime(site.startTime)}`,
        `【スタッフ】${
          assignedStaffNames.length > 0
            ? assignedStaffNames.join("、")
            : "未割り当て"
        }`,
        `【住所】${site.address}`,
        `【Google Map】${googleMapLink}`,
        `【備考】${site.notes || "なし"}`,
      ].join("\n");

      // クリップボードにコピー
      await navigator.clipboard.writeText(copyText);
      toast.success("現場詳細をコピーしました");
    } catch (error) {
      console.error("Error copying site details:", error);
      toast.error("コピーに失敗しました");
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
      const response = await axios.patch(`/api/site/${id}`, {
        cancelled: !currentStatus,
      });

      if (response.status === 200) {
        toast.success(
          currentStatus ? "現場を有効にしました" : "現場をキャンセルしました"
        );
        fetchSites();
        onRefresh();
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error toggling site status:", error);

      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        toast.error(`ステータスの変更に失敗しました: ${errorMessage}`);
      } else {
        toast.error("ステータスの変更に失敗しました");
      }
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
                  <TableHead>開始時間</TableHead>
                  <TableHead>振り分けスタッフ</TableHead>
                  <TableHead>住所</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sites.map((site) => (
                  <TableRow
                    key={site.id}
                    className={site.cancelled ? "opacity-50" : ""}
                  >
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
                      {(() => {
                        try {
                          const assignedStaffNames = getAssignedStaffNames(
                            site.id
                          );
                          console.log(
                            `Staff names for site ${site.id}:`,
                            assignedStaffNames
                          );

                          if (assignedStaffNames.length > 0) {
                            const maxDisplay = 4;
                            const displayNames = assignedStaffNames.slice(
                              0,
                              maxDisplay
                            );
                            const remainingCount =
                              assignedStaffNames.length - maxDisplay;

                            return (
                              <div className="flex flex-wrap gap-1">
                                {displayNames.map((name, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {name}
                                  </Badge>
                                ))}
                                {remainingCount > 0 && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-gray-100 text-gray-600"
                                  >
                                    他{remainingCount}名
                                  </Badge>
                                )}
                              </div>
                            );
                          } else {
                            return (
                              <span className="text-gray-500">未割り当て</span>
                            );
                          }
                        } catch (error) {
                          console.error(
                            "Error getting staff names for site:",
                            site.id,
                            error
                          );
                          return <span className="text-red-500">エラー</span>;
                        }
                      })()}
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onViewDetail && (
                            <DropdownMenuItem
                              onClick={() => {
                                console.log(
                                  "View detail clicked for site:",
                                  site.id,
                                  site.name
                                );
                                onViewDetail(site);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              詳細表示
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleCopySiteDetails(site)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            詳細をコピー
                          </DropdownMenuItem>
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
