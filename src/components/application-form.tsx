import { useState, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Application,
  ApplicationInput,
  ApplicationStatus,
} from "@/lib/applications-api";

const STATUSES: ApplicationStatus[] = ["Applied", "Interview", "Offer", "Rejected"];

interface Props {
  initial?: Application | null;
  onSubmit: (data: ApplicationInput) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
}

export function ApplicationForm({ initial, onSubmit, onCancel, submitting }: Props) {
  const [form, setForm] = useState<ApplicationInput>({
    company: "",
    role: "",
    location: "",
    apply_date: new Date().toISOString().slice(0, 10),
    status: "Applied",
    notes: "",
  });

  useEffect(() => {
    if (initial) {
      setForm({
        company: initial.company,
        role: initial.role,
        location: initial.location,
        apply_date: initial.apply_date?.slice(0, 10) ?? "",
        status: initial.status,
        notes: initial.notes ?? "",
      });
    }
  }, [initial]);

  function update<K extends keyof ApplicationInput>(k: K, v: ApplicationInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
        <div className="grid gap-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            required
            value={form.company}
            onChange={(e) => update("company", e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="role">Role</Label>
          <Input
            id="role"
            required
            value={form.role}
            onChange={(e) => update("role", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
        <div className="grid gap-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
            placeholder="Remote · San Francisco"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="apply_date">Apply date</Label>
          <Input
            id="apply_date"
            type="date"
            required
            value={form.apply_date}
            onChange={(e) => update("apply_date", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Status</Label>
        <Select
          value={form.status}
          onValueChange={(v) => update("status", v as ApplicationStatus)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          rows={4}
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="Recruiter contact, interview details, links…"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {initial ? "Save changes" : "Add application"}
        </Button>
      </div>
    </form>
  );
}
