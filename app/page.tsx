import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import Link from "next/link";

export default function Home() {
  return (
    <Card className="w-full md:w-1/2 mx-auto">
      <CardHeader>
        <CardTitle>LIFTING業務システム</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p>
          ログイン、またはサインアップして画面左のメニューバーから機能を選択してください。
        </p>
      </CardContent>
    </Card>
  );
}
