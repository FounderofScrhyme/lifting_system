import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - 売上一覧取得（ページネーション・検索対応）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const skip = (page - 1) * limit;

    // 検索条件を構築
    const where: any = {};

    if (searchParams.get("clientId")) {
      where.clientId = searchParams.get("clientId");
    }

    // 年と月の検索条件を組み合わせる
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    if (year && month) {
      // 年と月の両方が指定されている場合
      where.month = `${year}-${month}`;
    } else if (year) {
      // 年のみが指定されている場合
      where.month = {
        startsWith: year,
      };
    } else if (month) {
      // 月のみが指定されている場合（年は問わない）
      where.month = {
        endsWith: `-${month}`,
      };
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          client: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.sale.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: sales,
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
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}

// POST - 売上作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, month, amount, notes } = body;

    // 同じ取引先・同じ月の売上が既に存在するかチェック
    const existingSale = await prisma.sale.findFirst({
      where: {
        clientId,
        month,
      },
    });

    if (existingSale) {
      return NextResponse.json(
        { error: "この取引先のこの月の売上は既に登録されています" },
        { status: 400 }
      );
    }

    const sale = await prisma.sale.create({
      data: {
        clientId,
        month,
        amount: parseInt(amount),
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

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error("Error creating sale:", error);
    return NextResponse.json(
      { error: "Failed to create sale" },
      { status: 500 }
    );
  }
}
