"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-xs font-bold shrink-0">
          {module.moduleName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{module.moduleName}</p>
          <p className="text-xs text-muted-foreground">v{module.version}</p>
        </div>
      </div>
      <Badge variant={module.isEnabled ? "default" : "secondary"}>
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
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Installed Modules</CardTitle>
      </CardHeader>
      <CardContent>
        {modules.length === 0 ? (
          <p className="text-sm text-muted-foreground">No modules installed</p>
        ) : (
          <div className="divide-y">
            {modules.map((mod) => (
              <ModuleLink key={mod.id} module={mod} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
