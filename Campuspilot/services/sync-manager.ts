import { LAST_SYNC_STORAGE_KEY } from "@/lib/constants";
import { isClient } from "@/lib/utils";
import { clearSyncQueue, getQueuedSyncItems, updateQueueError } from "@/services/local-store";
import { db } from "@/db/indexed-db";
import { localTableMap } from "@/services/table-map";

export type SyncState = "offline" | "syncing" | "synced";

export async function pushLocalChanges(accessToken: string) {
  const items = await getQueuedSyncItems();
  if (!items.length) return { pushed: 0 };

  const response = await fetch("/api/sync/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({ items })
  });

  if (!response.ok) {
    const message = `Push failed with ${response.status}`;
    await Promise.all(items.map((item) => updateQueueError(item.id, message)));
    throw new Error(message);
  }

  await clearSyncQueue(items.map((item) => item.id));
  setLastSyncIso(new Date().toISOString());
  return { pushed: items.length };
}

export async function pullRemoteChanges(accessToken: string) {
  const response = await fetch("/api/sync/pull", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({ since: getLastSyncIso() })
  });

  if (!response.ok) {
    throw new Error(`Pull failed with ${response.status}`);
  }

  const data = (await response.json()) as Record<string, Record<string, unknown>[]>;

  await db.transaction("rw", Object.values(localTableMap), async () => {
    for (const [entity, rows] of Object.entries(data)) {
      const table = localTableMap[entity as keyof typeof localTableMap] as any;
      if (!table || !Array.isArray(rows) || !rows.length) continue;
      await table.bulkPut(rows);
    }
  });

  setLastSyncIso(new Date().toISOString());
  return data;
}

export function getLastSyncIso() {
  if (!isClient()) return null;
  return window.localStorage.getItem(LAST_SYNC_STORAGE_KEY);
}

export function setLastSyncIso(value: string) {
  if (isClient()) {
    window.localStorage.setItem(LAST_SYNC_STORAGE_KEY, value);
  }
}