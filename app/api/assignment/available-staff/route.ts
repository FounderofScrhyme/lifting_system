import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    // 指定日の出勤可能スタッフを取得
    const availableStaff = await prisma.staff.findMany({
      where: {
        OR: [
          // レギュラースタッフで休日でない場合
          {
            employmentType: "REGULAR",
            NOT: {
              availabilities: {
                some: {
                  date: new Date(date),
                  type: {
                    in: ["HOLIDAY_FULL", "HOLIDAY_AM", "HOLIDAY_PM"],
                  },
                },
              },
            },
          },
          // スポットスタッフで出勤可能日の場合
          {
            employmentType: "SPOT",
            availabilities: {
              some: {
                date: new Date(date),
                type: {
                  in: ["AVAILABLE_FULL", "AVAILABLE_AM", "AVAILABLE_PM"],
                },
              },
            },
          },
        ],
      },
      orderBy: {
        name: "asc",
      },
    });

    // 指定日の応援スタッフを取得
    const supportStaff = await prisma.externalStaffAssignment.findMany({
      where: {
        date: new Date(date),
      },
      select: {
        id: true,
        externalStaffName: true,
        externalStaffCompany: true,
        externalStaffNotes: true,
        date: true,
      },
      orderBy: {
        externalStaffCompany: "asc",
      },
    });

    // 応援スタッフを自社スタッフと同じ形式に変換
    const convertedSupportStaff = supportStaff.map((staff) => {
      // externalStaffNotesから人数を抽出（例: "3名の応援スタッフ"）
      let count = 1; // デフォルト値

      if (staff.externalStaffNotes) {
        const countMatch = staff.externalStaffNotes.match(/(\d+)名/);
        if (countMatch) {
          count = parseInt(countMatch[1]);
        }
      }

      // externalStaffNameからも人数を抽出を試行（例: "○○会社 (3名)"）
      if (count === 1 && staff.externalStaffName) {
        const nameCountMatch = staff.externalStaffName.match(/\((\d+)名\)/);
        if (nameCountMatch) {
          count = parseInt(nameCountMatch[1]);
        }
      }

      return {
        id: `support_${staff.id}`,
        name: staff.externalStaffName,
        companyName: staff.externalStaffCompany,
        count: count,
        notes: staff.externalStaffNotes,
        employmentType: "SUPPORT" as const,
        birthDate: new Date(),
        phone: "",
        emergencyName: "",
        emergencyPhone: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    return NextResponse.json({
      data: availableStaff,
      supportStaff: convertedSupportStaff,
    });
  } catch (error) {
    console.error("Error fetching available staff:", error);
    return NextResponse.json(
      { error: "Failed to fetch available staff" },
      { status: 500 }
    );
  }
}
