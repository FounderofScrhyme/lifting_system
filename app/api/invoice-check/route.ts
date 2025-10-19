import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
    const { date, siteData } = body;

    if (!date || !siteData || !Array.isArray(siteData)) {
      return NextResponse.json(
        { error: "日付と現場データが必要です" },
        { status: 400 }
      );
    }

    const targetDate = new Date(date);

    // 既存の請求書確認データを削除（同じ日付のもの）
    await prisma.invoiceCheck.deleteMany({
      where: {
        date: {
          gte: new Date(
            targetDate.getFullYear(),
            targetDate.getMonth(),
            targetDate.getDate()
          ),
          lt: new Date(
            targetDate.getFullYear(),
            targetDate.getMonth(),
            targetDate.getDate() + 1
          ),
        },
      },
    });

    // 新しい請求書確認データを作成
    const invoiceCheckData = siteData.map((site: any) => ({
      date: targetDate,
      siteId: site.id,
      siteName: site.name,
      clientName: site.clientName,
      workContent: site.workContent || null,
      siteNotes: site.notes || null,
      additionalText: site.additionalText || null,
    }));

    const result = await prisma.invoiceCheck.createMany({
      data: invoiceCheckData,
    });

    return NextResponse.json({
      message: "請求書確認データが保存されました",
      count: result.count,
    });
  } catch (error) {
    console.error("請求書確認データ保存エラー:", error);
    console.error("エラーの詳細:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      body: body,
    });
    return NextResponse.json(
      {
        error: "請求書確認データの保存に失敗しました",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "日付パラメータが必要です" },
        { status: 400 }
      );
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // 指定された日付の請求書確認データを取得
    const invoiceChecks = await prisma.invoiceCheck.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(invoiceChecks);
  } catch (error) {
    console.error("請求書確認データ取得エラー:", error);
    return NextResponse.json(
      { error: "請求書確認データの取得に失敗しました" },
      { status: 500 }
    );
  }
}
