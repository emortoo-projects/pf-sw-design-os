"use client";

import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PROVIDER_MODELS: Record<string, string[]> = {
  openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
  anthropic: ["claude-opus-4-6", "claude-sonnet-4-6", "claude-haiku-4-5-20251001"],
  google: ["gemini-pro", "gemini-pro-vision"],
};

export default function AIConfigurationPage() {
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(
    null
  );
  const [apiKey, setApiKey] = useState("");
  const [defaultModel, setDefaultModel] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState("");

  // Get user's orgs
  const orgsQuery = trpc.organizations.list.useQuery({});
  const currentOrgId = orgsQuery.data?.data?.[0]?.id || "";

  // Fetch providers
  const providersQuery = trpc.aiProviders.list.useQuery();
  const providers = providersQuery.data?.data ?? [];

  // Fetch configurations
  const configsQuery = trpc.aiConfigurations.list.useQuery(
    { organizationId: currentOrgId },
    { enabled: !!currentOrgId }
  );
  const configsData = configsQuery.data?.data;

  // Map provider IDs to configs
  const configByProvider = useMemo(() => {
    const configs = configsData ?? [];
    const map = new Map<
      string,
      {
        id: string;
        providerId: string;
        defaultModel: string | null;
        isEnabled: boolean;
        providerName: string;
        providerSlug: string;
      }
    >();
    for (const c of configs) {
      map.set(c.providerId, c);
    }
    return map;
  }, [configsData]);

  const configurations = configsData ?? [];

  const selectedProvider = providers.find((p) => p.id === selectedProviderId);
  const existingConfig = selectedProviderId
    ? configByProvider.get(selectedProviderId)
    : undefined;

  const createMutation = trpc.aiConfigurations.create.useMutation({
    onSuccess: () => {
      configsQuery.refetch();
      closeDialog();
    },
    onError: (err) => setError(err.message),
  });

  const updateMutation = trpc.aiConfigurations.update.useMutation({
    onSuccess: () => {
      configsQuery.refetch();
      closeDialog();
    },
    onError: (err) => setError(err.message),
  });

  const toggleMutation = trpc.aiConfigurations.update.useMutation({
    onSuccess: () => configsQuery.refetch(),
  });

  function openDialog(providerId: string) {
    const config = configByProvider.get(providerId);
    setSelectedProviderId(providerId);
    setApiKey("");
    setDefaultModel(config?.defaultModel ?? "");
    setShowKey(false);
    setError("");
  }

  function closeDialog() {
    setSelectedProviderId(null);
    setApiKey("");
    setDefaultModel("");
    setError("");
  }

  function handleSave() {
    if (!selectedProviderId || !currentOrgId) return;

    if (existingConfig) {
      updateMutation.mutate({
        organizationId: currentOrgId,
        configurationId: existingConfig.id,
        ...(apiKey ? { apiKey } : {}),
        defaultModel: defaultModel || null,
      });
    } else {
      if (!apiKey) {
        setError("API key is required");
        return;
      }
      createMutation.mutate({
        organizationId: currentOrgId,
        providerId: selectedProviderId,
        apiKey,
        defaultModel: defaultModel || undefined,
      });
    }
  }

  function handleToggle(configId: string, enabled: boolean) {
    toggleMutation.mutate({
      organizationId: currentOrgId,
      configurationId: configId,
      isEnabled: enabled,
    });
  }

  const isPending = createMutation.isPending || updateMutation.isPending;
  const providerModels = selectedProvider
    ? PROVIDER_MODELS[selectedProvider.slug] ?? []
    : [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-heading font-bold">AI Configuration</h1>
          <p className="text-sm text-muted-foreground">
            Manage AI provider API keys, models, and usage limits
          </p>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {!currentOrgId ? (
          <p className="text-muted-foreground">
            No organization found. Create one to configure AI providers.
          </p>
        ) : (
          <>
            {/* Provider list */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {providers.map((provider) => {
                const config = configByProvider.get(provider.id);
                const configured = !!config;
                const enabled = config?.isEnabled ?? false;

                return (
                  <Card
                    key={provider.id}
                    className="cursor-pointer transition-shadow hover:shadow-md"
                    onClick={() => openDialog(provider.id)}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-sm font-bold">
                          {provider.name.charAt(0)}
                        </div>
                        <div>
                          <CardTitle className="text-sm">
                            {provider.name}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {provider.slug}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        {configured ? (
                          <>
                            <Badge
                              variant={enabled ? "default" : "secondary"}
                            >
                              {enabled ? "Enabled" : "Disabled"}
                            </Badge>
                            {config?.defaultModel && (
                              <Badge variant="outline" className="text-xs">
                                {config.defaultModel}
                              </Badge>
                            )}
                          </>
                        ) : (
                          <Badge variant="outline">Not configured</Badge>
                        )}
                      </div>
                      {configured && (
                        <div className="mt-3 flex items-center gap-2">
                          <Switch
                            checked={enabled}
                            onCheckedChange={(checked) => {
                              if (config) {
                                handleToggle(config.id, checked);
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="text-xs text-muted-foreground">
                            {enabled ? "Active" : "Inactive"}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {providers.length === 0 && !providersQuery.isLoading && (
              <p className="text-muted-foreground">
                No AI providers available
              </p>
            )}

            {/* Usage summary */}
            <Separator />
            <div>
              <h2 className="text-lg font-medium mb-4">
                Configured Providers
              </h2>
              {configurations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No providers configured yet. Click a provider above to add
                  your API key.
                </p>
              ) : (
                <div className="space-y-2">
                  {configurations.map((config) => (
                    <div
                      key={config.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {config.providerName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Model: {config.defaultModel ?? "Default"}
                        </p>
                      </div>
                      <Badge
                        variant={config.isEnabled ? "default" : "secondary"}
                      >
                        {config.isEnabled ? "Active" : "Disabled"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Configuration dialog */}
      <Dialog
        open={!!selectedProviderId}
        onOpenChange={(v) => !v && closeDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {existingConfig ? "Update" : "Configure"}{" "}
              {selectedProvider?.name ?? "Provider"}
            </DialogTitle>
            <DialogDescription>
              {existingConfig
                ? "Update your API key or model settings"
                : "Enter your API key to enable this provider"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="api-key"
                  type={showKey ? "text" : "password"}
                  placeholder={
                    existingConfig
                      ? "Leave blank to keep current key"
                      : "Enter API key"
                  }
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? "Hide" : "Show"}
                </Button>
              </div>
            </div>

            {providerModels.length > 0 && (
              <div className="space-y-2">
                <Label>Default Model</Label>
                <Select value={defaultModel} onValueChange={setDefaultModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {providerModels.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {error && <p className="text-sm text-error-500">{error}</p>}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isPending}>
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
