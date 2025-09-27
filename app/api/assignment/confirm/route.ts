import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // データベース接続テスト
    await prisma.$connect();
    console.log("Database connected successfully");

    const body = await request.json();
    console.log(
      "Assignment confirm request body:",
      JSON.stringify(body, null, 2)
    );
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
    let assignmentData: any[] = [];
    let createdCount = 0;

    if (assignments.length > 0) {
      assignments.forEach((assignment: any) => {
        console.log("Processing assignment:", assignment);
        if (assignment.staffIds && Array.isArray(assignment.staffIds)) {
          assignment.staffIds.forEach((staffId: string) => {
            assignmentData.push({
              date: new Date(date),
              siteId: assignment.siteId,
              staffId: staffId,
              timeSlot: assignment.timeSlot,
            });
          });
        } else {
          console.log("Invalid staffIds for assignment:", assignment);
        }
      });

      console.log("Final assignment data:", assignmentData);

      if (assignmentData.length > 0) {
        await prisma.staffAssignment.createMany({
          data: assignmentData,
        });
        createdCount = assignmentData.length;
        console.log("Successfully created assignments:", createdCount);
      } else {
        console.log("No valid assignment data to create");
      }
    }

    return NextResponse.json({
      message: "Assignments confirmed successfully",
      count: createdCount,
    });
  } catch (error) {
    console.error("Error confirming assignments:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : "Unknown",
    });
    return NextResponse.json(
      {
        error: "Failed to confirm assignments",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
