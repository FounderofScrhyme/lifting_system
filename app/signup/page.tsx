import { Input } from "@/components/ui/input";
import { signUpAction } from "../actions/auth";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold">アカウント登録</h1>
      <form action={signUpAction} className="flex flex-col gap-2 w-64">
        <Input type="text" name="name" placeholder="Lifting" required />
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
        <Button type="submit">登録</Button>
      </form>
    </div>
  );
}
