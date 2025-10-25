import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // 総数を取得
    const total = await prisma.staff.count({
      where: {
        hidden: false,
      },
    });

    // スタッフデータを取得
    const staff = await prisma.staff.findMany({
      where: {
        hidden: false, // 非表示でないスタッフのみ取得
      },
      select: {
        id: true,
        name: true,
        birthDate: true,
        phone: true,
        email: true,
        postalCode: true,
        address: true,
        emergencyName: true,
        emergencyPhone: true,
        bloodType: true,
        bloodPressure: true,
        lastCheckupDate: true,
        employmentType: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        name: "asc",
      },
      skip,
      take: limit,
    });

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
    console.error("スタッフデータ取得エラー:", error);
    return NextResponse.json(
      { error: "スタッフデータの取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    // 必須フィールドのバリデーション
    if (
      !name ||
      !birthDate ||
      !phone ||
      !emergencyName ||
      !emergencyPhone ||
      !employmentType
    ) {
      return NextResponse.json(
        { error: "必須フィールドが不足しています" },
        { status: 400 }
      );
    }

    // スタッフを作成
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
        hidden: false,
      },
    });

    return NextResponse.json(staff, { status: 201 });
  } catch (error) {
    console.error("スタッフ作成エラー:", error);
    return NextResponse.json(
      { error: "スタッフの作成に失敗しました" },
      { status: 500 }
    );
  }
}
