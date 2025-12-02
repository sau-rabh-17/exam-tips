import pool from "../config/db.js";

export const listPosts = async (req, res) => {
  if (!req.session.loggedIn) return res.redirect("/login");

  try {
    const result = await pool.query("SELECT * FROM posts ORDER BY created_at DESC");
    res.render("forum", { posts: result.rows });
  } catch (err) {
    console.error(err);
    res.render("forum", { error: "Error fetching posts" });
  }
};

export const createPost = async (req, res) => {
  const { title, category, content } = req.body;
  const email = req.session.email;
  if (!email) return res.redirect("/login");

  try {
    const userResult = await pool.query("SELECT name FROM users WHERE email=$1", [email]);
    if (userResult.rows.length === 0) return res.redirect("/login");

    await pool.query(
      `INSERT INTO posts (email,name,title,category,content) VALUES ($1,$2,$3,$4,$5)`,
      [email, userResult.rows[0].name, title, category, content]
    );
    res.redirect("/forum");
  } catch (err) {
    console.error(err);
    res.render("forum", { error: "Error submitting post" });
  }
};
