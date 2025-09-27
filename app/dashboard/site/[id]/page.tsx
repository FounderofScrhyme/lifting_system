"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  MapPin,
  Clock,
  User,
  Phone,
  Calendar,
  Users,
  Building,
  ExternalLink,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { Site } from "@/types/site";
import { Staff } from "@/types/staff";

interface SiteDetailData extends Site {
  client: {
    id: string;
    name: string;
  };
  assignedStaff?: {
    am: Staff[];
    pm: Staff[];
  };
}

export default function SiteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [site, setSite] = useState<SiteDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  const siteId = params.id as string;

  useEffect(() => {
    if (siteId) {
      fetchSiteDetail();
    }
  }, [siteId]);

  const fetchSiteDetail = async () => {
    try {
      setLoading(true);
      console.log("Fetching site detail for ID:", siteId);
      const response = await axios.get(`/api/site/${siteId}`);
      console.log("Site detail response:", response.data);
      setSite(response.data);
    } catch (error) {
      console.error("Error fetching site detail:", error);
      if (axios.isAxiosError(error)) {
        console.error("Error details:", error.response?.data);
      }
      toast.error("現場情報の取得に失敗しました");
    } finally {
      setLoading(false);
    }
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

  const getEmploymentTypeLabel = (type: string) => {
    switch (type) {
      case "REGULAR":
        return "レギュラー";
      case "SPOT":
        return "スポット";
      default:
        return type;
    }
  };

  const getEmploymentTypeColor = (type: string) => {
    switch (type) {
      case "REGULAR":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "SPOT":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5); // HH:MM形式に変換
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            現場が見つかりません
          </h1>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            戻る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            戻る
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{site.name}</h1>
            <p className="text-muted-foreground">
              {site.client.name} - {formatDate(site.date)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getSiteTypeColor(site.siteType)}>
            {getSiteTypeLabel(site.siteType)}
          </Badge>
          {site.cancelled && <Badge variant="destructive">キャンセル</Badge>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* メイン情報 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                基本情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    現場名
                  </Label>
                  <p className="text-lg font-semibold">{site.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    取引先
                  </Label>
                  <p className="text-lg">{site.client.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    日付
                  </Label>
                  <p className="text-lg">{formatDate(site.date)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    開始時間
                  </Label>
                  <p className="text-lg">{formatTime(site.startTime)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 現場責任者情報 */}
          {(site.managerName || site.managerPhone) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  現場責任者
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {site.managerName && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      責任者名
                    </Label>
                    <p className="text-lg">{site.managerName}</p>
                  </div>
                )}
                {site.managerPhone && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      連絡先
                    </Label>
                    <p className="text-lg">{site.managerPhone}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 住所情報 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                住所情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {site.postalCode && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    郵便番号
                  </Label>
                  <p className="text-lg">{site.postalCode}</p>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  住所
                </Label>
                <p className="text-lg">{site.address}</p>
              </div>
              {site.googleMapUrl && (
                <div>
                  <Button variant="outline" size="sm" asChild className="mt-2">
                    <a
                      href={site.googleMapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Google Mapで開く
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 備考 */}
          {site.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  備考
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg whitespace-pre-wrap">{site.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* サイドバー - 振り分け済スタッフ */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                振り分け済スタッフ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 午前のスタッフ */}
              {site.assignedStaff && site.assignedStaff.am.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">午前</span>
                    <Badge variant="outline">
                      {site.assignedStaff.am.length}名
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {site.assignedStaff.am.map((staff) => (
                      <div
                        key={staff.id}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                      >
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{staff.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getEmploymentTypeColor(
                            staff.employmentType
                          )}`}
                        >
                          {getEmploymentTypeLabel(staff.employmentType)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 午後のスタッフ */}
              {site.assignedStaff && site.assignedStaff.pm.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">午後</span>
                    <Badge variant="outline">
                      {site.assignedStaff.pm.length}名
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {site.assignedStaff.pm.map((staff) => (
                      <div
                        key={staff.id}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                      >
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{staff.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getEmploymentTypeColor(
                            staff.employmentType
                          )}`}
                        >
                          {getEmploymentTypeLabel(staff.employmentType)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* スタッフが未割り当ての場合 */}
              {(!site.assignedStaff ||
                (site.assignedStaff.am.length === 0 &&
                  site.assignedStaff.pm.length === 0)) && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    振り分け済みのスタッフがいません
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    振り分け管理からスタッフを配置してください
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
