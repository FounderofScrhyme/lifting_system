import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // 取引先ごとの売上データを取得
    const clientSales = await prisma.sale.groupBy({
      by: ["clientId"],
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: "desc",
        },
      },
    });

    // 取引先名を取得するためにクライアント情報も取得
    const clientIds = clientSales.map((sale) => sale.clientId);
    const clients = await prisma.client.findMany({
      where: {
        id: {
          in: clientIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    // クライアント名のマップを作成
    const clientNameMap = new Map(
      clients.map((client) => [client.id, client.name])
    );

    // チャート用のデータ形式に変換
    const chartData = clientSales.map((sale) => ({
      clientId: sale.clientId,
      clientName: clientNameMap.get(sale.clientId) || "不明な取引先",
      amount: sale._sum.amount || 0,
    }));

    return NextResponse.json(chartData);
  } catch (error) {
    console.error("取引先別売上データ取得エラー:", error);
    return NextResponse.json(
      { error: "取引先別売上データの取得に失敗しました" },
      { status: 500 }
    );
  }
}

