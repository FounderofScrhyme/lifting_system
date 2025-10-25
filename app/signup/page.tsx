"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // ユーザーを作成
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      if (response.ok) {
        router.push("/signin");
      } else {
        const error = await response.json();
        alert(error.message || "ユーザー作成に失敗しました");
      }
    } catch (error) {
      console.error("サインアップエラー:", error);
      alert("ユーザー作成に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold">アカウント登録</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-64">
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ユーザー名"
          required
        />
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="メールアドレス"
          required
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="パスワード"
          required
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "登録中..." : "登録"}
        </Button>
      </form>
      <p className="text-sm text-gray-600">
        既にアカウントをお持ちの方は{" "}
        <a href="/signin" className="text-blue-600 hover:underline">
          こちらからログイン
        </a>
      </p>
    </div>
  );
}
