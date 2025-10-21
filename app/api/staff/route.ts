import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const staff = await prisma.staff.findMany({
      where: {
        hidden: false, // 非表示でないスタッフのみ取得
      },
      select: {
        id: true,
        name: true,
        phone: true,
        address: true,
        employmentType: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("スタッフデータ取得エラー:", error);
    return NextResponse.json(
      { error: "スタッフデータの取得に失敗しました" },
      { status: 500 }
    );
  }
}
