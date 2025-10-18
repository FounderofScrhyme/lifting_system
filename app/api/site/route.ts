import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - 現場一覧取得（日付フィルター・ページネーション対応）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    const date = searchParams.get("date");
    const all = searchParams.get("all"); // 全件取得フラグ

    // 検索条件を構築
    const where: any = {};

    if (date) {
      // 指定された日付の現場を取得
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    // 全件取得の場合（カレンダー用）
    if (all === "true") {
      const sites = await prisma.site.findMany({
        where,
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
        include: {
          client: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return NextResponse.json({
        data: sites,
      });
    }

    // ページネーション対応の場合
    const [sites, total] = await Promise.all([
      prisma.site.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
        include: {
          client: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.site.count({ where }),
    ]);

    console.log(
      "Found sites:",
      sites.length,
      "with IDs:",
      sites.map((s) => s.id)
    );

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: sites,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching sites:", error);
    return NextResponse.json(
      { error: "Failed to fetch sites" },
      { status: 500 }
    );
  }
}

// POST - 現場作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      clientId,
      date,
      startTime,
      siteType,
      managerName,
      managerPhone,
      postalCode,
      address,
      googleMapUrl,
      workContent,
      notes,
    } = body;

    const site = await prisma.site.create({
      data: {
        name,
        clientId,
        date: new Date(date),
        startTime,
        siteType,
        managerName: managerName || null,
        managerPhone: managerPhone || null,
        postalCode: postalCode || null,
        address,
        googleMapUrl: googleMapUrl || null,
        workContent: workContent || null,
        notes: notes || null,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(site, { status: 201 });
  } catch (error) {
    console.error("Error creating site:", error);
    return NextResponse.json(
      { error: "Failed to create site" },
      { status: 500 }
    );
  }
}
