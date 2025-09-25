"use server";

import prisma from "@/lib/prisma";
import * as z from "zod";
import { RegisterSchema } from "@/schemas";
import bcrypt from "bcryptjs";

export const register = async (values: any) => {
  const validatedFields = RegisterSchema.safeParse(values);
  if (!validatedFields.success) {
    return {
      error: "入力内容が正しくありません",
    };
  }

  const { name, email, password } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);
  const existingUser = await prisma.user.findUnique({
    where: { email: email },
  });

  if (existingUser) {
    return {
      error: "このメールアドレスはすでに使用されています",
    };
  }
  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });
  return {
    success: "アカウント登録が完了しました",
  };
};
