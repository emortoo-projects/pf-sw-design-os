import React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

function createIcon(name: string, path: React.ReactNode) {
  const Icon = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
    <svg
      ref={ref}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {path}
    </svg>
  ));
  Icon.displayName = name;
  return Icon;
}

export const Icons = {
  dashboard: createIcon(
    "DashboardIcon",
    <>
      <rect x="2" y="2" width="5" height="5" rx="1" />
      <rect x="9" y="2" width="5" height="5" rx="1" />
      <rect x="2" y="9" width="5" height="5" rx="1" />
      <rect x="9" y="9" width="5" height="5" rx="1" />
    </>
  ),
  modules: createIcon(
    "ModulesIcon",
    <>
      <rect x="2" y="2" width="12" height="5" rx="1" />
      <rect x="2" y="9" width="5" height="5" rx="1" />
      <rect x="9" y="9" width="5" height="5" rx="1" />
    </>
  ),
  aiConfig: createIcon(
    "AIConfigIcon",
    <>
      <circle cx="8" cy="8" r="3" />
      <path d="M8 2v2" />
      <path d="M8 12v2" />
      <path d="M2 8h2" />
      <path d="M12 8h2" />
    </>
  ),
  activity: createIcon(
    "ActivityIcon",
    <path d="M2 8h3l2-4 2 8 2-4h3" />
  ),
  pipeline: createIcon(
    "PipelineIcon",
    <>
      <circle cx="4" cy="4" r="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 4h4a2 2 0 0 1 2 2v4" />
    </>
  ),
  settings: createIcon(
    "SettingsIcon",
    <>
      <circle cx="8" cy="8" r="2.5" />
      <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" />
    </>
  ),
  notifications: createIcon(
    "NotificationsIcon",
    <>
      <path d="M4 6a4 4 0 0 1 8 0c0 3 1.5 4.5 2 5H2c.5-.5 2-2 2-5Z" />
      <path d="M6.5 13a1.5 1.5 0 0 0 3 0" />
    </>
  ),
  users: createIcon(
    "UsersIcon",
    <>
      <circle cx="6" cy="5" r="2.5" />
      <path d="M2 13a4 4 0 0 1 8 0" />
      <circle cx="12" cy="5" r="1.5" />
      <path d="M11 13a3 3 0 0 1 3-3" />
    </>
  ),
  search: createIcon(
    "SearchIcon",
    <>
      <circle cx="7" cy="7" r="4" />
      <path d="M10 10l3.5 3.5" />
    </>
  ),
  chevronDown: createIcon(
    "ChevronDownIcon",
    <path d="M4 6l4 4 4-4" />
  ),
  close: createIcon(
    "CloseIcon",
    <>
      <path d="M4 4l8 8" />
      <path d="M12 4l-8 8" />
    </>
  ),
  check: createIcon(
    "CheckIcon",
    <path d="M3 8l3.5 3.5L13 5" />
  ),
  module: createIcon(
    "ModuleIcon",
    <>
      <rect x="3" y="3" width="10" height="10" rx="2" />
      <path d="M8 6v4M6 8h4" />
    </>
  ),
  // Module-specific icons
  softwareDesign: createIcon(
    "SoftwareDesignIcon",
    <>
      <rect x="2" y="3" width="12" height="9" rx="1.5" />
      <path d="M5 7l2 2 4-4" />
      <path d="M5 14h6" />
    </>
  ),
  missionControl: createIcon(
    "MissionControlIcon",
    <>
      <circle cx="8" cy="8" r="5.5" />
      <path d="M8 4v4l3 2" />
      <circle cx="8" cy="8" r="1" />
    </>
  ),
  agentOS: createIcon(
    "AgentOSIcon",
    <>
      <circle cx="8" cy="5" r="3" />
      <path d="M4 13c0-2.2 1.8-4 4-4s4 1.8 4 4" />
      <path d="M11 3l2-1M5 3L3 2" />
    </>
  ),
  businessOS: createIcon(
    "BusinessOSIcon",
    <>
      <rect x="2" y="4" width="12" height="9" rx="1.5" />
      <path d="M6 4V3a2 2 0 0 1 4 0v1" />
      <path d="M2 8h12" />
    </>
  ),
  marketingOS: createIcon(
    "MarketingOSIcon",
    <>
      <path d="M3 13V7l5-4 5 4v6" />
      <path d="M7 13V9h2v4" />
      <path d="M11 5l2 1v3" />
    </>
  ),
  financeOS: createIcon(
    "FinanceOSIcon",
    <>
      <path d="M2 12l3-4 3 2 3-5 3 3" />
      <path d="M2 14h12" />
      <circle cx="14" cy="5" r="1" />
    </>
  ),
  learningOS: createIcon(
    "LearningOSIcon",
    <>
      <path d="M2 5l6-3 6 3-6 3Z" />
      <path d="M4 6.5v4c0 1 2 2.5 4 2.5s4-1.5 4-2.5v-4" />
      <path d="M14 5v5" />
    </>
  ),
  lifeOS: createIcon(
    "LifeOSIcon",
    <>
      <path d="M8 14s-5-3.5-5-7a3 3 0 0 1 5-2.2A3 3 0 0 1 13 7c0 3.5-5 7-5 7Z" />
    </>
  ),
};
