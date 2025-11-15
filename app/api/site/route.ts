import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - 現場一覧取得（日付フィルター・ページネーション・月単位取得対応）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate"); // 月単位取得の開始日
    const endDate = searchParams.get("endDate"); // 月単位取得の終了日
    const all = searchParams.get("all"); // 全件取得フラグ（非推奨）

    // 検索条件を構築
    const where: any = {};

    if (startDate && endDate) {
      // 月単位取得の場合（カレンダー用）
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      where.date = {
        gte: start,
        lte: end,
      };
    } else if (date) {
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

    // 最適化されたselectクエリ（必要なフィールドのみ取得）
    const selectFields = {
      id: true,
      name: true,
      clientId: true,
      date: true,
      startTime: true,
      siteType: true,
      managerName: true,
      managerPhone: true,
      postalCode: true,
      address: true,
      googleMapUrl: true,
      cancelled: true,
      workContent: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      client: {
        select: {
          id: true,
          name: true,
        },
      },
      assignments: {
        select: {
          id: true,
          date: true,
          siteId: true,
          staffId: true,
          timeSlot: true,
          staff: {
            select: {
              id: true,
              name: true,
              employmentType: true,
            },
          },
        },
      },
      externalAssignments: {
        select: {
          id: true,
          date: true,
          siteId: true,
          externalStaffName: true,
          externalStaffCompany: true,
          externalStaffNotes: true,
          timeSlot: true,
        },
      },
    };

    // 月単位取得または全件取得の場合（カレンダー用）
    if ((startDate && endDate) || all === "true") {
      const sites = await prisma.site.findMany({
        where,
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
        select: selectFields,
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
        select: selectFields,
      }),
      prisma.site.count({ where }),
    ]);

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
