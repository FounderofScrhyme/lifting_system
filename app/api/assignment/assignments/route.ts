import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    // 指定日の割り当てを取得
    const assignments = await prisma.staffAssignment.findMany({
      where: {
        date: new Date(date),
      },
      include: {
        staff: {
          select: {
            id: true,
            name: true,
            employmentType: true,
          },
        },
        site: {
          select: {
            id: true,
            name: true,
            siteType: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: assignments,
    });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}
