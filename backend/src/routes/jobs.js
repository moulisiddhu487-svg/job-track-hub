const express = require("express");
const router = express.Router();

// This route handles: GET /jobs/search?keyword=DevOps&location=Hyderabad
router.get("/search", async (req, res) => {
  const { keyword, location } = req.query;

  // Build Adzuna API URL
  const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${process.env.ADZUNA_APP_ID}&app_key=${process.env.ADZUNA_APP_KEY}&what=${keyword}&where=${location}&results_per_page=20&content-type=application/json`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Send jobs back to frontend
    res.json(data.results);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

module.exports = router;