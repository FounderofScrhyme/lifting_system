import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    // 指定日の自社スタッフの割り当てを取得
    const staffAssignments = await prisma.staffAssignment.findMany({
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

    // 指定日の応援スタッフの割り当てを取得
    const externalAssignments = await prisma.externalStaffAssignment.findMany({
      where: {
        date: new Date(date),
      },
      include: {
        site: {
          select: {
            id: true,
            name: true,
            siteType: true,
          },
        },
      },
    });

    // 応援スタッフの割り当てを自社スタッフの割り当てと同じ形式に変換
    const convertedExternalAssignments = externalAssignments.map(
      (assignment) => {
        // externalStaffNotesから人数を抽出（例: "3名の応援スタッフ"）
        let count = 1; // デフォルト値

        if (assignment.externalStaffNotes) {
          const countMatch = assignment.externalStaffNotes.match(/(\d+)名/);
          if (countMatch) {
            count = parseInt(countMatch[1]);
          }
        }

        // externalStaffNameからも人数を抽出を試行（例: "○○会社 (3名)"）
        if (count === 1 && assignment.externalStaffName) {
          const nameCountMatch =
            assignment.externalStaffName.match(/\((\d+)名\)/);
          if (nameCountMatch) {
            count = parseInt(nameCountMatch[1]);
          }
        }

        return {
          id: `external_${assignment.id}`,
          date: assignment.date,
          siteId: assignment.siteId,
          staffId: `support_${assignment.id}`, // 応援スタッフ用のID
          timeSlot: assignment.timeSlot,
          staff: {
            id: `support_${assignment.id}`,
            name: assignment.externalStaffName,
            employmentType: "SUPPORT",
            count: count,
          },
          site: assignment.site,
        };
      }
    );

    // 自社スタッフと応援スタッフの割り当てを結合
    const allAssignments = [
      ...staffAssignments,
      ...convertedExternalAssignments,
    ];

    return NextResponse.json({
      data: allAssignments,
    });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}
