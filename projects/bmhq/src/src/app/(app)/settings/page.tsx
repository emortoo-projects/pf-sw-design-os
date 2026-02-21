"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
];

export default function SettingsPage() {
  const [section, setSection] = useState("organization");

  const orgsQuery = trpc.organizations.list.useQuery({});
  const currentOrg = orgsQuery.data?.data?.[0];
  const currentOrgId = currentOrg?.id || "";

  return (
    <div className="animate-fade-up" style={{ animationFillMode: "both" }}>
      <div className="flex">
        <aside className="w-40 pr-4 border-r border-[#1A1A1A] space-y-0.5 shrink-0">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              className={`w-full text-left px-3 h-8 rounded-md text-[13px] transition-colors duration-150 ${
                section === s.id
                  ? "bg-white/[0.06] text-white/90"
                  : "text-white/40 hover:text-white/60 hover:bg-white/[0.03]"
              }`}
              onClick={() => setSection(s.id)}
            >
              {s.label}
            </button>
          ))}
        </aside>

        <main className="flex-1 pl-6">
          {!currentOrgId && !orgsQuery.isLoading ? (
            <CreateOrganizationForm />
          ) : (
            <>
              {section === "organization" && (
                <OrganizationSection orgId={currentOrgId} orgName={currentOrg?.name ?? ""} />
              )}
              {section === "members" && currentOrgId && (
                <MembersSection orgId={currentOrgId} />
              )}
              {section === "billing" && currentOrgId && (
                <BillingSection orgId={currentOrgId} />
              )}
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
        <h2 className="text-[13px] font-semibold text-white/90">Organization Settings</h2>
        <p className="text-[11px] text-white/40 mt-0.5">
          Manage your organization details
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[13px]">General</CardTitle>
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
          {error && <p className="text-[13px] text-white/40">{error}</p>}
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

      <div className="h-px bg-[#1A1A1A]" />

      <Card>
        <CardHeader>
          <CardTitle className="text-[13px] text-white/50">
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
      <div>
        <h2 className="text-[13px] font-semibold text-white/90">Members</h2>
        <p className="text-[11px] text-white/40 mt-0.5">
          Manage your team members and their roles
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {members.length === 0 ? (
            <p className="p-4 text-[13px] text-white/30">No members found</p>
          ) : (
            <div>
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors duration-150"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-md bg-white/[0.06] flex items-center justify-center text-[10px] font-semibold text-white/50">
                      {(member.userName ?? "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-white/70">
                        {member.userName}
                      </p>
                      <p className="text-[11px] text-white/30">
                        {member.userEmail}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.role === "owner" ? (
                      <Badge className="text-white/60">Owner</Badge>
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
                          <SelectTrigger className="w-[100px] h-7 text-[11px]">
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

function CreateOrganizationForm() {
  const router = useRouter();
  const [orgName, setOrgName] = useState("BMHQ");
  const [error, setError] = useState("");

  const createMutation = trpc.organizations.create.useMutation({
    onSuccess: () => {
      router.refresh();
      window.location.reload();
    },
    onError: (err) => setError(err.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    createMutation.mutate({ name: orgName, slug });
  }

  return (
    <div className="space-y-6 max-w-md">
      <div>
        <h2 className="text-[13px] font-semibold text-white/90">
          Create Organization
        </h2>
        <p className="text-[11px] text-white/40 mt-0.5">
          Create your first organization to get started.
        </p>
      </div>

      <Card>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-org-name">Organization Name</Label>
              <Input
                id="new-org-name"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="My Organization"
                required
                minLength={1}
              />
            </div>
            {error && (
              <p className="text-[13px] text-white/40">{error}</p>
            )}
            <Button
              type="submit"
              disabled={createMutation.isPending || !orgName.trim()}
            >
              {createMutation.isPending
                ? "Creating..."
                : "Create Organization"}
            </Button>
          </form>
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
        <h2 className="text-[13px] font-semibold text-white/90">Billing</h2>
        <p className="text-[11px] text-white/40 mt-0.5">
          Manage your subscription and billing
        </p>
      </div>

      {subscription ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-[13px]">Current Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-white/70">
                {subscription.planName ?? "Unknown Plan"}
              </span>
              <Badge
                className={
                  subscription.status === "active"
                    ? "text-white/60"
                    : "text-white/30"
                }
              >
                {subscription.status}
              </Badge>
            </div>
            <p className="text-[11px] text-white/30">
              Billing interval: {subscription.billingInterval}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-4">
            <p className="text-[13px] text-white/30">
              No active subscription
            </p>
          </CardContent>
        </Card>
      )}

      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-3">
          Available Plans
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle className="text-[13px]">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[18px] font-semibold font-mono text-white/90">
                  ${Number(plan.priceMonthly ?? 0) / 100}
                  <span className="text-[11px] font-normal text-white/30">
                    /mo
                  </span>
                </p>
                {subscription?.planId === plan.id && (
                  <Badge className="mt-2 text-white/50">Current</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
