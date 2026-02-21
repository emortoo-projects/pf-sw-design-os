"use client";

import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModuleCard } from "@/components/marketplace/module-card";
import { ModuleDetailDialog } from "@/components/marketplace/module-detail-dialog";

const CATEGORIES = [
  "All",
  "development",
  "marketing",
  "operations",
  "analytics",
];

interface Module {
  id: string;
  name: string;
  slug: string;
  description: string;
  version: string;
  category: string;
  iconUrl: string | null;
}

export default function ModuleMarketplacePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  // Get user's orgs for install functionality
  const orgsQuery = trpc.organizations.list.useQuery({});
  const organizations = orgsQuery.data?.data ?? [];
  const currentOrgId = organizations[0]?.id || "";

  // Fetch published modules
  const modulesQuery = trpc.modules.list.useQuery({
    category: category !== "All" ? category : undefined,
  });
  const modulesData = modulesQuery.data?.data;

  // Fetch installed modules for the org
  const installedQuery = trpc.installedModules.list.useQuery(
    { organizationId: currentOrgId },
    { enabled: !!currentOrgId }
  );
  const installedModuleIds = useMemo(() => {
    const set = new Set<string>();
    for (const im of installedQuery.data?.data ?? []) {
      set.add(im.moduleId);
    }
    return set;
  }, [installedQuery.data]);

  // Client-side search filter
  const filteredModules = useMemo(() => {
    const allModules = (modulesData ?? []) as Module[];
    if (!search) return allModules;
    const q = search.toLowerCase();
    return allModules.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.slug.toLowerCase().includes(q)
    );
  }, [modulesData, search]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-heading font-bold">
            Module Marketplace
          </h1>
          <p className="text-sm text-muted-foreground">
            Browse and install modules for your organization
          </p>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar filters */}
        <aside className="w-56 border-r p-4 space-y-4 shrink-0">
          <Input
            placeholder="Search modules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Categories
            </p>
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={category === cat ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start text-sm capitalize"
                onClick={() => setCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </aside>

        {/* Module grid */}
        <main className="flex-1 p-6">
          {modulesQuery.isLoading ? (
            <p className="text-muted-foreground">Loading modules...</p>
          ) : modulesQuery.isError ? (
            <p className="text-sm text-error-500">Failed to load modules</p>
          ) : filteredModules.length === 0 ? (
            <p className="text-muted-foreground">
              {search
                ? "No modules match your search"
                : "No modules available"}
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredModules.map((mod) => (
                <ModuleCard
                  key={mod.id}
                  module={mod}
                  installed={installedModuleIds.has(mod.id)}
                  onClick={() => setSelectedModule(mod)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <ModuleDetailDialog
        open={!!selectedModule}
        onClose={() => setSelectedModule(null)}
        module={selectedModule}
        organizationId={currentOrgId}
        installedModuleIds={installedModuleIds}
        onInstalled={() => {
          installedQuery.refetch();
        }}
      />
    </div>
  );
}
