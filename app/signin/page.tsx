import { Input } from "@/components/ui/input";
import { signInAction } from "../actions/auth";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold">ログイン</h1>
      <form action={signInAction} className="flex flex-col gap-2 w-64">
        <Input
          type="email"
          name="email"
          placeholder="example@email.com"
          required
        />
        <Input
          type="password"
          name="password"
          placeholder="********"
          required
        />
        <Button type="submit">ログイン</Button>
      </form>
    </div>
  );
}
