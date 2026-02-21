"use client";

interface Budget {
  id: string;
  name: string;
  limit: string;
  currentSpend: string;
  period: string;
}

interface DashboardBudgetWidgetProps {
  budgets: Budget[];
  loading?: boolean;
  onManageBudgets: () => void;
}

export function DashboardBudgetWidget({ budgets, loading, onManageBudgets }: DashboardBudgetWidgetProps) {
  if (loading) {
    return (
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-neutral-900">Budget Overview</h3>
        <div className="mt-4 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded bg-neutral-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">Budget Overview</h3>
        <button
          onClick={onManageBudgets}
          className="text-sm font-medium text-primary-600 hover:text-primary-800"
        >
          Manage
        </button>
      </div>
      <div className="mt-4 space-y-4">
        {budgets.length === 0 ? (
          <p className="text-sm text-neutral-500">No budgets configured</p>
        ) : (
          budgets.map((budget) => {
            const limit = parseFloat(budget.limit);
            const spent = parseFloat(budget.currentSpend);
            const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
            const isWarning = percent > 80;

            return (
              <div key={budget.id}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-neutral-700">{budget.name}</span>
                  <span className="text-neutral-500">
                    ${spent.toFixed(2)} / ${limit.toFixed(2)}
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-full rounded-full bg-neutral-200">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isWarning ? "bg-error-500" : "bg-primary-500"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
