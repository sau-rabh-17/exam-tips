import pool from "../config/db.js";

// ============= WALL PAGE =============
export const myWall = async (req, res) => {
  if (!req.session.loggedIn) return res.redirect("/login");

  try {
    const email = req.session.email;

    const userResult = await pool.query(
      "SELECT name, email FROM users WHERE email=$1",
      [email]
    );

    const repoResult = await pool.query(
      "SELECT repo_name, description, created_at FROM erepo WHERE email=$1",
      [email]
    );

    const examResult = await pool.query(
      "SELECT * FROM exam_results WHERE email=$1 ORDER BY timestamp DESC",
      [email]
    );

    res.render("myWall", {
      user: userResult.rows[0],
      repos: repoResult.rows,
      results: examResult.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};


// ============= UPDATE ABOUT =============
export const updateAbout = async (req, res) => {
  if (!req.session.loggedIn) return res.redirect("/login");

  try {
    const { about } = req.body;
    const email = req.session.email;

    await pool.query(
      "UPDATE user_info SET about=$1 WHERE email=$2",
      [about, email]
    );

    res.redirect("/wall");
  } catch (err) {
    console.error(err);
    res.status(500).send("Cannot update about section");
  }
};


// ============= UPDATE EXPERIENCE =============
export const updateExperience = async (req, res) => {
  if (!req.session.loggedIn) return res.redirect("/login");

  try {
    const { experiences } = req.body;
    const email = req.session.email;

    await pool.query(
      "UPDATE user_info SET experiences=$1 WHERE email=$2",
      [experiences, email]
    );

    res.redirect("/wall");
  } catch (err) {
    console.error(err);
    res.status(500).send("Cannot update experience section");
  }
};


// ============= UPDATE CONTRIBUTIONS =============
export const updateContributions = async (req, res) => {
  if (!req.session.loggedIn) return res.redirect("/login");

  try {
    const { contributions } = req.body;
    const email = req.session.email;

    await pool.query(
      "UPDATE user_info SET contributions=$1 WHERE email=$2",
      [contributions, email]
    );

    res.redirect("/wall");
  } catch (err) {
    console.error(err);
    res.status(500).send("Cannot update contributions section");
  }
};
