import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "firebase", "demo");
const userId = "11111111-1111-1111-1111-111111111111";
const now = new Date();

function iso(daysOffset = 0, hour = 8, minute = 0) {
  const date = new Date(now);
  date.setUTCDate(date.getUTCDate() + daysOffset);
  date.setUTCHours(hour, minute, 0, 0);
  return date.toISOString();
}

function dateOnly(daysOffset = 0) {
  return iso(daysOffset).slice(0, 10);
}

function createId(prefix, suffix) {
  return `${prefix}_${suffix}`;
}

const subjects = [
  {
    id: createId("subject", "algorithms"),
    user_id: userId,
    name: "Algorithms",
    teacher: "Dr. Meera Shah",
    color: "#2563eb",
    attendance_target: 80,
    created_at: iso(-21),
    updated_at: iso(-2),
    deleted_at: null
  },
  {
    id: createId("subject", "dbms"),
    user_id: userId,
    name: "DBMS",
    teacher: "Prof. Rohan Menon",
    color: "#0f766e",
    attendance_target: 75,
    created_at: iso(-21),
    updated_at: iso(-1),
    deleted_at: null
  },
  {
    id: createId("subject", "os"),
    user_id: userId,
    name: "Operating Systems",
    teacher: "Dr. Kavya Rao",
    color: "#db2777",
    attendance_target: 75,
    created_at: iso(-21),
    updated_at: iso(-3),
    deleted_at: null
  }
];

const classSessions = [
  [1, "09:00", "10:00", subjects[0].id, "Lab 2"],
  [1, "11:00", "12:00", subjects[1].id, "B-204"],
  [2, "10:00", "11:00", subjects[2].id, "A-103"],
  [3, "09:00", "10:00", subjects[0].id, "Lab 2"],
  [4, "13:00", "14:00", subjects[1].id, "B-204"],
  [5, "10:00", "11:00", subjects[2].id, "A-103"]
].map(([day, start, end, subjectId, room], index) => ({
  id: createId("session", index + 1),
  user_id: userId,
  subject_id: subjectId,
  day_of_week: day,
  start_time: start,
  end_time: end,
  room,
  created_at: iso(-20),
  updated_at: iso(-2),
  deleted_at: null
}));

const assignments = [
  {
    id: createId("assignment", "algo-sheet"),
    user_id: userId,
    subject_id: subjects[0].id,
    title: "Greedy Algorithms Problem Set",
    description: "Solve and explain 8 scheduling and interval problems.",
    due_date: dateOnly(3),
    priority: "high",
    status: "in_progress",
    estimated_minutes: 180,
    created_at: iso(-5),
    updated_at: iso(-1),
    deleted_at: null
  },
  {
    id: createId("assignment", "dbms-er"),
    user_id: userId,
    subject_id: subjects[1].id,
    title: "ER Diagram Case Study",
    description: "Design schema and explain normalization decisions.",
    due_date: dateOnly(5),
    priority: "medium",
    status: "pending",
    estimated_minutes: 120,
    created_at: iso(-4),
    updated_at: iso(-1),
    deleted_at: null
  },
  {
    id: createId("assignment", "os-report"),
    user_id: userId,
    subject_id: subjects[2].id,
    title: "Process Scheduling Report",
    description: "Compare FCFS, SJF, RR and priority scheduling.",
    due_date: dateOnly(-1),
    priority: "high",
    status: "overdue",
    estimated_minutes: 150,
    created_at: iso(-6),
    updated_at: iso(0),
    deleted_at: null
  }
];

const attendanceRecords = [
  [-12, subjects[0].id, "attended"],
  [-10, subjects[0].id, "missed"],
  [-8, subjects[0].id, "attended"],
  [-7, subjects[1].id, "attended"],
  [-5, subjects[1].id, "attended"],
  [-4, subjects[2].id, "missed"],
  [-2, subjects[2].id, "attended"],
  [-1, subjects[0].id, "attended"]
].map(([daysOffset, subjectId, status], index) => ({
  id: createId("attendance", index + 1),
  user_id: userId,
  subject_id: subjectId,
  date: dateOnly(daysOffset),
  status,
  created_at: iso(daysOffset),
  updated_at: iso(daysOffset, 12, 15),
  deleted_at: null
}));

const notes = [
  {
    id: createId("note", "algo-revision"),
    user_id: userId,
    subject_id: subjects[0].id,
    title: "Algorithm revision map",
    content: "## Focus\n- Activity selection\n- Huffman coding\n- MST proofs\n\n## Weak area\nExchange arguments.",
    tags: ["revision", "midsem"],
    created_at: iso(-3),
    updated_at: iso(-1),
    deleted_at: null
  },
  {
    id: createId("note", "dbms-query"),
    user_id: userId,
    subject_id: subjects[1].id,
    title: "DBMS joins cheat sheet",
    content: "Natural vs inner joins, indexing impacts, and common optimization patterns.",
    tags: ["sql", "quickref"],
    created_at: iso(-4),
    updated_at: iso(-2),
    deleted_at: null
  }
];

