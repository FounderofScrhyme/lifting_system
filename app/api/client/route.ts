import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - 取引先一覧取得（ページネーション対応）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "asc" },
      }),
      prisma.client.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: clients,
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
    return NextResponse.json(
      { error: "取引先一覧の取得に失敗しました" },
      { status: 500 }
    );
  }
}

// POST - 取引先作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      phone,
      postalCode,
      address,
      contactName,
      contactPhone,
      notes,
    } = body;

    const client = await prisma.client.create({
      data: {
        name,
        phone,
        postalCode: postalCode || null,
        address: address || null,
        contactName: contactName || null,
        contactPhone: contactPhone || null,
        notes: notes || null,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "取引先作成に失敗しました" },
      { status: 500 }
    );
  }
}
