"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DashboardStats {
  totalRevenue: number;
  firstSaleMonth: string | null;
  regularStaffCount: number;
  spotStaffCount: number;
  clientCount: number;
}

export function SectionCards() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("統計データ取得エラー:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // 数値をフォーマットする関数
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(amount);
  };

  // 月の表示をフォーマットする関数
  const formatMonth = (month: string | null) => {
    if (!month) return "データなし";
    return `${month}月`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <CardDescription>読み込み中...</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                ---
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Total Revenue */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(stats?.totalRevenue || 0)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">総売上額</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">売上実績</div>
          <div className="text-muted-foreground">
            開始月: {formatMonth(stats?.firstSaleMonth || null)}
          </div>
        </CardFooter>
      </Card>

      {/* New Customers - レギュラースタッフ */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Regular Staff</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.regularStaffCount || 0}名
          </CardTitle>
          <CardAction>
            <Badge variant="outline">レギュラー</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            レギュラースタッフ
          </div>
        </CardFooter>
      </Card>

      {/* Active Accounts - スポットスタッフ */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Spot Staff</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.spotStaffCount || 0}名
          </CardTitle>
          <CardAction>
            <Badge variant="outline">スポット</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            スポットスタッフ
          </div>
        </CardFooter>
      </Card>

      {/* Growth Rate - 取引先件数 */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Clients</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.clientCount || 0}社
          </CardTitle>
          <CardAction>
            <Badge variant="outline">取引先</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            登録済み取引先
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
