import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { signOutAction } from "./actions/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

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
        <a href="/api/auth/signout">
          <Button variant="outline">ログアウト</Button>
        </a>
        <p className="text-sm text-gray-500 mt-2">
          複数端末から同時にログイン可能です
        </p>
      </div>
    </div>
  );
}
