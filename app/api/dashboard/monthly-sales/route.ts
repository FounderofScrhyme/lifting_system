import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // 月ごとの売上データを取得
    const monthlySales = await prisma.sale.groupBy({
      by: ["month"],
      _sum: {
        amount: true,
      },
      orderBy: {
        month: "asc",
      },
    });

    // チャート用のデータ形式に変換
    const chartData = monthlySales.map((sale) => ({
      month: sale.month,
      amount: sale._sum.amount || 0,
    }));

    return NextResponse.json(chartData);
  } catch (error) {
    console.error("月次売上データ取得エラー:", error);
    return NextResponse.json(
      { error: "月次売上データの取得に失敗しました" },
      { status: 500 }
    );
  }
}

