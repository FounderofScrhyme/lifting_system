import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - 特定の現場取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const site = await prisma.site.findUnique({
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

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    return NextResponse.json(site);
  } catch (error) {
    console.error("Error fetching site:", error);
    return NextResponse.json(
      { error: "Failed to fetch site" },
      { status: 500 }
    );
  }
}

// PUT - 現場更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      notes,
    } = body;

    const site = await prisma.site.update({
      where: { id: params.id },
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

    return NextResponse.json(site);
  } catch (error) {
    console.error("Error updating site:", error);
    return NextResponse.json(
      { error: "Failed to update site" },
      { status: 500 }
    );
  }
}

// PATCH - 現場の部分更新（キャンセル状態の切り替えなど）
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { cancelled } = body;

    const site = await prisma.site.update({
      where: { id: params.id },
      data: {
        cancelled: cancelled !== undefined ? cancelled : undefined,
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

    return NextResponse.json(site);
  } catch (error) {
    console.error("Error updating site:", error);
    return NextResponse.json(
      { error: "Failed to update site" },
      { status: 500 }
    );
  }
}

// DELETE - 現場削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.site.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Site deleted successfully" });
  } catch (error) {
    console.error("Error deleting site:", error);
    return NextResponse.json(
      { error: "Failed to delete site" },
      { status: 500 }
    );
  }
}
