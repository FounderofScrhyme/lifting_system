import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - 特定の現場取得（振り分け済スタッフ情報も含む）
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log("Fetching site with ID:", id);
  try {
    const site = await prisma.site.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        assignments: {
          include: {
            staff: {
              select: {
                id: true,
                name: true,
                employmentType: true,
              },
            },
          },
        },
      },
    });

    if (!site) {
      console.log("Site not found for ID:", id);
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // 振り分け済スタッフを午前・午後に分ける
    const amStaff = (site.assignments || [])
      .filter((assignment) => assignment.timeSlot === "AM")
      .map((assignment) => assignment.staff);

    const pmStaff = (site.assignments || [])
      .filter((assignment) => assignment.timeSlot === "PM")
      .map((assignment) => assignment.staff);

    const response = {
      ...site,
      assignedStaff: {
        am: amStaff,
        pm: pmStaff,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching site:", error);
    console.error("Error details:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch site",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT - 現場更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
      where: { id },
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

// PATCH - 現場ステータス更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { cancelled } = body;

    const site = await prisma.site.update({
      where: { id },
      data: {
        cancelled: cancelled,
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
    console.error("Error updating site status:", error);
    return NextResponse.json(
      { error: "Failed to update site status" },
      { status: 500 }
    );
  }
}

// DELETE - 現場削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.site.delete({
      where: { id },
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
