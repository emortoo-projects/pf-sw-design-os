"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CATEGORY_COLORS: Record<string, string> = {
  development: "bg-brand-100 text-brand-700",
  marketing: "bg-brand-secondary-100 text-brand-secondary-700",
  operations: "bg-success-100 text-success-700",
  analytics: "bg-warning-100 text-warning-700",
};

interface ModuleCardProps {
  module: {
    id: string;
    name: string;
    slug: string;
    description: string;
    version: string;
    category: string;
    iconUrl: string | null;
  };
  installed?: boolean;
  onClick: () => void;
}

export function ModuleCard({ module, installed, onClick }: ModuleCardProps) {
  const colorClass =
    CATEGORY_COLORS[module.category] ?? "bg-muted text-muted-foreground";

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2">
        <div
          className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${colorClass}`}
        >
          {module.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <CardTitle className="text-sm font-medium truncate">
            {module.name}
          </CardTitle>
          <p className="text-xs text-muted-foreground">v{module.version}</p>
        </div>
        {installed && <Badge variant="secondary">Installed</Badge>}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {module.description}
        </p>
        <div className="mt-2">
          <Badge variant="outline" className="text-xs">
            {module.category}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
