import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - 現場名のサジェスト取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");

    if (!name || name.length < 2) {
      return NextResponse.json({ data: [] });
    }

    // 現場名で部分一致検索（同名の現場を全て取得）
    const sites = await prisma.site.findMany({
      where: {
        name: {
          contains: name,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        date: true,
        startTime: true,
        siteType: true,
        managerName: true,
        managerPhone: true,
        postalCode: true,
        address: true,
        googleMapUrl: true,
        cancelled: true,
        createdAt: true,
        updatedAt: true,
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ date: "desc" }, { startTime: "asc" }],
    });

    return NextResponse.json({ data: sites });
  } catch (error) {
    console.error("Error fetching site suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch site suggestions" },
      { status: 500 }
    );
  }
}
