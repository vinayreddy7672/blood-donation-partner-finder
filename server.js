const express = require("express");
const bodyParser = require("body-parser");
const db = require("./db");

const app = express();

app.use(bodyParser.json());
app.use(express.static("public"));

/* ================= USER SIDE ================= */

/* REGISTER DONOR */
app.post("/register", (req, res) => {

  const { name, blood_group, age, phone, city, availability } = req.body;

  const sql = `
    INSERT INTO blood_donors
    (full_name, blood_type, age, contact_number, city, is_available)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql,
    [name, blood_group, age, phone, city, availability],
    err => {
      if (err) return res.send("Registration Failed ❌");
      res.send("SUCCESS");
    });
});

/* FIND DONOR */
app.get("/search", (req, res) => {

  let { blood_group, city } = req.query;

  // ⭐ Fix + issue
  blood_group = blood_group.replace(" ", "+");

  const sql = `
    SELECT * FROM blood_donors
    WHERE blood_type = ?
    AND city = ?
    AND is_available = 1
  `;

  db.query(sql, [blood_group, city], (err, result) => {
    if (err) return res.json([]);
    res.json(result);
  });
});

/* ================= ADMIN SIDE ================= */

/* ADMIN LOGIN */
app.post("/admin-login", (req, res) => {

  const { username, password } = req.body;

  db.query(
    "SELECT * FROM admins WHERE username=? AND password=?",
    [username, password],
    (err, result) => {

      if (result.length > 0)
        res.send("SUCCESS");
      else
        res.send("Invalid credentials ❌");
    }
  );
});
/* BLOOD GROUP STATS */
app.get("/blood-stats", (req, res) => {

  const sql = `
    SELECT blood_type, COUNT(*) AS count
    FROM blood_donors
    GROUP BY blood_type
  `;

  db.query(sql, (err, result) => res.json(result));
});
/* GET ALL DONORS */
app.get("/donors", (req, res) => {
  db.query("SELECT * FROM blood_donors",
    (err, result) => res.json(result));
});

/* DELETE DONOR */
app.delete("/donor/:id", (req, res) => {

  db.query(
    "DELETE FROM blood_donors WHERE donor_id=?",
    [req.params.id],
    () => res.send("Deleted")
  );
});

/* TOGGLE AVAILABILITY */
app.put("/donor/:id", (req, res) => {

  db.query(
    "UPDATE blood_donors SET is_available=? WHERE donor_id=?",
    [req.body.available, req.params.id],
    () => res.send("Updated")
  );
});

/* ANALYTICS */
app.get("/analytics", (req, res) => {

  const sql = `
    SELECT
      COUNT(*) AS total,
      SUM(is_available=1) AS available,
      COUNT(DISTINCT city) AS cities
    FROM blood_donors
  `;

  db.query(sql, (err, result) =>
    res.json(result[0])
  );
});

/* BROADCAST (NO SMS — SCREEN ONLY) */
app.post("/broadcast", (req, res) => {

  const { message } = req.body;

  console.log("Emergency Broadcast:", message);

  res.send("Alert sent to all donors 📢");
});

app.listen(3000,
  () => console.log("Server running at http://localhost:3000 🚀")
);
/* BLOOD GROUP STATS */
app.get("/blood-stats", (req, res) => {

  const sql = `
    SELECT blood_type, COUNT(*) AS count
    FROM blood_donors
    GROUP BY blood_type
  `;

  db.query(sql, (err, result) => res.json(result));
});
/* RECORD DONATION */

app.post("/donate", (req, res) => {

  const {
    donor_id,
    donor_name,
    blood_type,
    quantity,
    date,
    patient,
    hospital
  } = req.body;

  const sql = `
    INSERT INTO donations
    (donor_id, donor_name, blood_type,
     quantity_ml, donation_date,
     patient_name, hospital)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql,
    [donor_id, donor_name, blood_type,
     quantity, date, patient, hospital],
    err => {
      if (err) return res.send("Failed ❌");
      res.send("Donation Recorded ✅");
    });
});