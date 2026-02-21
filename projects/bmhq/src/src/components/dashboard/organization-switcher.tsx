"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Organization {
  id: string;
  name: string;
  slug: string;
}

export function OrganizationSwitcher({
  organizations,
  currentOrgId,
  onChange,
}: {
  organizations: Organization[];
  currentOrgId: string;
  onChange: (id: string) => void;
}) {
  if (organizations.length === 0) return null;

  return (
    <Select value={currentOrgId} onValueChange={onChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select organization" />
      </SelectTrigger>
      <SelectContent>
        {organizations.map((org) => (
          <SelectItem key={org.id} value={org.id}>
            {org.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
