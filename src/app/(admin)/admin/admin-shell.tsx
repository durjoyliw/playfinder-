"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Command centre", exact: true },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/appeals", label: "Appeals", badgeKey: "appeals" as const },
  { href: "/admin/feature-flags", label: "Feature flags" },
  { href: "/admin/audit-log", label: "Audit log" },
];

export function AdminShell({
  children,
  pendingAppeals,
}: {
  children: React.ReactNode;
  pendingAppeals: number;
}) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin/login")) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#08090a] font-grotesk text-[#f2f5ef]">
      <aside className="flex w-56 flex-col border-r border-[#2a2f2a] px-4 py-6">
        <Link href="/admin" className="mb-8 px-3 text-sm font-semibold">
          PlayFinder Admin
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const badge =
              item.badgeKey === "appeals" && pendingAppeals > 0
                ? pendingAppeals
                : null;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                  active
                    ? "bg-[#1a1d1a] text-[#dcef5a]"
                    : "text-[#a8ada4] hover:bg-[#121412] hover:text-[#f2f5ef]"
                }`}
              >
                <span>{item.label}</span>
                {badge !== null && (
                  <span className="ml-auto rounded-full bg-[#dcef5a] px-1.5 text-[10px] font-semibold text-[#08090a]">
                    {badge}
                  </span>
                )}
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
