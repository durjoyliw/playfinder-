import { requireAdmin } from "@/lib/admin/auth";
import prisma from "@/lib/prisma";

/** Every waitlist email as CSV, for importing into an email tool. */
export async function GET() {
  await requireAdmin();

  const entries = await prisma.waitlistEntry.findMany({
    include: { user: { select: { username: true } } },
    orderBy: { createdAt: "asc" },
  });

  // Quote every field; double any quotes; neutralise spreadsheet formulas.
  const cell = (value: string) => {
    const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const rows = [
    ["email", "username", "source", "joined_at"],
    ...entries.map((e) => [
      e.email,
      e.user?.username ?? "",
      e.source,
      e.createdAt.toISOString(),
    ]),
  ];
  const csv = rows.map((r) => r.map(cell).join(",")).join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="playfinder-waitlist.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
