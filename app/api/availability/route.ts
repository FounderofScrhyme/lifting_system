import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - 勤怠データ取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get("staffId");

    if (!staffId) {
      return NextResponse.json(
        { error: "Staff ID is required" },
        { status: 400 }
      );
    }

    const availability = await prisma.staffAvailability.findMany({
      where: {
        staffId: staffId,
      },
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json({
      data: availability,
    });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}

// POST - 勤怠データ作成・更新
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { staffId, availability } = body;

    if (!staffId || !availability || !Array.isArray(availability)) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // 既存の勤怠データを削除
    await prisma.staffAvailability.deleteMany({
      where: {
        staffId: staffId,
      },
    });

    // 新しい勤怠データを作成
    const availabilityData = availability.map((item: any) => ({
      staffId: staffId,
      date: new Date(item.date),
      type: item.type,
    }));

    const createdAvailability = await prisma.staffAvailability.createMany({
      data: availabilityData,
    });

    return NextResponse.json({
      message: "Availability updated successfully",
      count: createdAvailability.count,
    });
  } catch (error) {
    console.error("Error updating availability:", error);
    return NextResponse.json(
      { error: "Failed to update availability" },
      { status: 500 }
    );
  }
}
