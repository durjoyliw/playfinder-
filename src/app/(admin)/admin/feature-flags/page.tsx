import { requireAdmin } from "@/lib/admin/auth";
import {
  createFeatureFlag,
  toggleFeatureFlag,
} from "@/lib/admin/flags";
import { ensureDefaultFlags } from "@/lib/feature-flags";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feature flags",
};

export default async function AdminFeatureFlagsPage() {
  await requireAdmin();
  await ensureDefaultFlags();

  const flags = await prisma.featureFlag.findMany({
    orderBy: { key: "asc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Feature flags</h1>
        <p className="mt-1 text-sm text-[#8a8f86]">
          Toggle features without a redeploy
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#2a2f2a]">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-[#121412] text-[#8a8f86]">
            <tr>
              <th className="px-4 py-3 font-medium">Key</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Enabled</th>
              <th className="px-4 py-3 font-medium">Rollout %</th>
              <th className="px-4 py-3 font-medium">City scope</th>
              <th className="px-4 py-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {flags.map((flag) => {
              const toggle = toggleFeatureFlag.bind(null, flag.id);
              return (
                <tr key={flag.id} className="border-t border-[#2a2f2a]">
                  <td className="px-4 py-3 font-medium">{flag.key}</td>
                  <td className="px-4 py-3 text-[#c4c9bf]">
                    {flag.description ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <form action={toggle}>
                      <button
                        type="submit"
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          flag.enabled
                            ? "bg-[#dcef5a] text-[#08090a]"
                            : "border border-[#2a2f2a] text-[#8a8f86]"
                        }`}
                      >
                        {flag.enabled ? "On" : "Off"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3 text-[#c4c9bf]">
                    {flag.rolloutPercent ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-[#c4c9bf]">
                    {flag.cityScope ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-[#c4c9bf]">
                    {format(flag.updatedAt, "d MMM yyyy HH:mm")}
                    {flag.updatedBy ? ` · ${flag.updatedBy}` : ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <form
        action={createFeatureFlag}
        className="max-w-xl space-y-4 rounded-xl border border-[#2a2f2a] bg-[#121412] p-5"
      >
        <h2 className="text-sm font-semibold">Add new flag</h2>
        <label className="block space-y-1 text-sm">
          <span className="text-[#8a8f86]">Key</span>
          <input
            name="key"
            required
            placeholder="new_feature"
            className="h-10 w-full rounded-md border border-[#2a2f2a] bg-[#08090a] px-3 text-sm outline-none focus:border-[#dcef5a]"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-[#8a8f86]">Description</span>
          <input
            name="description"
            placeholder="What this flag controls"
            className="h-10 w-full rounded-md border border-[#2a2f2a] bg-[#08090a] px-3 text-sm outline-none focus:border-[#dcef5a]"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input name="enabled" type="checkbox" defaultChecked />
          Enabled
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1 text-sm">
            <span className="text-[#8a8f86]">Rollout percent (optional)</span>
            <input
              name="rolloutPercent"
              type="number"
              min={0}
              max={100}
              className="h-10 w-full rounded-md border border-[#2a2f2a] bg-[#08090a] px-3 text-sm outline-none focus:border-[#dcef5a]"
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="text-[#8a8f86]">City scope (optional)</span>
            <input
              name="cityScope"
              placeholder="Glasgow"
              className="h-10 w-full rounded-md border border-[#2a2f2a] bg-[#08090a] px-3 text-sm outline-none focus:border-[#dcef5a]"
            />
          </label>
        </div>
        <button
          type="submit"
          className="h-10 rounded-md bg-[#dcef5a] px-4 text-sm font-semibold text-[#08090a]"
        >
          Create flag
        </button>
      </form>
    </div>
  );
}
