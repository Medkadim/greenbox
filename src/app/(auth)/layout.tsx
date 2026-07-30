import Link from "next/link";
import { Leaf } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-muted/30 flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
        <Leaf className="text-primary size-6" />
        GreenBox
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
