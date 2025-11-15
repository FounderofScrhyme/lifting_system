"use client";

import { useState, useEffect, useMemo } from "react";
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
  Eye,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

interface SiteListProps {
  selectedDate: string;
  onEdit: (site: Site) => void;
  onRefresh: () => void;
  onViewDetail?: (site: Site) => void;
  sites?: Site[]; // 親から受け取る現場データ（重複API呼び出しを削除）
  loading?: boolean; // 親から受け取るローディング状態
}

export function SiteList({
  selectedDate,
  onEdit,
  onRefresh,
  onViewDetail,
  sites: parentSites,
  loading: parentLoading,
}: SiteListProps) {
  // 親からデータが渡されている場合はそれを使用、なければ従来通りAPI呼び出し
  const [localSites, setLocalSites] = useState<Site[]>([]);
  const [localLoading, setLocalLoading] = useState(false);

  // 親からデータが渡されている場合はそれを使用
  const sites = parentSites || localSites;
  const loading = parentLoading !== undefined ? parentLoading : localLoading;

  // 親からデータが渡されていない場合のみ、従来のAPI呼び出しを実行
  useEffect(() => {
    if (!parentSites && selectedDate) {
      fetchSites();
    }
  }, [selectedDate, parentSites]);

  const fetchSites = async () => {
    try {
      setLocalLoading(true);
      const sitesResponse = await axios.get(`/api/site?date=${selectedDate}`);
      setLocalSites(sitesResponse.data.data);
    } catch (error) {
      console.error("Error fetching sites:", error);
      toast.error("現場一覧の取得に失敗しました");
    } finally {
      setLocalLoading(false);
    }
  };

  // 選択された日付でフィルタリング
  const filteredSites = useMemo(() => {
    if (!selectedDate || !sites) return [];

    const selectedDateObj = new Date(selectedDate);
    selectedDateObj.setHours(0, 0, 0, 0);
    const nextDay = new Date(selectedDateObj);
    nextDay.setDate(nextDay.getDate() + 1);

    return sites.filter((site) => {
      const siteDate = new Date(site.date);
      return siteDate >= selectedDateObj && siteDate < nextDay;
    });
  }, [sites, selectedDate]);

  // 現場に割り当てられたスタッフの名前を取得
  const getAssignedStaffNames = (site: Site) => {
    const staffNames: string[] = [];

    // 自社スタッフの割り当て
    if (site.assignments) {
      site.assignments.forEach((assignment) => {
        if (assignment.staff) {
          staffNames.push(assignment.staff.name);
        }
      });
    }

    // 応援スタッフの割り当て
    if (site.externalAssignments) {
      site.externalAssignments.forEach((assignment) => {
        staffNames.push(assignment.externalStaffName);
      });
    }

    return staffNames;
  };

  // スマホ専用のコピー処理
  const tryMobileCopy = async (copyText: string) => {
    try {
      // 方法1: 一時的なテキストエリアを作成してコピー（スマホ最適化）
      const textArea = document.createElement("textarea");
      textArea.value = copyText;
      textArea.style.position = "fixed";
      textArea.style.left = "50%";
      textArea.style.top = "50%";
      textArea.style.transform = "translate(-50%, -50%)";
      textArea.style.width = "1px";
      textArea.style.height = "1px";
      textArea.style.opacity = "0";
      textArea.style.pointerEvents = "none";
      textArea.style.zIndex = "-1";
      textArea.setAttribute("readonly", "");

      document.body.appendChild(textArea);

      // テキストを選択
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, 99999);

      // 少し待機してからコピーを実行
      await new Promise((resolve) => setTimeout(resolve, 50));
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        toast.success("現場詳細をコピーしました");
        return;
      }

      // 方法2: ユーザーにタップを促す方法
      const tempDiv = document.createElement("div");
      tempDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 20px;
        border-radius: 8px;
        z-index: 10000;
        text-align: center;
        font-size: 16px;
        max-width: 90%;
      `;

      tempDiv.innerHTML = `
        <div>テキストをタップしてコピーしてください</div>
        <div style="margin-top: 10px; padding: 10px; background: white; color: black; border-radius: 4px; font-family: monospace; font-size: 12px; word-break: break-all; max-height: 200px; overflow-y: auto;">${copyText}</div>
        <button style="margin-top: 10px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">閉じる</button>
      `;

      const textElement = tempDiv.querySelector("div:nth-child(2)");
      const closeButton = tempDiv.querySelector("button");

      if (textElement) {
        textElement.addEventListener("click", () => {
          // テキストを選択
          const range = document.createRange();
          range.selectNodeContents(textElement);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);

          // コピーを試行
          try {
            document.execCommand("copy");
            toast.success("コピーしました");
          } catch (e) {
            toast.error("コピーに失敗しました");
          }
        });
      }

      if (closeButton) {
        closeButton.addEventListener("click", () => {
          document.body.removeChild(tempDiv);
        });
      }

      document.body.appendChild(tempDiv);

      // 3秒後に自動で閉じる
      setTimeout(() => {
        if (document.body.contains(tempDiv)) {
          document.body.removeChild(tempDiv);
        }
      }, 10000);
    } catch (error) {
      console.error("Mobile copy failed:", error);
      // 最後の手段としてモーダルを表示
      showCopyModal(copyText);
    }
  };

  // コピーモーダルを表示する関数
  const showCopyModal = (copyText: string) => {
    const modal = document.createElement("div");
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      box-sizing: border-box;
    `;

    const content = document.createElement("div");
    content.style.cssText = `
      background: white;
      padding: 20px;
      border-radius: 8px;
      max-width: 90%;
      max-height: 80%;
      overflow: auto;
    `;

    const title = document.createElement("h3");
    title.textContent = "現場詳細をコピーしてください";
    title.style.cssText =
      "margin: 0 0 15px 0; font-size: 18px; font-weight: bold;";

    const textarea = document.createElement("textarea");
    textarea.value = copyText;
    textarea.style.cssText = `
      width: 100%;
      height: 200px;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-family: monospace;
      font-size: 14px;
      resize: vertical;
    `;

    const button = document.createElement("button");
    button.textContent = "閉じる";
    button.style.cssText = `
      margin-top: 15px;
      padding: 10px 20px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    `;
    button.onclick = () => document.body.removeChild(modal);

    content.appendChild(title);
    content.appendChild(textarea);
    content.appendChild(button);
    modal.appendChild(content);
    document.body.appendChild(modal);

    // テキストエリアを選択
    textarea.focus();
    textarea.select();

    toast.info("テキストを手動でコピーしてください");
  };

  // 現場詳細をコピーする関数
  const handleCopySiteDetails = async (site: Site) => {
    try {
      // 振り分けられたスタッフの名前を取得
      const assignedStaffNames = getAssignedStaffNames(site);

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
        `${formattedDate}の詳細です`,
        "",
        `【現場名】${site.name}`,
        `【開始時間】${formatTime(site.startTime)}`,
        `【スタッフ】${
          assignedStaffNames.length > 0
            ? assignedStaffNames.join("、")
            : "未割り当て"
        }`,
        `【作業内容】${site.workContent || "なし"}`,
        `【備考】${site.notes || "なし"}`,
        `【住所】${site.address}`,
        `【Google Map】${googleMapLink}`,
      ].join("\n");

      // スマホでの追加対応: ユーザーインタラクションが必要な場合
      const isMobile =
        /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      const isTouchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;

      // スマホ/タッチデバイスでのClipboard API試行（より積極的に）
      if (isMobile || isTouchDevice) {
        // スマホでは、ユーザーインタラクションの直後にClipboard APIを試行
        if (navigator.clipboard) {
          try {
            // ユーザーインタラクションを確実にするため、少し待機
            await new Promise((resolve) => setTimeout(resolve, 100));
            await navigator.clipboard.writeText(copyText);
            toast.success("現場詳細をコピーしました");
            return;
          } catch (clipboardError) {
            console.warn("Mobile Clipboard API failed:", clipboardError);
            // スマホでClipboard APIが失敗した場合は、より確実な方法を試行
            await tryMobileCopy(copyText);
            return;
          }
        } else {
          // Clipboard APIが利用できない場合は、より確実な方法を試行
          await tryMobileCopy(copyText);
          return;
        }
      }

      // デスクトップでのClipboard API試行
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(copyText);
          toast.success("現場詳細をコピーしました");
          return;
        } catch (clipboardError) {
          console.warn(
            "Clipboard API failed, trying fallback:",
            clipboardError
          );
        }
      }

      // フォールバック: 古いブラウザやスマホ用の方法
      const textArea = document.createElement("textarea");
      textArea.value = copyText;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      textArea.style.opacity = "0";
      textArea.setAttribute("readonly", "");
      document.body.appendChild(textArea);

      // スマホでの選択を改善
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, 99999); // モバイル対応

      try {
        const successful = document.execCommand("copy");
        if (successful) {
          toast.success("現場詳細をコピーしました");
        } else {
          throw new Error("execCommand failed");
        }
      } catch (fallbackError) {
        console.error("Fallback copy failed:", fallbackError);
        // 最後の手段: テキストを表示してユーザーに手動コピーを促す
        showCopyModal(copyText);
      } finally {
        document.body.removeChild(textArea);
      }
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
        return "bg-yellow-100 text-yellow-800";
      case "AM":
        return "bg-sky-100 text-sky-800";
      case "PM":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">読み込み中...</p>
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
          {selectedDate ? formatDate(selectedDate) : "現場一覧"} (
          {filteredSites.length}
          件)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filteredSites.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
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
                  <TableHead>作業内容</TableHead>
                  <TableHead>備考</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSites.map((site) => (
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
                          const assignedStaffNames =
                            getAssignedStaffNames(site);
                          // console.log(
                          //   `Staff names for site ${site.id}:`,
                          //   assignedStaffNames
                          // );

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
                      <div className="max-w-xs">
                        {site.workContent ? (
                          <div className="text-sm text-gray-700 line-clamp-2">
                            {site.workContent}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        {site.notes ? (
                          <div className="text-sm text-gray-700 line-clamp-2">
                            {site.notes}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
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
                          {" "}
                          <DropdownMenuItem
                            onClick={() => handleCopySiteDetails(site)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            詳細をコピー
                          </DropdownMenuItem>
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
