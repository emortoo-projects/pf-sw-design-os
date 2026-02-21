"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SECTIONS = [
  { id: "organization", label: "Organization" },
  { id: "members", label: "Members" },
  { id: "billing", label: "Billing" },
  { id: "preferences", label: "Preferences" },
];

export default function SettingsPage() {
  const [section, setSection] = useState("organization");

  // Org data
  const orgsQuery = trpc.organizations.list.useQuery({});
  const currentOrg = orgsQuery.data?.data?.[0];
  const currentOrgId = currentOrg?.id || "";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-heading font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your organization, members, billing, and preferences
          </p>
        </div>
      </header>

      <div className="flex">
        <aside className="w-48 border-r p-4 space-y-1 shrink-0">
          {SECTIONS.map((s) => (
            <Button
              key={s.id}
              variant={section === s.id ? "secondary" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setSection(s.id)}
            >
              {s.label}
            </Button>
          ))}
        </aside>

        <main className="flex-1 p-6">
          {!currentOrgId ? (
            <p className="text-muted-foreground">
              No organization found. Create one to access settings.
            </p>
          ) : (
            <>
              {section === "organization" && (
                <OrganizationSection orgId={currentOrgId} orgName={currentOrg?.name ?? ""} />
              )}
              {section === "members" && (
                <MembersSection orgId={currentOrgId} />
              )}
              {section === "billing" && (
                <BillingSection orgId={currentOrgId} />
              )}
              {section === "preferences" && <PreferencesSection />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function OrganizationSection({ orgId, orgName }: { orgId: string; orgName: string }) {
  const [name, setName] = useState(orgName);
  const [error, setError] = useState("");

  const updateMutation = trpc.organizations.update.useMutation({
    onError: (err) => setError(err.message),
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-medium">Organization Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your organization details
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">Organization Name</Label>
            <Input
              id="org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-error-500">{error}</p>}
          <Button
            disabled={updateMutation.isPending || name === orgName}
            onClick={() => {
              setError("");
              updateMutation.mutate({
                organizationId: orgId,
                name,
              });
            }}
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <Card className="border-error-200">
        <CardHeader>
          <CardTitle className="text-base text-error-600">
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions for your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" size="sm">
            Delete Organization
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function MembersSection({ orgId }: { orgId: string }) {
  const membersQuery = trpc.organizationMembers.list.useQuery({
    organizationId: orgId,
  });
  const members = membersQuery.data?.data ?? [];

  const updateRoleMutation = trpc.organizationMembers.updateRole.useMutation({
    onSuccess: () => membersQuery.refetch(),
  });

  const removeMutation = trpc.organizationMembers.remove.useMutation({
    onSuccess: () => membersQuery.refetch(),
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Members</h2>
          <p className="text-sm text-muted-foreground">
            Manage your team members and their roles
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {members.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No members found</p>
          ) : (
            <div className="divide-y">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between px-6 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                      {(member.userName ?? "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.userEmail}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.role === "owner" ? (
                      <Badge>Owner</Badge>
                    ) : (
                      <>
                        <Select
                          value={member.role}
                          onValueChange={(role) =>
                            updateRoleMutation.mutate({
                              organizationId: orgId,
                              memberId: member.id,
                              role: role as "admin" | "member" | "viewer" | "owner",
                            })
                          }
                        >
                          <SelectTrigger className="w-[100px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-error-500 text-xs"
                          onClick={() =>
                            removeMutation.mutate({
                              organizationId: orgId,
                              memberId: member.id,
                            })
                          }
                        >
                          Remove
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function BillingSection({ orgId }: { orgId: string }) {
  const plansQuery = trpc.billingPlans.list.useQuery();
  const plans = plansQuery.data?.data ?? [];

  const subQuery = trpc.subscriptions.get.useQuery(
    { organizationId: orgId },
    { enabled: !!orgId }
  );
  const subscription = subQuery.data;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-lg font-medium">Billing</h2>
        <p className="text-sm text-muted-foreground">
          Manage your subscription and billing
        </p>
      </div>

      {subscription ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {subscription.planName ?? "Unknown Plan"}
              </span>
              <Badge
                variant={
                  subscription.status === "active" ? "default" : "secondary"
                }
              >
                {subscription.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Billing interval: {subscription.billingInterval}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-muted-foreground">
              No active subscription
            </p>
          </CardContent>
        </Card>
      )}

      <div>
        <h3 className="text-sm font-medium mb-3">Available Plans</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={
                subscription?.planId === plan.id
                  ? "border-brand-500"
                  : ""
              }
            >
              <CardHeader>
                <CardTitle className="text-sm">{plan.name}</CardTitle>
                <CardDescription className="text-xs">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold">
                  ${Number(plan.priceMonthly ?? 0) / 100}
                  <span className="text-xs font-normal text-muted-foreground">
                    /mo
                  </span>
                </p>
                {subscription?.planId === plan.id && (
                  <Badge className="mt-2" variant="secondary">
                    Current
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function PreferencesSection() {
  const [theme, setTheme] = useState("system");

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-medium">Preferences</h2>
        <p className="text-sm text-muted-foreground">
          Customize your experience
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="flex gap-2">
              {["light", "dark", "system"].map((t) => (
                <Button
                  key={t}
                  variant={theme === t ? "default" : "outline"}
                  size="sm"
                  className="capitalize"
                  onClick={() => setTheme(t)}
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
