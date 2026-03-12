"use client";

import { Cloud, CloudOff, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSync } from "@/hooks/use-sync";

export function SyncIndicator() {
  const { status } = useSync();

  if (status === "offline") {
    return (
      <Badge tone="warning" className="gap-1">
        <CloudOff className="h-3.5 w-3.5" />
        Offline
      </Badge>
    );
  }

  if (status === "syncing") {
    return (
      <Badge tone="secondary" className="gap-1">
        <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
        Syncing
      </Badge>
    );
  }

  return (
    <Badge tone="success" className="gap-1">
      <Cloud className="h-3.5 w-3.5" />
      Synced
    </Badge>
  );
}
