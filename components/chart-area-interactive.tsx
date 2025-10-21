"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  Bar,
  BarChart,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "Sales charts";

interface MonthlySalesData {
  month: string;
  amount: number;
}

interface ClientSalesData {
  clientId: string;
  clientName: string;
  amount: number;
}

const monthlyChartConfig = {
  amount: {
    label: "売上額",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

const clientChartConfig = {
  amount: {
    label: "売上額",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const [monthlyData, setMonthlyData] = React.useState<MonthlySalesData[]>([]);
  const [clientData, setClientData] = React.useState<ClientSalesData[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // 月次売上データを取得
        const monthlyResponse = await fetch("/api/dashboard/monthly-sales");
        if (monthlyResponse.ok) {
          const monthlySalesData = await monthlyResponse.json();
          setMonthlyData(monthlySalesData);
        }

        // 取引先別売上データを取得
        const clientResponse = await fetch("/api/dashboard/client-sales");
        if (clientResponse.ok) {
          const clientSalesData = await clientResponse.json();
          setClientData(clientSalesData);
        }
      } catch (error) {
        console.error("売上データ取得エラー:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="@container/card">
          <CardHeader>
            <CardTitle>月次売上</CardTitle>
            <CardDescription>月ごとの売上実績</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">読み込み中...</div>
            </div>
          </CardContent>
        </Card>
        <Card className="@container/card">
          <CardHeader>
            <CardTitle>取引先別売上</CardTitle>
            <CardDescription>取引先ごとの売上実績</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">読み込み中...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* 月次売上チャート */}
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>月次売上</CardTitle>
          <CardDescription>月ごとの売上実績</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer
            config={monthlyChartConfig}
            className="h-[200px] w-full"
          >
            <AreaChart
              accessibilityLayer
              data={monthlyData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <defs>
                <linearGradient id="fillAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-amount)"
                    stopOpacity={1.0}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-amount)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  return `${value}月`;
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return `${value}月`;
                    }}
                    formatter={(value) => [
                      new Intl.NumberFormat("ja-JP", {
                        style: "currency",
                        currency: "JPY",
                      }).format(Number(value)),
                      "売上額",
                    ]}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="amount"
                type="natural"
                fill="url(#fillAmount)"
                stroke="var(--color-amount)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 取引先別売上チャート */}
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>取引先別売上</CardTitle>
          <CardDescription>取引先ごとの売上実績</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer
            config={clientChartConfig}
            className="h-[200px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={clientData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="clientName"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={16}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => {
                  return new Intl.NumberFormat("ja-JP", {
                    notation: "compact",
                    compactDisplay: "short",
                  }).format(value);
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value, payload) => {
                      const data = payload?.[0]?.payload;
                      return data?.clientName || value;
                    }}
                    formatter={(value) => [
                      new Intl.NumberFormat("ja-JP", {
                        style: "currency",
                        currency: "JPY",
                      }).format(Number(value)),
                      "売上額",
                    ]}
                    indicator="dot"
                  />
                }
              />
              <Bar
                dataKey="amount"
                fill="var(--color-amount)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
