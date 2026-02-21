"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AIUsage {
  totalTokens: number;
  totalCost: number;
  totalRequests: number;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function AIUsageWidget({ usage }: { usage: AIUsage }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">AI Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Total Requests
            </span>
            <span className="text-sm font-medium">
              {formatNumber(usage.totalRequests)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Tokens Used</span>
            <span className="text-sm font-medium">
              {formatNumber(usage.totalTokens)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Estimated Cost
            </span>
            <span className="text-sm font-medium">
              ${usage.totalCost.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
