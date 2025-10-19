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
    const { date, assignments, supportAssignments, supportStaff } = body;

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    // 既存の割り当てを削除
    await Promise.all([
      prisma.staffAssignment.deleteMany({
        where: {
          date: new Date(date),
        },
      }),
      prisma.externalStaffAssignment.deleteMany({
        where: {
          date: new Date(date),
        },
      }),
    ]);

    // 自社スタッフの割り当てを作成
    let assignmentData: any[] = [];
    let staffCreatedCount = 0;

    if (assignments && assignments.length > 0) {
      assignments.forEach((assignment: any) => {
        console.log("Processing staff assignment:", assignment);
        if (assignment.staffIds && Array.isArray(assignment.staffIds)) {
          assignment.staffIds.forEach((staffId: string) => {
            // 応援スタッフIDは除外
            if (!staffId.startsWith("support_")) {
              assignmentData.push({
                date: new Date(date),
                siteId: assignment.siteId,
                staffId: staffId,
                timeSlot: assignment.timeSlot,
              });
            }
          });
        } else {
          console.log("Invalid staffIds for assignment:", assignment);
        }
      });

      console.log("Final staff assignment data:", assignmentData);

      if (assignmentData.length > 0) {
        await prisma.staffAssignment.createMany({
          data: assignmentData,
        });
        staffCreatedCount = assignmentData.length;
        console.log(
          "Successfully created staff assignments:",
          staffCreatedCount
        );
      } else {
        console.log("No valid staff assignment data to create");
      }
    }

    // 応援スタッフの割り当てを作成
    let externalAssignmentData: any[] = [];
    let externalCreatedCount = 0;

    if (supportAssignments && supportAssignments.length > 0) {
      supportAssignments.forEach((assignment: any) => {
        console.log("Processing support assignment:", assignment);
        if (assignment.staffIds && Array.isArray(assignment.staffIds)) {
          assignment.staffIds.forEach((staffId: string) => {
            // 応援スタッフIDのみ処理
            if (staffId.startsWith("support_")) {
              // 応援スタッフ情報を取得
              const supportStaffInfo = supportStaff.find(
                (staff: any) => staff.id === staffId
              );
              if (supportStaffInfo) {
                externalAssignmentData.push({
                  date: new Date(date),
                  siteId: assignment.siteId,
                  externalStaffName: `${supportStaffInfo.companyName} (${supportStaffInfo.count}名)`,
                  externalStaffCompany: supportStaffInfo.companyName,
                  externalStaffNotes: `${supportStaffInfo.count}名の応援スタッフ`,
                  timeSlot: assignment.timeSlot,
                });
              }
            }
          });
        }
      });

      console.log("Final external assignment data:", externalAssignmentData);

      if (externalAssignmentData.length > 0) {
        await prisma.externalStaffAssignment.createMany({
          data: externalAssignmentData,
        });
        externalCreatedCount = externalAssignmentData.length;
        console.log(
          "Successfully created external assignments:",
          externalCreatedCount
        );
      } else {
        console.log("No valid external assignment data to create");
      }
    }

    const totalCreatedCount = staffCreatedCount + externalCreatedCount;

    return NextResponse.json({
      message: "Assignments confirmed successfully",
      count: totalCreatedCount,
      staffCount: staffCreatedCount,
      externalCount: externalCreatedCount,
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
