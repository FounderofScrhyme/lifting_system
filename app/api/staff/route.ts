import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - スタッフ一覧取得（ページネーション対応）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const skip = (page - 1) * limit;

    const [staff, total] = await Promise.all([
      prisma.staff.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "asc" },
      }),
      prisma.staff.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: staff,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff" },
      { status: 500 }
    );
  }
}

// POST - スタッフ作成
export async function POST(request: NextRequest) {
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

    const staff = await prisma.staff.create({
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

    return NextResponse.json(staff, { status: 201 });
  } catch (error) {
    console.error("Error creating staff:", error);
    return NextResponse.json(
      { error: "Failed to create staff" },
      { status: 500 }
    );
  }
}
