"use client";

import { Badge } from "@/components/ui/badge";

interface InstalledModule {
  id: string;
  moduleId: string;
  moduleName: string;
  moduleSlug: string;
  moduleIconUrl: string | null;
  version: string;
  isEnabled: boolean;
}

function ModuleLink({ module }: { module: InstalledModule }) {
  return (
    <div className="flex items-center justify-between py-2 px-1 rounded-md hover:bg-white/[0.02] transition-colors duration-150">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-7 w-7 rounded-md bg-white/[0.06] flex items-center justify-center text-[10px] font-semibold text-white/50 shrink-0">
          {module.moduleName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-white/70 truncate">
            {module.moduleName}
          </p>
          <p className="text-[11px] text-white/30">v{module.version}</p>
        </div>
      </div>
      <Badge className={module.isEnabled ? "text-white/60" : "text-white/30"}>
        {module.isEnabled ? "Active" : "Disabled"}
      </Badge>
    </div>
  );
}

export function InstalledModulesWidget({
  modules,
}: {
  modules: InstalledModule[];
}) {
  return (
    <div className="rounded-lg border border-[#1A1A1A] bg-[#111111] p-4">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-3">
        Installed Modules
      </h3>
      {modules.length === 0 ? (
        <p className="text-[13px] text-white/30">No modules installed</p>
      ) : (
        <div className="space-y-0">
          {modules.map((mod) => (
            <ModuleLink key={mod.id} module={mod} />
          ))}
        </div>
      )}
    </div>
  );
}
