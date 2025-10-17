import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { signOutAction } from "./actions/auth";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return (
      <Card className="w-full md:w-1/2 mx-auto">
        <CardHeader>
          <CardTitle>LIFTING業務システム</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p>画面左のメニューバーから機能を選択してください。</p>
        </CardContent>
        <CardFooter>
          <div className="flex gap-2">
            <Link href="/signin">
              <Button variant="outline">ログイン</Button>
            </Link>
            <Link href="/signup">
              <Button>アカウント登録</Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-4xl font-bold">LIFTING業務システム</h1>
      <div className="mt-8 text-center">
        <p className="text-md mb-4">User ID: {session.user.id}</p>
        <form action={signOutAction}>
          <Button type="submit" variant="outline">
            ログアウト
          </Button>
        </form>
      </div>
    </div>
  );
}
