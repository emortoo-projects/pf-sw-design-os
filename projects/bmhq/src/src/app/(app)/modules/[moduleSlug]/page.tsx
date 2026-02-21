"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";

export default function ModuleWorkspacePage() {
  const params = useParams<{ moduleSlug: string }>();
  const slug = params.moduleSlug;

  const orgsQuery = trpc.organizations.list.useQuery({});
  const currentOrgId = orgsQuery.data?.data?.[0]?.id || "";

  const installedQuery = trpc.installedModules.list.useQuery(
    { organizationId: currentOrgId },
    { enabled: !!currentOrgId }
  );

  const installedModule = useMemo(() => {
    const modules = installedQuery.data?.data ?? [];
    return modules.find((m) => m.moduleSlug === slug) ?? null;
  }, [installedQuery.data?.data, slug]);

  const moduleQuery = trpc.modules.getById.useQuery(
    { moduleId: installedModule?.moduleId ?? "" },
    { enabled: !!installedModule?.moduleId }
  );
  const moduleDetail = moduleQuery.data;

  const toggleMutation = trpc.installedModules.update.useMutation({
    onSuccess: () => installedQuery.refetch(),
  });

  const isLoading =
    orgsQuery.isLoading || installedQuery.isLoading || moduleQuery.isLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[13px] text-white/40">Loading module...</p>
      </div>
    );
  }

  if (!installedModule) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <p className="text-[13px] text-white/40">
            Module &ldquo;{slug}&rdquo; is not installed.
          </p>
          <Link href="/modules">
            <Button variant="outline">Browse Modules</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up" style={{ animationFillMode: "both" }}>
      {/* Module info bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/modules"
            className="text-[13px] text-white/40 hover:text-white/60 transition-colors duration-150"
          >
            &larr; Modules
          </Link>
          <div className="h-4 w-px bg-[#1A1A1A]" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-white/[0.06] flex items-center justify-center text-[11px] font-semibold text-white/50">
              {(installedModule.moduleName ?? slug).charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[13px] font-semibold text-white/90">
                {installedModule.moduleName ?? slug}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-white/30">
                <span>v{installedModule.version}</span>
                {moduleDetail?.category && (
                  <>
                    <span>&middot;</span>
                    <span className="capitalize">{moduleDetail.category}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            checked={installedModule.isEnabled}
            onCheckedChange={(checked) =>
              toggleMutation.mutate({
                organizationId: currentOrgId,
                installedModuleId: installedModule.id,
                isEnabled: checked,
              })
            }
          />
          <Badge
            className={installedModule.isEnabled ? "text-white/60" : "text-white/30"}
          >
            {installedModule.isEnabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
      </div>

      {moduleDetail?.description && (
        <p className="text-[13px] text-white/40 mb-4 max-w-2xl">
          {moduleDetail.description}
        </p>
      )}

      {/* Module workspace */}
      {installedModule.isEnabled ? (
        <div className="rounded-lg border border-[#1A1A1A] bg-[#111111] min-h-[400px] flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="h-12 w-12 rounded-md bg-white/[0.06] flex items-center justify-center text-[18px] font-semibold text-white/30 mx-auto">
              {(installedModule.moduleName ?? slug).charAt(0).toUpperCase()}
            </div>
            <p className="text-[13px] font-medium text-white/50">
              {installedModule.moduleName ?? slug} Workspace
            </p>
            <p className="text-[11px] text-white/30">
              Module content will be rendered here
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-[#1A1A1A] bg-[#111111] min-h-[400px] flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-[13px] text-white/40">
              This module is currently disabled.
            </p>
            <Button
              onClick={() =>
                toggleMutation.mutate({
                  organizationId: currentOrgId,
                  installedModuleId: installedModule.id,
                  isEnabled: true,
                })
              }
              disabled={toggleMutation.isPending}
            >
              Enable Module
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
