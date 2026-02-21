"use client";

import { useMemo, useState } from "react";
import { Icons } from "@/components/icons";

type ModuleStatus = "active" | "ready" | "planned";

interface BMHQModule {
  id: string;
  name: string;
  category: string;
  status: ModuleStatus;
  description: string;
  detail?: string;
  icon: keyof typeof Icons;
}

const MODULES: BMHQModule[] = [
  {
    id: "software-design-os",
    name: "Software Design OS",
    category: "development",
    status: "active",
    description: "Design & ship products",
    detail: "51 tasks done",
    icon: "softwareDesign",
  },
  {
    id: "mission-control",
    name: "Mission Control",
    category: "operations",
    status: "active",
    description: "Monitor all operations",
    detail: "41 tasks done",
    icon: "missionControl",
  },
  {
    id: "agent-os",
    name: "Agent OS",
    category: "development",
    status: "active",
    description: "Orchestrate AI agents",
    detail: "53 tasks done",
    icon: "agentOS",
  },
  {
    id: "business-os",
    name: "Business OS",
    category: "operations",
    status: "ready",
    description: "CRM, invoicing, projects",
    detail: "SDP ready",
    icon: "businessOS",
  },
  {
    id: "marketing-os",
    name: "Marketing OS",
    category: "marketing",
    status: "ready",
    description: "Content, social, email",
    detail: "SDP ready",
    icon: "marketingOS",
  },
  {
    id: "finance-os",
    name: "Finance OS",
    category: "operations",
    status: "planned",
    description: "Bookkeeping, tax, cash flow",
    icon: "financeOS",
  },
  {
    id: "learning-os",
    name: "Learning OS",
    category: "development",
    status: "planned",
    description: "Courses, notes, retention",
    icon: "learningOS",
  },
  {
    id: "life-os",
    name: "Life OS",
    category: "analytics",
    status: "planned",
    description: "Habits, journal, wellness",
    icon: "lifeOS",
  },
];

const CATEGORIES = ["All", "Development", "Marketing", "Operations", "Analytics"];

const STATUS_CONFIG: Record<ModuleStatus, { label: string; opacity: string; action: string }> = {
  active: { label: "Active", opacity: "text-white/70", action: "Open" },
  ready: { label: "Ready", opacity: "text-white/50", action: "Build" },
  planned: { label: "Planned", opacity: "text-white/30", action: "Design SDP" },
};

export default function ModuleMarketplacePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filteredModules = useMemo(() => {
    let modules = MODULES;

    if (category !== "All") {
      const cat = category.toLowerCase();
      modules = modules.filter((m) => m.category === cat);
    }

    if (search) {
      const q = search.toLowerCase();
      modules = modules.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)
      );
    }

    return modules;
  }, [category, search]);

  return (
    <div className="animate-fade-up" style={{ animationFillMode: "both" }}>
      {/* Top bar: filter tabs + search */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`px-3 h-7 rounded-md text-[13px] transition-colors duration-150 ${
                category === cat
                  ? "bg-white/[0.06] text-white/90"
                  : "text-white/40 hover:text-white/60 hover:bg-white/[0.03]"
              }`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 h-7 px-2.5 rounded-md border border-[#1A1A1A] bg-[#111111]">
          <Icons.search className="w-3.5 h-3.5 text-white/30" />
          <input
            type="text"
            placeholder="Search modules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-[13px] text-white/90 placeholder:text-white/30 outline-none w-40"
          />
        </div>
      </div>

      {/* Module grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredModules.map((mod, i) => {
          const Icon = Icons[mod.icon];
          const config = STATUS_CONFIG[mod.status];

          return (
            <div
              key={mod.id}
              className="rounded-[10px] border border-[#1A1A1A] bg-[#111111] p-4 flex flex-col transition-colors duration-150 hover:bg-white/[0.03]"
              style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
            >
              {/* Header: icon + status */}
              <div className="flex items-start justify-between mb-3">
                <div className="h-9 w-9 rounded-md bg-white/[0.06] flex items-center justify-center">
                  <Icon className="w-[18px] h-[18px] text-white/50" />
                </div>
                <span
                  className={`text-[11px] font-medium border border-white/10 rounded-sm px-1.5 py-0.5 ${config.opacity}`}
                >
                  {config.label}
                </span>
              </div>

              {/* Name + description */}
              <p className="text-[13px] font-medium text-white/90 mb-0.5">
                {mod.name}
              </p>
              <p className="text-[12px] text-white/40 mb-3">
                {mod.description}
              </p>

              {/* Footer: detail + action */}
              <div className="mt-auto flex items-center justify-between">
                {mod.detail ? (
                  <span className="text-[11px] text-white/30">
                    {mod.detail}
                  </span>
                ) : (
                  <span />
                )}
                <button
                  className={`text-[11px] font-medium px-2.5 h-6 rounded-md transition-colors duration-150 ${
                    mod.status === "active"
                      ? "bg-white text-black hover:bg-white/90"
                      : "bg-white/[0.06] text-white/50 hover:bg-white/[0.1] hover:text-white/70"
                  }`}
                >
                  {config.action}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredModules.length === 0 && (
        <div className="flex items-center justify-center h-40">
          <p className="text-[13px] text-white/30">
            No modules match your search
          </p>
        </div>
      )}
    </div>
  );
}
