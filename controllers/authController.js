import bcrypt from "bcrypt";
import pool from "../config/db.js";

export const showLogin = (req, res) => res.render("login", { error: null });
export const showRegister = (req, res) => res.render("register", { error: null });

export const registerUser = async (req, res) => {
  const { name, aadhar, password, email, age, gender, address, branch, skills } = req.body;
  const technical_skills = Array.isArray(skills) ? skills.join(", ") : skills;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO users (name,aadhar,password,email,age,gender,college_address,branch,technical_skills)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [name, aadhar, hashedPassword, email, age, gender, address, branch, technical_skills]
    );

    await pool.query(
      `INSERT INTO user_info(name,aadhar,skills) VALUES ($1,$2,$3)`,
      [name, aadhar, technical_skills]
    );

    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.render("register", { error: "Error saving user. Try again." });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const validPassword = await bcrypt.compare(password, user.password);
      if (validPassword) {
        req.session.loggedIn = true;
        req.session.email = email;
        req.session.aadhar = user.aadhar;
        return res.redirect("/");
      }
    }
    res.render("login", { error: "Invalid email or password" });
  } catch (err) {
    console.error(err);
    res.render("login", { error: "Login failed. Try again." });
  }
};

export const logoutUser = (req, res) => {
  req.session.destroy(() => res.redirect("/"));
};
