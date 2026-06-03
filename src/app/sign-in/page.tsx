import Link from "next/link";
import { Brand } from "@/components/brand";
import { SignInForm } from "./sign-in-form";
import { SignInMarketing } from "./sign-in-marketing";

export const metadata = {
  title: "Sign in — Silkworm",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string; error?: string }>;
}) {
  const params = await searchParams;
  const returnTo = typeof params.returnTo === "string" ? params.returnTo : undefined;

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left — form column */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <Brand />
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignInForm returnTo={returnTo} />
          </div>
        </div>
      </div>

      {/* Right — marketing column */}
      <div className="bg-surface-2 relative hidden lg:block">
        <SignInMarketing />
      </div>
    </div>
  );
}
