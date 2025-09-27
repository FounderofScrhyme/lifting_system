import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // すべての現場を取得
    const sites = await prisma.site.findMany({
      select: {
        id: true,
        name: true,
        date: true,
        client: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json({
      count: sites.length,
      sites: sites,
    });
  } catch (error) {
    console.error("Error fetching all sites:", error);
    return NextResponse.json(
      { error: "Failed to fetch sites" },
      { status: 500 }
    );
  }
}
