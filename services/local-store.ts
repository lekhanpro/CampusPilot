import { db } from "@/db/indexed-db";
import { createDefaultPreferences } from "@/db/defaults";
import { createId } from "@/lib/id";
import { nowIso } from "@/lib/time";
import { subjectSchema } from "@/lib/validation";
import type {
  Assignment,
  AttendanceRecord,
  ClassSession,
  Exam,
  Note,
  PomodoroSession,
  StudyPlan,
  Subject,
  SyncQueueItem,
  UserPreference
} from "@/types/entities";
import { localTableMap, type SyncEntityKey } from "@/services/table-map";

type EntityMap = {
  subjects: Subject;
  classSessions: ClassSession;
  assignments: Assignment;
  attendanceRecords: AttendanceRecord;
  notes: Note;
  pomodoroSessions: PomodoroSession;
  exams: Exam;
  studyPlans: StudyPlan;
  userPreferences: UserPreference;
};

function getTable<K extends SyncEntityKey>(entity: K) {
  return localTableMap[entity] as any;
}

export async function listEntities<K extends SyncEntityKey>(entity: K, userId: string): Promise<EntityMap[K][]> {
  return (await getTable(entity).where("user_id").equals(userId).toArray()).filter((item: { deleted_at?: string | null }) => !item.deleted_at) as EntityMap[K][];
}

export async function upsertEntity<K extends SyncEntityKey>(entity: K, value: EntityMap[K], queue = true) {
  await getTable(entity).put(value);
  if (queue) {
    await enqueueSync({
      id: createId("sync"),
      entity,
      operation: "upsert",
      payload: value as Record<string, unknown>,
      queued_at: nowIso(),
      attempt_count: 0,
      last_error: null
    });
  }
  return value;
}

export async function removeEntity<K extends SyncEntityKey>(entity: K, id: string) {
  const table = getTable(entity);
  const existing = await table.get(id);
  if (!existing) return;
  const deleted = { ...existing, deleted_at: nowIso(), updated_at: nowIso() };
  await table.put(deleted);
  await enqueueSync({
    id: createId("sync"),
    entity,
    operation: "delete",
    payload: deleted as Record<string, unknown>,
    queued_at: nowIso(),
    attempt_count: 0,
    last_error: null
  });
}

export async function enqueueSync(item: SyncQueueItem) {
  await db.syncQueue.put(item);
}

export async function getQueuedSyncItems() {
  return db.syncQueue.orderBy("queued_at").toArray();
}

export async function clearSyncQueue(ids: string[]) {
  await db.syncQueue.bulkDelete(ids);
}

export async function updateQueueError(id: string, error: string) {
  const item = await db.syncQueue.get(id);
  if (!item) return;
  await db.syncQueue.put({
    ...item,
    attempt_count: item.attempt_count + 1,
    last_error: error
  });
}

export async function ensurePreferences(userId: string) {
  const existing = await db.userPreferences.where("user_id").equals(userId).first();
  if (existing) return existing;
  const defaults = createDefaultPreferences(userId);
  await db.userPreferences.put(defaults);
  return defaults;
}

export async function adoptGuestData(oldUserId: string, newUserId: string) {
  if (oldUserId === newUserId) return;

  await db.transaction("rw", Object.values(localTableMap), async () => {
    for (const [entity, table] of Object.entries(localTableMap)) {
      const typedTable = table as any;
      const items = await typedTable.where("user_id").equals(oldUserId).toArray();
      if (!items.length) continue;
      const updatedAt = nowIso();
      await typedTable.bulkPut(
        items.map((item: Record<string, unknown>) => ({
          ...item,
          user_id: newUserId,
          updated_at: updatedAt
        }))
      );
      for (const item of items) {
        await enqueueSync({
          id: createId("sync"),
          entity: entity as SyncEntityKey,
          operation: "upsert",
          payload: {
            ...item,
            user_id: newUserId,
            updated_at: updatedAt
          },
          queued_at: updatedAt,
          attempt_count: 0,
          last_error: null
        });
      }
    }
  });
}

export function createSubjectDraft(userId: string): Subject {
  const now = nowIso();
  return subjectSchema.parse({
    id: createId("subject"),
    user_id: userId,
    name: "",
    teacher: "",
    color: "#2563eb",
    attendance_target: 75,
    created_at: now,
    updated_at: now,
    deleted_at: null
  });
}