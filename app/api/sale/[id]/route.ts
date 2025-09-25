import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - 特定の売上取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id: params.id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    return NextResponse.json(sale);
  } catch (error) {
    console.error("Error fetching sale:", error);
    return NextResponse.json(
      { error: "Failed to fetch sale" },
      { status: 500 }
    );
  }
}

// PUT - 売上更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { clientId, month, amount, notes } = body;

    // 同じ取引先・同じ月の売上が既に存在するかチェック（自分以外）
    const existingSale = await prisma.sale.findFirst({
      where: {
        clientId,
        month,
        id: {
          not: params.id,
        },
      },
    });

    if (existingSale) {
      return NextResponse.json(
        { error: "この取引先のこの月の売上は既に登録されています" },
        { status: 400 }
      );
    }

    const sale = await prisma.sale.update({
      where: { id: params.id },
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

    return NextResponse.json(sale);
  } catch (error) {
    console.error("Error updating sale:", error);
    return NextResponse.json(
      { error: "Failed to update sale" },
      { status: 500 }
    );
  }
}

// DELETE - 売上削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.sale.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Sale deleted successfully" });
  } catch (error) {
    console.error("Error deleting sale:", error);
    return NextResponse.json(
      { error: "Failed to delete sale" },
      { status: 500 }
    );
  }
}
