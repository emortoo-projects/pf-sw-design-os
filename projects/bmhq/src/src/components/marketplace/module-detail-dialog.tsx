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
import { Separator } from "@/components/ui/separator";
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
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-lg font-bold">
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
          <p className="text-sm">{module.description}</p>

          {dependencies.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-2">Dependencies</h4>
                <div className="space-y-1">
                  {dependencies.map((dep) => (
                    <div
                      key={dep.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{dep.dependsOnName ?? dep.dependsOnModuleId}</span>
                      <div className="flex items-center gap-2">
                        {dep.minVersion && (
                          <span className="text-xs text-muted-foreground">
                            &ge;{dep.minVersion}
                          </span>
                        )}
                        {dep.isOptional && (
                          <Badge variant="outline" className="text-xs">
                            Optional
                          </Badge>
                        )}
                        {installedModuleIds.has(dep.dependsOnModuleId) ? (
                          <Badge variant="secondary" className="text-xs">
                            Installed
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            Missing
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

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
            <p className="text-sm text-error-500">
              {installMutation.error.message}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
