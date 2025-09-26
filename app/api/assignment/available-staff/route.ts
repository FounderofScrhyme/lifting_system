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

    return NextResponse.json({
      data: availableStaff,
    });
  } catch (error) {
    console.error("Error fetching available staff:", error);
    return NextResponse.json(
      { error: "Failed to fetch available staff" },
      { status: 500 }
    );
  }
}
