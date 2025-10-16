"use server";

import { auth } from "@/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function signUpAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
    },
  });

  redirect("/dashboard");
}

export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });

  redirect("/dashboard");
}

export async function signOutAction() {
  try {
    // 最小限のヘッダーでsignOutを実行
    await auth.api.signOut({
      headers: new Headers(),
    });
  } catch (error) {
    console.error("Sign out error:", error);
  }

  redirect("/");
}
