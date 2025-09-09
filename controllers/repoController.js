import pool from "../config/db.js";

export const listRepos = async (req, res) => {
  if (!req.session.loggedIn) return res.redirect("/login");

  try {
    const result = await pool.query(
      `SELECT e.repo_name,e.description,e.is_readme,e.created_at,u.name as user_name
       FROM erepo e JOIN users u ON e.aadhar = u.aadhar`
    );
    res.render("respo", { repositories: result.rows });
  } catch (err) {
    console.error(err);
    res.render("respo", { error: "Error fetching repositories" });
  }
};

export const createRepo = async (req, res) => {
  const { repo_name, description, is_readme } = req.body;
  const aadhar = req.session.aadhar;
  if (!aadhar) return res.redirect("/login");

  try {
    const userResult = await pool.query("SELECT name FROM users WHERE aadhar=$1", [aadhar]);
    if (userResult.rows.length === 0) return res.redirect("/login");

    const userName = userResult.rows[0].name;
    await pool.query(
      `INSERT INTO erepo (aadhar,user_name,repo_name,description,is_readme) VALUES ($1,$2,$3,$4,$5)`,
      [aadhar, userName, repo_name, description, is_readme]
    );

    await pool.query(
      `UPDATE user_info SET repositories=array_append(repositories,$1) WHERE aadhar=$2`,
      [repo_name, aadhar]
    );

    res.redirect("/erepo");
  } catch (err) {
    console.error(err);
    res.render("respo", { error: "Error creating repository" });
  }
};
