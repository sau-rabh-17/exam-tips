import pool from "../config/db.js";

export const myWall = async (req, res) => {
  if (!req.session.loggedIn) return res.redirect("/login");

  try {
    const aadhar = req.session.aadhar;
    const result = await pool.query(
      `SELECT name,skills,about,contributions,experiences,repositories FROM user_info WHERE aadhar=$1`,
      [aadhar]
    );
    const user = result.rows[0];
    if (user.skills && typeof user.skills === "string") {
      user.skills = user.skills.split(",").map(s => s.trim());
    }
    res.render("myWall", { user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

export const updateAbout = async (req, res) => {
  try {
    await pool.query("UPDATE user_info SET about=$1 WHERE aadhar=$2", [req.body.about, req.session.aadhar]);
    res.redirect("/myWall");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

export const updateExperience = async (req, res) => {
  try {
    await pool.query("UPDATE user_info SET experiences=$1 WHERE aadhar=$2", [req.body.experience, req.session.aadhar]);
    res.redirect("/myWall");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

export const updateContributions = async (req, res) => {
  try {
    await pool.query("UPDATE user_info SET contributions=$1 WHERE aadhar=$2", [req.body.contributions, req.session.aadhar]);
    res.redirect("/myWall");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};
