"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useAppSnapshot } from "@/hooks/use-app-data";
import { getAttendanceChart, getSubjectProgress, getWeeklyProductivity, getWorkloadOverview } from "@/lib/analytics";

const chartHeight = 260;

export default function AnalyticsPage() {
  const { subjects, assignments, attendanceRecords, exams, pomodoroSessions } = useAppSnapshot();
  const weeklyProductivity = getWeeklyProductivity(assignments, pomodoroSessions);
  const subjectProgress = getSubjectProgress(subjects, assignments, pomodoroSessions);
  const attendanceChart = getAttendanceChart(subjects, attendanceRecords);
  const workloadOverview = getWorkloadOverview(assignments, exams);
  const completedVsPending = [
    { name: "Completed", value: assignments.filter((assignment) => assignment.status === "completed").length },
    { name: "Open", value: assignments.filter((assignment) => assignment.status !== "completed").length }
  ];

  const hasData = subjects.length || assignments.length || pomodoroSessions.length || exams.length;

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader title="Analytics" description="Weekly productivity, subject-wise progress, focus time, attendance, and workload trends." />

        {!hasData ? (
          <EmptyState title="Analytics unlock once data exists" description="Add timetable items, assignments, attendance, exams, and Pomodoro sessions to populate these charts." />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Weekly productivity</CardTitle>
                  <CardDescription>Completed tasks and focus time over the current week.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height={chartHeight}>
                  <BarChart data={weeklyProductivity}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="focusMinutes" fill="#2563eb" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="completedTasks" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Subject progress</CardTitle>
                  <CardDescription>Assignment completion and focus hours per subject.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height={chartHeight}>
                  <AreaChart data={subjectProgress}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="subject" hide={subjectProgress.length > 5} />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="completedAssignments" stroke="#0f766e" fill="#99f6e4" />
                    <Area type="monotone" dataKey="focusHours" stroke="#7c3aed" fill="#ddd6fe" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Attendance by subject</CardTitle>
                  <CardDescription>Current attendance percentage versus threshold expectations.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height={chartHeight}>
                  <BarChart data={attendanceChart} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="subject" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="attendance" fill="#f59e0b" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Upcoming workload</CardTitle>
                  <CardDescription>Assignments and exams over the next two weeks.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height={chartHeight}>
                  <AreaChart data={workloadOverview}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" hide={workloadOverview.length > 8} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="assignments" stroke="#2563eb" fill="#bfdbfe" />
                    <Area type="monotone" dataKey="exams" stroke="#dc2626" fill="#fecaca" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="xl:col-span-2">
              <CardHeader>
                <div>
                  <CardTitle>Completion split</CardTitle>
                  <CardDescription>Quick view of completed versus open assignments.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height={chartHeight}>
                  <PieChart>
                    <Pie data={completedVsPending} dataKey="value" nameKey="name" outerRadius={110} innerRadius={70} fill="#2563eb" label />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
