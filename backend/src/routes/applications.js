const express = require("express");
const { query } = require("../db");

const router = express.Router();

const STATUSES = ["Applied", "Interview", "Offer", "Rejected"];

function validate(body) {
  const errors = [];
  if (!body || typeof body !== "object") {
    errors.push("Body must be an object");
    return errors;
  }
  if (!body.company || typeof body.company !== "string") errors.push("company is required");
  if (!body.role || typeof body.role !== "string") errors.push("role is required");
  if (body.location != null && typeof body.location !== "string")
    errors.push("location must be a string");
  if (!body.apply_date || isNaN(Date.parse(body.apply_date)))
    errors.push("apply_date must be a valid date (YYYY-MM-DD)");
  if (!STATUSES.includes(body.status))
    errors.push(`status must be one of: ${STATUSES.join(", ")}`);
  if (body.notes != null && typeof body.notes !== "string")
    errors.push("notes must be a string");
  return errors;
}

function normalize(body) {
  return {
    company: body.company.trim(),
    role: body.role.trim(),
    location: (body.location ?? "").trim(),
    apply_date: body.apply_date,
    status: body.status,
    notes: (body.notes ?? "").trim(),
  };
}

// GET /applications
router.get("/", async (_req, res, next) => {
  try {
    const { rows } = await query(
      "SELECT id, company, role, location, apply_date, status, notes, created_at FROM applications ORDER BY apply_date DESC, created_at DESC",
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /applications
router.post("/", async (req, res, next) => {
  const errors = validate(req.body);
  if (errors.length) return res.status(400).json({ errors });
  try {
    const d = normalize(req.body);
    const { rows } = await query(
      `INSERT INTO applications (company, role, location, apply_date, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, company, role, location, apply_date, status, notes, created_at`,
      [d.company, d.role, d.location, d.apply_date, d.status, d.notes],
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /applications/:id
router.put("/:id", async (req, res, next) => {
  const errors = validate(req.body);
  if (errors.length) return res.status(400).json({ errors });
  try {
    const d = normalize(req.body);
    const { rows } = await query(
      `UPDATE applications
         SET company = $1, role = $2, location = $3, apply_date = $4, status = $5, notes = $6
       WHERE id = $7
       RETURNING id, company, role, location, apply_date, status, notes, created_at`,
      [d.company, d.role, d.location, d.apply_date, d.status, d.notes, req.params.id],
    );
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /applications/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const result = await query("DELETE FROM applications WHERE id = $1", [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
