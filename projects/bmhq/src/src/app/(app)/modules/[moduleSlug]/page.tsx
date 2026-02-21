"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";

export default function ModuleWorkspacePage() {
  const params = useParams<{ moduleSlug: string }>();
  const slug = params.moduleSlug;

  // Get user's org
  const orgsQuery = trpc.organizations.list.useQuery({});
  const currentOrgId = orgsQuery.data?.data?.[0]?.id || "";

  // Fetch installed modules to find the one matching this slug
  const installedQuery = trpc.installedModules.list.useQuery(
    { organizationId: currentOrgId },
    { enabled: !!currentOrgId }
  );

  const installedModule = useMemo(() => {
    const modules = installedQuery.data?.data ?? [];
    return modules.find((m) => m.moduleSlug === slug) ?? null;
  }, [installedQuery.data?.data, slug]);

  // Fetch full module details if we have the moduleId
  const moduleQuery = trpc.modules.getById.useQuery(
    { moduleId: installedModule?.moduleId ?? "" },
    { enabled: !!installedModule?.moduleId }
  );
  const moduleDetail = moduleQuery.data;

  // Toggle enabled/disabled
  const toggleMutation = trpc.installedModules.update.useMutation({
    onSuccess: () => installedQuery.refetch(),
  });

  const isLoading =
    orgsQuery.isLoading || installedQuery.isLoading || moduleQuery.isLoading;

  if (!currentOrgId && !orgsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">
          No organization found. Create one to access modules.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading module...</p>
      </div>
    );
  }

  if (!installedModule) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
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
    <div className="min-h-screen bg-background">
      {/* Module Header */}
      <header className="border-b">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/modules"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              &larr; Modules
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-sm font-bold">
                {(installedModule.moduleName ?? slug).charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-heading font-bold">
                  {installedModule.moduleName ?? slug}
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>v{installedModule.version}</span>
                  {moduleDetail?.category && (
                    <>
                      <span>&middot;</span>
                      <span className="capitalize">
                        {moduleDetail.category}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
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
                variant={installedModule.isEnabled ? "default" : "secondary"}
              >
                {installedModule.isEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Module Content */}
      <main className="p-6">
        {moduleDetail?.description && (
          <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
            {moduleDetail.description}
          </p>
        )}

        {installedModule.isEnabled ? (
          <Card className="min-h-[400px] flex items-center justify-center">
            <CardContent className="text-center space-y-2">
              <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center text-2xl font-bold mx-auto">
                {(installedModule.moduleName ?? slug).charAt(0).toUpperCase()}
              </div>
              <p className="text-sm font-medium">
                {installedModule.moduleName ?? slug} Workspace
              </p>
              <p className="text-xs text-muted-foreground">
                Module content will be rendered here
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="min-h-[400px] flex items-center justify-center">
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
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
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
