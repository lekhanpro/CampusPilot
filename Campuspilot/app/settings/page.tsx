"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { usePreferences } from "@/hooks/use-app-data";
import { upsertEntity } from "@/services/local-store";
import { nowIso } from "@/lib/time";

export default function SettingsPage() {
  const { localUserId } = useAuth();
  const preferences = usePreferences();
  const [saving, setSaving] = useState(false);
  const { setTheme } = useTheme();

  const saveField = async (changes: Partial<typeof preferences>) => {
    setSaving(true);
    try {
      const next = {
        ...preferences,
        ...changes,
        user_id: localUserId,
        updated_at: nowIso()
      };
      await upsertEntity("userPreferences", next);
      if (changes.theme) {
        setTheme(changes.theme);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader title="Settings" description="Personalize thresholds, planner defaults, sync behavior, and theme preferences." />

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Attendance and sync</CardTitle>
                <CardDescription>Threshold and offline sync defaults.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Attendance threshold">
                <Input
                  type="number"
                  min={50}
                  max={100}
                  value={preferences.attendance_threshold}
                  onChange={(event) => void saveField({ attendance_threshold: Number(event.target.value) })}
                />
              </Field>
              <Field label="Theme mode">
                <Select value={preferences.theme} onChange={(event) => void saveField({ theme: event.target.value as typeof preferences.theme })}>
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </Select>
              </Field>
              <Field label="Cloud sync preference">
                <Select value={preferences.sync_enabled ? "enabled" : "disabled"} onChange={(event) => void saveField({ sync_enabled: event.target.value === "enabled" })}>
                  <option value="enabled">Enabled</option>
                  <option value="disabled">Disabled</option>
                </Select>
              </Field>
              <Field label="Notifications placeholder">
                <Select
                  value={preferences.notifications_enabled ? "enabled" : "disabled"}
                  onChange={(event) => void saveField({ notifications_enabled: event.target.value === "enabled" })}
                >
                  <option value="disabled">Disabled</option>
                  <option value="enabled">Enabled</option>
                </Select>
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Pomodoro</CardTitle>
                <CardDescription>Work and break durations used by the timer.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <Field label="Work minutes">
                <Input type="number" min={10} max={90} value={preferences.pomodoro_work_minutes} onChange={(event) => void saveField({ pomodoro_work_minutes: Number(event.target.value) })} />
              </Field>
              <Field label="Short break">
                <Input type="number" min={3} max={30} value={preferences.pomodoro_short_break_minutes} onChange={(event) => void saveField({ pomodoro_short_break_minutes: Number(event.target.value) })} />
              </Field>
              <Field label="Long break">
                <Input type="number" min={10} max={45} value={preferences.pomodoro_long_break_minutes} onChange={(event) => void saveField({ pomodoro_long_break_minutes: Number(event.target.value) })} />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>AI planner preferences</CardTitle>
                <CardDescription>Bias generated plans toward your routine and preferred intensity.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <Field label="Study start hour">
                <Input type="number" min={0} max={23} value={preferences.study_start_hour} onChange={(event) => void saveField({ study_start_hour: Number(event.target.value) })} />
              </Field>
              <Field label="Study end hour">
                <Input type="number" min={0} max={23} value={preferences.study_end_hour} onChange={(event) => void saveField({ study_end_hour: Number(event.target.value) })} />
              </Field>
              <Field label="Preferred session length">
                <Input type="number" min={15} max={180} value={preferences.preferred_session_minutes} onChange={(event) => void saveField({ preferred_session_minutes: Number(event.target.value) })} />
              </Field>
              <Field label="Focus intensity" className="sm:col-span-3">
                <Select value={preferences.focus_intensity} onChange={(event) => void saveField({ focus_intensity: event.target.value as typeof preferences.focus_intensity })}>
                  <option value="light">Light</option>
                  <option value="balanced">Balanced</option>
                  <option value="deep">Deep</option>
                </Select>
              </Field>
            </CardContent>
          </Card>
        </div>

        <Button variant="outline" disabled={saving}>{saving ? "Saving..." : "Settings auto-save to your offline workspace"}</Button>
      </div>
    </AppShell>
  );
}
