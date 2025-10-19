import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

    // 指定された日付の現場一覧を取得（工務店名、現場名、備考、作業内容のみ）
    const sites = await prisma.site.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        cancelled: false, // キャンセルされていない現場のみ
      },
      select: {
        id: true,
        name: true,
        workContent: true,
        notes: true,
        client: {
          select: {
            name: true, // 工務店名
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return NextResponse.json(sites);
  } catch (error) {
    console.error("現場一覧取得エラー:", error);
    return NextResponse.json(
      { error: "現場一覧の取得に失敗しました" },
      { status: 500 }
    );
  }
}
