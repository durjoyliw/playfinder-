"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin/users", label: "Users" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/audit-log", label: "Audit log" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin/login")) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#08090a] font-grotesk text-[#f2f5ef]">
      <aside className="flex w-56 flex-col border-r border-[#2a2f2a] px-4 py-6">
        <Link href="/admin/users" className="mb-8 px-3 text-sm font-semibold">
          PlayFinder Admin
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm ${
                  active
                    ? "bg-[#1a1d1a] text-[#dcef5a]"
                    : "text-[#a8ada4] hover:bg-[#121412] hover:text-[#f2f5ef]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <a
          href="/admin/logout"
          className="mt-auto rounded-md px-3 py-2 text-sm text-[#8a8f86] hover:text-[#f2f5ef]"
        >
          Logout
        </a>
      </aside>
      <main className="min-w-0 flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
