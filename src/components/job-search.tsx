import { useState } from "react";
import { Search, MapPin, Building2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Job {
  id: string;
  title: string;
  description: string;
  redirect_url: string;
  company: { display_name: string };
  location: { display_name: string };
  created: string;
}

export function JobSearch() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    if (!keyword) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/jobs/search?keyword=${keyword}&location=${location}`
      );
      const data = await res.json();
console.log("Jobs received:", data);
setJobs(Array.isArray(data) ? data : []);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-8">
      <h2 className="text-base font-semibold mb-4">Search Jobs</h2>

      {/* Search Bar */}
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Job title (e.g. DevOps)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-48"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Input
          placeholder="Location (e.g. Hyderabad)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-48"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={loading}>
          <Search className="mr-2 h-4 w-4" />
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      {/* Results */}
      <div className="mt-4 grid gap-3">
        {searched && !loading && jobs.length === 0 && (
          <p className="text-sm text-muted-foreground">No jobs found.</p>
        )}
        {jobs.map((job) => (
          <Card key={job.id} className="border-border/60 hover:border-primary/40 hover:shadow-md transition-all">
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{job.title}</h3>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" />
                      {job.company.display_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.location.display_name}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {job.description}
                  </p>
                </div>
                <a href={job.redirect_url} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    Apply
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