const pomodoroSessions = [
  [-3, subjects[0].id, assignments[0].id, "work", 50, true],
  [-3, subjects[0].id, null, "short_break", 10, true],
  [-2, subjects[1].id, assignments[1].id, "work", 45, true],
  [-1, subjects[2].id, assignments[2].id, "work", 40, true],
  [0, subjects[0].id, assignments[0].id, "work", 50, true]
].map(([daysOffset, subjectId, assignmentId, sessionType, duration, completed], index) => ({
  id: createId("pomodoro", index + 1),
  user_id: userId,
  subject_id: subjectId,
  assignment_id: assignmentId,
  session_type: sessionType,
  duration_minutes: duration,
  completed,
  started_at: iso(daysOffset, 14, 0),
  ended_at: iso(daysOffset, 14, duration),
  created_at: iso(daysOffset, 14, 0),
  updated_at: iso(daysOffset, 14, duration),
  deleted_at: null
}));

const exams = [
  {
    id: createId("exam", "algo-midsem"),
    user_id: userId,
    subject_id: subjects[0].id,
    title: "Algorithms Mid-Sem",
    exam_date: dateOnly(8),
    syllabus: "Greedy, divide and conquer, dynamic programming basics",
    prep_status: "Need one more DP practice block and proof revision.",
    created_at: iso(-7),
    updated_at: iso(-1),
    deleted_at: null
  },
  {
    id: createId("exam", "dbms-quiz"),
    user_id: userId,
    subject_id: subjects[1].id,
    title: "DBMS Quiz 2",
    exam_date: dateOnly(4),
    syllabus: "Transactions, schedules, normalization",
    prep_status: "Ready on transactions; revise normalization examples.",
    created_at: iso(-5),
    updated_at: iso(-1),
    deleted_at: null
  }
];

const userPreferences = [
  {
    id: createId("pref", "default"),
    user_id: userId,
    attendance_threshold: 75,
    pomodoro_work_minutes: 50,
    pomodoro_short_break_minutes: 10,
    pomodoro_long_break_minutes: 20,
    theme: "system",
    sync_enabled: true,
    study_start_hour: 7,
    study_end_hour: 22,
    preferred_session_minutes: 50,
    focus_intensity: "balanced",
    notifications_enabled: false,
    created_at: iso(-30),
    updated_at: iso(-1),
    deleted_at: null
  }
];

const studyPlans = [
  {
    id: createId("plan", "week-1"),
    user_id: userId,
    title: "Recovery plan before quiz week",
    input_snapshot_json: {
      weakSubjects: ["Algorithms"],
      availableHours: 4,
      focus: "Recover overdue OS report while keeping DBMS quiz prep on track"
    },
    output_json: {
      summary: "Prioritize overdue OS report tonight, then split the next two sessions between DBMS normalization and algorithm proof revision.",
      priorities: [
        {
          title: "Finish OS scheduling draft",
          reason: "Already overdue and blocks other work.",
          duration_minutes: 90,
          subject: "Operating Systems"
        },
        {
          title: "DBMS normalization revision",
          reason: "Quiz is within the next week.",
          duration_minutes: 60,
          subject: "DBMS"
        }
      ],
      schedule: [
        {
          start: "18:00",
          end: "19:30",
          focus: "OS report",
          action: "Write comparison section and conclusion"
        },
        {
          start: "20:00",
          end: "21:00",
          focus: "DBMS",
          action: "Normalize case study examples"
        }
      ]
    },
    created_at: iso(-1),
    updated_at: iso(-1),
    deleted_at: null
  }
];

const syncQueueItems = [
  {
    id: createId("sync", "assignment-overdue"),
    user_id: userId,
    entity: "assignments",
    operation: "upsert",
    payload: assignments[2],
    queued_at: iso(0, 7, 45),
    attempt_count: 1,
    last_error: "Offline during previous sync",
    created_at: iso(0, 7, 45),
    updated_at: iso(0, 7, 55),
    deleted_at: null
  }
];

const dataset = {
  meta: {
    app: "CampusPilot",
    generated_at: new Date().toISOString(),
    demo_user_id: userId,
    note: "Replace demo_user_id with a real Firebase Auth UID before import. This artifact is generated locally and requires no credentials."
  },
  subjects,
  class_sessions: classSessions,
  assignments,
  attendance_records: attendanceRecords,
  notes,
  pomodoro_sessions: pomodoroSessions,
  exams,
  user_preferences: userPreferences,
  study_plans: studyPlans,
  sync_queue_items: syncQueueItems
};

const firestoreSeed = {
  meta: dataset.meta,
  collections: {
    subjects: subjects.map((doc) => ({ id: doc.id, data: doc })),
    classSessions: classSessions.map((doc) => ({ id: doc.id, data: doc })),
    assignments: assignments.map((doc) => ({ id: doc.id, data: doc })),
    attendanceRecords: attendanceRecords.map((doc) => ({ id: doc.id, data: doc })),
    notes: notes.map((doc) => ({ id: doc.id, data: doc })),
    pomodoroSessions: pomodoroSessions.map((doc) => ({ id: doc.id, data: doc })),
    exams: exams.map((doc) => ({ id: doc.id, data: doc })),
    userPreferences: userPreferences.map((doc) => ({ id: doc.id, data: doc })),
    studyPlans: studyPlans.map((doc) => ({ id: doc.id, data: doc })),
    syncQueueItems: syncQueueItems.map((doc) => ({ id: doc.id, data: doc }))
  }
};

await mkdir(outputDir, { recursive: true });
await writeFile(path.join(outputDir, "campuspilot-demo-local.json"), `${JSON.stringify(dataset, null, 2)}\n`, "utf8");
await writeFile(path.join(outputDir, "campuspilot-demo-firestore.json"), `${JSON.stringify(firestoreSeed, null, 2)}\n`, "utf8");

console.log(`Wrote Firebase demo dataset to ${outputDir}`);
