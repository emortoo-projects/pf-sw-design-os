"use client";

import { Badge } from "@/components/ui/badge";

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
  index?: number;
}

export function ModuleCard({ module, installed, onClick, index = 0 }: ModuleCardProps) {
  return (
    <div
      className="rounded-lg border border-[#1A1A1A] bg-[#111111] p-4 cursor-pointer transition-colors duration-150 hover:bg-white/[0.03]"
      onClick={onClick}
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="h-9 w-9 rounded-md bg-white/[0.06] flex items-center justify-center text-[13px] font-semibold text-white/50 shrink-0">
          {module.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-white/90 truncate">
            {module.name}
          </p>
          <p className="text-[11px] text-white/30">v{module.version}</p>
        </div>
        {installed && <Badge className="text-white/60">Installed</Badge>}
      </div>
      <p className="text-[13px] text-white/40 line-clamp-2 mb-3">
        {module.description}
      </p>
      <Badge className="text-white/40 capitalize">
        {module.category}
      </Badge>
    </div>
  );
}
