"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function signUpAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!email || !password || !name) {
    throw new Error("すべてのフィールドを入力してください");
  }

  // パスワードをハッシュ化
  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    // ユーザーを作成
    await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    // 作成後、サインインページにリダイレクト
    redirect("/signin");
  } catch (error) {
    console.error("サインアップエラー:", error);
    throw new Error("ユーザー作成に失敗しました");
  }
}

export async function signInAction(formData: FormData) {
  // NextAuth.jsのサインインはクライアントサイドで処理
  redirect("/api/auth/signin/credentials");
}

export async function signOutAction() {
  // NextAuth.jsのサインアウトはクライアントサイドで処理
  redirect("/api/auth/signout");
}
