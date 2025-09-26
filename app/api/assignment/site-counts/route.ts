import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    if (!year || !month) {
      return NextResponse.json(
        { error: "Year and month are required" },
        { status: 400 }
      );
    }

    // 指定月の現場件数を日付ごとに取得
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    const siteCounts = await prisma.site.groupBy({
      by: ["date"],
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        cancelled: false,
      },
      _count: {
        id: true,
      },
    });

    // 日付をキーとしたオブジェクトに変換
    const countsByDate = siteCounts.reduce((acc, item) => {
      const dateStr = item.date.toISOString().split("T")[0];
      acc[dateStr] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      data: countsByDate,
    });
  } catch (error) {
    console.error("Error fetching site counts:", error);
    return NextResponse.json(
      { error: "Failed to fetch site counts" },
      { status: 500 }
    );
  }
}
