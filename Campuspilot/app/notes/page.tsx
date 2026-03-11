"use client";

import { useMemo, useState } from "react";
import { Pencil, Search, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useNotes, useSubjects } from "@/hooks/use-app-data";
import { useAuth } from "@/hooks/use-auth";
import { createId } from "@/lib/id";
import { nowIso } from "@/lib/time";
import { removeEntity, upsertEntity } from "@/services/local-store";

const emptyNote = { subject_id: "", title: "", content: "", tags: "" };

export default function NotesPage() {
  const { localUserId } = useAuth();
  const notes = useNotes();
  const subjects = useSubjects();
  const [form, setForm] = useState(emptyNote);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("");

  const allTags = useMemo(() => Array.from(new Set(notes.flatMap((note) => note.tags))).sort(), [notes]);
  const filteredNotes = useMemo(() => {
    const searchTerm = search.toLowerCase();
    return notes
      .filter((note) => (subjectFilter === "all" ? true : note.subject_id === subjectFilter))
      .filter((note) => (!tagFilter ? true : note.tags.includes(tagFilter)))
      .filter((note) => {
        if (!searchTerm) return true;
        return [note.title, note.content, note.tags.join(" ")].join(" ").toLowerCase().includes(searchTerm);
      })
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  }, [notes, search, subjectFilter, tagFilter]);

  const saveNote = async (event: React.FormEvent) => {
    event.preventDefault();
    const now = nowIso();
    await upsertEntity("notes", {
      id: editingId ?? createId("note"),
      user_id: localUserId,
      created_at: now,
      updated_at: now,
      deleted_at: null,
      subject_id: form.subject_id || null,
      title: form.title,
      content: form.content,
      tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
    });
    setEditingId(null);
    setForm(emptyNote);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader title="Notes" description="Keep markdown-friendly lecture notes, revision snippets, and searchable tags offline." />

        <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{editingId ? "Edit note" : "Create note"}</CardTitle>
                <CardDescription>Use tags for revision themes, chapters, or exam units.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4" onSubmit={saveNote}>
                <Field label="Title"><Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required /></Field>
                <Field label="Subject">
                  <Select value={form.subject_id} onChange={(event) => setForm((current) => ({ ...current, subject_id: event.target.value }))}>
                    <option value="">General note</option>
                    {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
                  </Select>
                </Field>
                <Field label="Tags"><Input value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} placeholder="dbms, unit-3, revision" /></Field>
                <Field label="Content"><Textarea value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} className="min-h-52" /></Field>
                <Button type="submit">{editingId ? "Update note" : "Save note"}</Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Search and filter</CardTitle>
                  <CardDescription>Find notes by subject, tag, or text.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-[1.2fr_1fr_1fr]">
                <Field label="Search"><div className="relative"><Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search notes" /></div></Field>
                <Field label="Subject"><Select value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)}><option value="all">All subjects</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</Select></Field>
                <Field label="Tag"><Select value={tagFilter} onChange={(event) => setTagFilter(event.target.value)}><option value="">All tags</option>{allTags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}</Select></Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Saved notes</CardTitle>
                  <CardDescription>{filteredNotes.length} note{filteredNotes.length === 1 ? "" : "s"} visible.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredNotes.length === 0 ? (
                  <EmptyState title="No notes match" description="Create a note or widen your filters." />
                ) : (
                  filteredNotes.map((note) => {
                    const subject = subjects.find((item) => item.id === note.subject_id);
                    return (
                      <div key={note.id} className="rounded-2xl border border-border/70 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{note.title}</p>
                              {subject ? <Badge tone="secondary">{subject.name}</Badge> : null}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">Updated {new Date(note.updated_at).toLocaleString()}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingId(note.id);
                                setForm({
                                  subject_id: note.subject_id ?? "",
                                  title: note.title,
                                  content: note.content,
                                  tags: note.tags.join(", ")
                                });
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => void removeEntity("notes", note.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                        <div className="mt-4 whitespace-pre-wrap text-sm text-muted-foreground">{note.content.slice(0, 320)}{note.content.length > 320 ? "..." : ""}</div>
                        {note.tags.length ? <div className="mt-4 flex flex-wrap gap-2">{note.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}</div> : null}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
