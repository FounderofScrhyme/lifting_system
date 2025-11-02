import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    // 検索条件を構築
    const whereCondition: any = {
      deletedAt: null, // ソフトデリートされていないスタッフのみ
    };

    // 検索クエリがある場合は名前で検索
    if (search.trim()) {
      whereCondition.name = {
        contains: search.trim(),
        mode: "insensitive", // 大文字小文字を区別しない
      };
    }

    // 総数を取得（検索条件を含む）
    const total = await prisma.staff.count({
      where: whereCondition,
    });

    // スタッフデータを取得（検索条件を含む）
    const staff = await prisma.staff.findMany({
      where: whereCondition,
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
        createdAt: "desc", // 最近登録された順（降順）
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
