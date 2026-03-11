"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { getLastSyncIso, pullRemoteChanges, pushLocalChanges, type SyncState } from "@/services/sync-manager";

export function useSync() {
  const { idToken } = useAuth();
  const isOnline = useOnlineStatus();
  const [status, setStatus] = useState<SyncState>(isOnline ? "synced" : "offline");
  const [lastSync, setLastSync] = useState<string | null>(getLastSyncIso());
  const [error, setError] = useState<string | null>(null);

  const runSync = useCallback(async () => {
    if (!idToken || !isOnline) {
      setStatus(isOnline ? "synced" : "offline");
      return;
    }

    try {
      setStatus("syncing");
      await pushLocalChanges(idToken);
      await pullRemoteChanges(idToken);
      const updatedAt = new Date().toISOString();
      setLastSync(updatedAt);
      setError(null);
      setStatus("synced");
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : "Sync failed");
      setStatus(isOnline ? "synced" : "offline");
    }
  }, [idToken, isOnline]);

  useEffect(() => {
    if (!isOnline) {
      setStatus("offline");
      return;
    }
    void runSync();
    const interval = window.setInterval(() => {
      void runSync();
    }, 30000);
    return () => {
      window.clearInterval(interval);
    };
  }, [isOnline, runSync]);

  return {
    status,
    lastSync,
    error,
    isOnline,
    runSync
  };
}