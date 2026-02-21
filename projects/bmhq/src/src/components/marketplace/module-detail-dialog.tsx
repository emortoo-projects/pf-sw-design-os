"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

interface Module {
  id: string;
  name: string;
  slug: string;
  description: string;
  version: string;
  category: string;
  iconUrl: string | null;
}

interface ModuleDetailDialogProps {
  open: boolean;
  onClose: () => void;
  module: Module | null;
  organizationId: string;
  installedModuleIds: Set<string>;
  onInstalled: () => void;
}

export function ModuleDetailDialog({
  open,
  onClose,
  module,
  organizationId,
  installedModuleIds,
  onInstalled,
}: ModuleDetailDialogProps) {
  const depsQuery = trpc.moduleDependencies.list.useQuery(
    { moduleId: module?.id ?? "" },
    { enabled: !!module }
  );

  const installMutation = trpc.installedModules.install.useMutation({
    onSuccess: () => {
      onInstalled();
      onClose();
    },
  });

  if (!module) return null;

  const isInstalled = installedModuleIds.has(module.id);
  const dependencies = depsQuery.data?.data ?? [];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-white/[0.06] flex items-center justify-center text-[13px] font-semibold text-white/50">
              {module.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <DialogTitle>{module.name}</DialogTitle>
              <DialogDescription>
                v{module.version} &middot; {module.category}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-[13px] text-white/70">{module.description}</p>

          {dependencies.length > 0 && (
            <>
              <div className="h-px bg-[#1A1A1A]" />
              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2">
                  Dependencies
                </h4>
                <div className="space-y-1.5">
                  {dependencies.map((dep) => (
                    <div
                      key={dep.id}
                      className="flex items-center justify-between text-[13px]"
                    >
                      <span className="text-white/70">
                        {dep.dependsOnName ?? dep.dependsOnModuleId}
                      </span>
                      <div className="flex items-center gap-2">
                        {dep.minVersion && (
                          <span className="text-[11px] text-white/30">
                            &ge;{dep.minVersion}
                          </span>
                        )}
                        {dep.isOptional && (
                          <Badge className="text-white/40">Optional</Badge>
                        )}
                        <Badge
                          className={
                            installedModuleIds.has(dep.dependsOnModuleId)
                              ? "text-white/60"
                              : "text-white/30"
                          }
                        >
                          {installedModuleIds.has(dep.dependsOnModuleId)
                            ? "Installed"
                            : "Missing"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="h-px bg-[#1A1A1A]" />

          <Button
            className="w-full"
            disabled={isInstalled || installMutation.isPending}
            onClick={() => {
              if (!isInstalled) {
                installMutation.mutate({
                  organizationId,
                  moduleId: module.id,
                });
              }
            }}
          >
            {isInstalled
              ? "Already Installed"
              : installMutation.isPending
                ? "Installing..."
                : "Install Module"}
          </Button>

          {installMutation.isError && (
            <p className="text-[13px] text-white/40">
              {installMutation.error.message}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
