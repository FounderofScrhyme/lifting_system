import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("メールアドレスとパスワードを入力してください");
        }

        // Admin認証のチェック
        const adminEmail = process.env.ADMIN_EMAIL?.trim();
        const adminPassword = process.env.ADMIN_PASSWORD?.trim();
        const inputEmail = credentials.email.trim().toLowerCase();
        const inputPassword = credentials.password;

        if (adminEmail && adminPassword) {
          const normalizedAdminEmail = adminEmail.toLowerCase();
          // メールアドレスがadmin用メールアドレスと一致する場合（大文字小文字を無視）
          if (inputEmail === normalizedAdminEmail) {
            if (inputPassword === adminPassword) {
              return {
                id: "admin",
                email: adminEmail,
                name: "管理者",
                role: "admin",
              };
            }
            // adminメールアドレスだがパスワードが間違っている場合は認証失敗
            throw new Error("パスワードが正しくありません");
          }
        }

        // 一般ユーザーの認証（既存のロジック）
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          // セキュリティ上の理由から、メールアドレスの存在有無を明示しない
          throw new Error("メールアドレスまたはパスワードが正しくありません");
        }

        // パスワード検証（ハッシュ化されたパスワードと比較）
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password || ""
        );

        if (!isPasswordValid) {
          throw new Error("メールアドレスまたはパスワードが正しくありません");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: "user",
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30日間
  },
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
};
