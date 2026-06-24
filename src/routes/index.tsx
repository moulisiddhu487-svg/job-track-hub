import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Briefcase, Plus, Pencil, Trash2, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApplicationForm } from "@/components/application-form";
import {
  type Application,
  type ApplicationInput,
  type ApplicationStatus,
  createApplication,
  deleteApplication,
  listApplications,
  updateApplication,
} from "@/lib/applications-api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Job Application Tracker" },
      {
        name: "description",
        content: "Track companies you've applied to, interviews, offers, and rejections.",
      },
      { property: "og:title", content: "Job Application Tracker" },
      {
        property: "og:description",
        content: "A clean dashboard to manage your job search end-to-end.",
      },
    ],
  }),
  component: Dashboard,
});

const STATUSES: ApplicationStatus[] = ["Applied", "Interview", "Offer", "Rejected"];

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  Applied: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  Interview: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  Offer: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  Rejected: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
};

function Dashboard() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"All" | ApplicationStatus>("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Application | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Application | null>(null);

  async function refresh() {
    setLoading(true);
    const rows = await listApplications();
    setApps(
      [...rows].sort(
        (a, b) =>
          new Date(b.apply_date).getTime() - new Date(a.apply_date).getTime(),
      ),
    );
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  const counts = useMemo(() => {
    const c: Record<ApplicationStatus, number> = {
      Applied: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
    };
    apps.forEach((a) => {
      c[a.status] = (c[a.status] ?? 0) + 1;
    });
    return c;
  }, [apps]);

  const visible = useMemo(
    () => (filter === "All" ? apps : apps.filter((a) => a.status === filter)),
    [apps, filter],
  );

  async function handleSubmit(data: ApplicationInput) {
    setSubmitting(true);
    try {
      if (editing) {
        await updateApplication(editing.id, data);
      } else {
        await createApplication(data);
      }
      setDialogOpen(false);
      setEditing(null);
      await refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    await deleteApplication(confirmDelete.id);
    setConfirmDelete(null);
    await refresh();
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                Job Application Tracker
              </h1>
              <p className="text-xs text-muted-foreground">
                {apps.length} total {apps.length === 1 ? "application" : "applications"}
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {STATUSES.map((s) => (
            <Card key={s}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {s}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-semibold tracking-tight">
                    {counts[s]}
                  </span>
                  <Badge variant="outline" className={STATUS_STYLES[s]}>
                    {s}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Applications</h2>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <TabsList>
                <TabsTrigger value="All">All</TabsTrigger>
                {STATUSES.map((s) => (
                  <TabsTrigger key={s} value={s}>
                    {s}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="mt-4">
            {loading ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Loading…
              </p>
            ) : visible.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">No applications yet</p>
                    <p className="text-sm text-muted-foreground">
                      Track your first job application to get started.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setEditing(null);
                      setDialogOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add application
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {visible.map((a) => (
                  <Card key={a.id}>
                    <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate font-semibold">{a.company}</h3>
                          <Badge
                            variant="outline"
                            className={STATUS_STYLES[a.status]}
                          >
                            {a.status}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {a.role}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          {a.location && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {a.location}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(a.apply_date).toLocaleDateString()}
                          </span>
                        </div>
                        {a.notes && (
                          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                            {a.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 self-end sm:self-center">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => {
                            setEditing(a);
                            setDialogOpen(true);
                          }}
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setConfirmDelete(a)}
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditing(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit application" : "New application"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update the details for this application."
                : "Track a new role you've applied to."}
            </DialogDescription>
          </DialogHeader>
          <ApplicationForm
            initial={editing}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => {
              setDialogOpen(false);
              setEditing(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete application?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <strong>{confirmDelete?.company}</strong> · {confirmDelete?.role}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
