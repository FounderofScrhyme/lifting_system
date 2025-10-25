import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const userCount = await prisma.user.count();

    return NextResponse.json({
      exists: userCount > 0,
      count: userCount,
    });
  } catch (error) {
    console.error("ユーザー存在チェックエラー:", error);
    return NextResponse.json(
      { error: "ユーザー存在チェックに失敗しました" },
      { status: 500 }
    );
  }
}
