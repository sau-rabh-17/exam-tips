import pool from "../config/db.js";

export const listRepos = async (req, res) => {
  if (!req.session.loggedIn) return res.redirect("/login");

  try {
    const result = await pool.query(
      `SELECT e.repo_name,e.description,e.is_readme,e.created_at,u.name as user_name
       FROM erepo e JOIN users u ON e.email = u.email`
    );
    res.render("respo", { repositories: result.rows });
  } catch (err) {
    console.error(err);
    res.render("respo", { error: "Error fetching repositories" });
  }
};

export const createRepo = async (req, res) => {
  const { repo_name, description, is_readme } = req.body;
  const email = req.session.email;
  if (!email) return res.redirect("/login");

  try {
    const userResult = await pool.query("SELECT name FROM users WHERE email=$1", [email]);
    if (userResult.rows.length === 0) return res.redirect("/login");

    const userName = userResult.rows[0].name;
    await pool.query(
      `INSERT INTO erepo (email,user_name,repo_name,description,is_readme) VALUES ($1,$2,$3,$4,$5)`,
      [email, userName, repo_name, description, is_readme]
    );

    await pool.query(
      `UPDATE user_info SET repositories=array_append(repositories,$1) WHERE email=$2`,
      [repo_name, email]
    );

    res.redirect("/erepo");
  } catch (err) {
    console.error(err);
    res.render("respo", { error: "Error creating repository" });
  }
};
