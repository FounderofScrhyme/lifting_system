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

    // 現場名で部分一致検索（重複を除く）
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
        clientId: true,
        managerName: true,
        managerPhone: true,
        postalCode: true,
        address: true,
        googleMapUrl: true,
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      distinct: ["name"],
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
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
