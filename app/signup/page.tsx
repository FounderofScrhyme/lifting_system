"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  // 既存ユーザーの存在チェック
  useEffect(() => {
    const checkExistingUser = async () => {
      try {
        const response = await fetch("/api/auth/check-user-exists");
        if (response.ok) {
          const data = await response.json();
          setUserExists(data.exists);
        }
      } catch (error) {
        console.error("ユーザー存在チェックエラー:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkExistingUser();
  }, []);

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

  // 既存ユーザーがいる場合は登録フォームを非表示
  if (isChecking) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">確認中...</p>
        </div>
      </div>
    );
  }

  if (userExists) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1 className="text-2xl font-bold">アカウント登録</h1>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">アカウントは既に作成済みです。</p>
          <p className="text-sm text-gray-500 mb-6">
            ログインしてシステムをご利用ください。
          </p>
          <a
            href="/signin"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            ログインページへ
          </a>
        </div>
      </div>
    );
  }

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
