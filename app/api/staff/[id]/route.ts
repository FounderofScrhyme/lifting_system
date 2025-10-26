import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - 特定のスタッフ取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const staff = await prisma.staff.findUnique({
      where: { id },
    });

    if (!staff) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    return NextResponse.json(staff);
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff" },
      { status: 500 }
    );
  }
}

// PUT - スタッフ更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const {
      name,
      birthDate,
      phone,
      email,
      postalCode,
      address,
      emergencyName,
      emergencyPhone,
      bloodType,
      bloodPressure,
      lastCheckupDate,
      employmentType,
      notes,
    } = body;

    const staff = await prisma.staff.update({
      where: { id },
      data: {
        name,
        birthDate: new Date(birthDate),
        phone,
        email: email || null,
        postalCode: postalCode || null,
        address: address || null,
        emergencyName,
        emergencyPhone,
        bloodType: bloodType || null,
        bloodPressure: bloodPressure || null,
        lastCheckupDate: lastCheckupDate ? new Date(lastCheckupDate) : null,
        employmentType,
        notes: notes || null,
      },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("Error updating staff:", error);
    return NextResponse.json(
      { error: "Failed to update staff" },
      { status: 500 }
    );
  }
}

// DELETE - スタッフ削除（ソフトデリート）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // まずスタッフが存在するかチェック
    const existingStaff = await prisma.staff.findUnique({
      where: { id },
    });

    if (!existingStaff) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    if (existingStaff.deletedAt) {
      return NextResponse.json(
        { error: "Staff already deleted" },
        { status: 400 }
      );
    }

    // ソフトデリート（deletedAtに現在時刻を設定）
    await prisma.staff.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ message: "Staff deleted successfully" });
  } catch (error) {
    console.error("Error deleting staff:", error);
    return NextResponse.json(
      { error: "Failed to delete staff" },
      { status: 500 }
    );
  }
}
