import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // 総売上額を計算
    const totalRevenue = await prisma.sale.aggregate({
      _sum: {
        amount: true,
      },
    });

    // 最初に売上を登録した月を取得
    const firstSale = await prisma.sale.findFirst({
      orderBy: {
        month: "asc",
      },
      select: {
        month: true,
      },
    });

    // レギュラースタッフの人数を取得
    const regularStaffCount = await prisma.staff.count({
      where: {
        employmentType: "REGULAR",
        hidden: false,
      },
    });

    // スポットスタッフの人数を取得
    const spotStaffCount = await prisma.staff.count({
      where: {
        employmentType: "SPOT",
        hidden: false,
      },
    });

    // 登録済み取引先件数を取得
    const clientCount = await prisma.client.count();

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.amount || 0,
      firstSaleMonth: firstSale?.month || null,
      regularStaffCount,
      spotStaffCount,
      clientCount,
    });
  } catch (error) {
    console.error("ダッシュボード統計データ取得エラー:", error);
    return NextResponse.json(
      { error: "統計データの取得に失敗しました" },
      { status: 500 }
    );
  }
}

