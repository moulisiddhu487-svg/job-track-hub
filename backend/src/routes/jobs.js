const express = require("express");
const router = express.Router();

// This route handles: GET /jobs/search
router.get("/search", async (req, res) => {
  try {
    const { keyword, location } = req.query;
    
    // Set default search parameters
    const searchKeyword = keyword || "devops";
    const searchLocation = location || "";

    // Keys are hardcoded here to bypass .env issues
    const adzunaId = "f294c523";
    const adzunaKey = "20fb96b66989562924152410507076f5";
    
    // The "/in/" strictly locks the search to India
    const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${adzunaId}&app_key=${adzunaKey}&results_per_page=30&what=${encodeURIComponent(searchKeyword)}&where=${encodeURIComponent(searchLocation)}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.results) {
       return res.json([]);
    }

    // Format exactly for your frontend UI and direct apply buttons
    const jobs = data.results.map(job => ({
      title: job.title,
      company: { display_name: job.company.display_name },
      location: { display_name: job.location.display_name },
      redirect_url: job.redirect_url
    }));

    res.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs from Adzuna:", error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

module.exports = router;
