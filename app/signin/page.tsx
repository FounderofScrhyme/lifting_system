"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null); // エラーメッセージをクリア

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // NextAuthから返されたエラーメッセージを表示
        setErrorMessage(result.error);
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      setErrorMessage("ログインに失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold">ログイン</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-64">
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
            {errorMessage}
          </div>
        )}
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
          {isLoading ? "ログイン中..." : "ログイン"}
        </Button>
      </form>
      <p className="text-sm text-gray-600">
        アカウントをお持ちでない方は{" "}
        <a href="/signup" className="text-blue-600 hover:underline">
          こちらから登録
        </a>
      </p>
    </div>
  );
}
