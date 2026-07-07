export type ApplicationStatus = "Applied" | "Interview" | "Offer" | "Rejected";

export interface Application {
  id: string;
  company: string;
  role: string;
  location: string;
  apply_date: string; // YYYY-MM-DD
  status: ApplicationStatus;
  notes: string;
  created_at: string;
}

export type ApplicationInput = Omit<Application, "id" | "created_at">;

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const LS_KEY = "job-applications-fallback";

function readLocal(): Application[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeLocal(rows: Application[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_KEY, JSON.stringify(rows));
}

async function tryFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function listApplications(): Promise<Application[]> {
  try {
    return await tryFetch<Application[]>("/applications");
  } catch {
    return readLocal();
  }
}

export async function createApplication(data: ApplicationInput): Promise<Application> {
  try {
    return await tryFetch<Application>("/applications", {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch {
    const row: Application = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    const rows = [row, ...readLocal()];
    writeLocal(rows);
    return row;
  }
}

export async function updateApplication(
  id: string,
  data: ApplicationInput,
): Promise<Application> {
  try {
    return await tryFetch<Application>(`/applications/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  } catch {
    const rows = readLocal().map((r) => (r.id === id ? { ...r, ...data } : r));
    writeLocal(rows);
    return rows.find((r) => r.id === id)!;
  }
}

export async function deleteApplication(id: string): Promise<void> {
  try {
    await tryFetch<void>(`/applications/${id}`, { method: "DELETE" });
  } catch {
    writeLocal(readLocal().filter((r) => r.id !== id));
  }
}
