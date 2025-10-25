import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "すべてのフィールドを入力してください" },
        { status: 400 }
      );
    }

    // シングルユーザー制限: 既にユーザーが存在するかチェック
    const userCount = await prisma.user.count();
    if (userCount >= 1) {
      return NextResponse.json(
        { message: "アカウントは既に作成済みです。ログインしてください。" },
        { status: 403 }
      );
    }

    // 既存ユーザーのチェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "このメールアドレスは既に使用されています" },
        { status: 400 }
      );
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 12);

    // ユーザーを作成
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { message: "ユーザーが正常に作成されました" },
      { status: 201 }
    );
  } catch (error) {
    console.error("サインアップエラー:", error);
    return NextResponse.json(
      { message: "ユーザー作成に失敗しました" },
      { status: 500 }
    );
  }
}
