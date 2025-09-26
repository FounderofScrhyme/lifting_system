import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, assignments } = body;

    if (!date || !assignments || !Array.isArray(assignments)) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // 既存の割り当てを削除
    await prisma.staffAssignment.deleteMany({
      where: {
        date: new Date(date),
      },
    });

    // 新しい割り当てを作成
    if (assignments.length > 0) {
      const assignmentData = assignments.map((assignment: any) => ({
        date: new Date(date),
        siteId: assignment.siteId,
        staffId: assignment.staffId,
        timeSlot: assignment.timeSlot,
      }));

      await prisma.staffAssignment.createMany({
        data: assignmentData,
      });
    }

    return NextResponse.json({
      message: "Assignments confirmed successfully",
      count: assignments.length,
    });
  } catch (error) {
    console.error("Error confirming assignments:", error);
    return NextResponse.json(
      { error: "Failed to confirm assignments" },
      { status: 500 }
    );
  }
}
