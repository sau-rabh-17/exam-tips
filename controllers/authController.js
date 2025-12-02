import bcrypt from "bcrypt";
import pool from "../config/db.js";

export const showLogin = (req, res) => 
  res.render("login", { error: null });

export const showRegister = (req, res) =>
  res.render("register", { error: null, success: null });


export const registerUser = async (req, res) => {
  const { name, gender, dob, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (email, name, gender, dob, password)
       VALUES ($1, $2, $3, $4, $5)`,
      [email, name, gender, dob, hashedPassword]
    );

    res.render("register", { error: null, success: "Account created successfully!" });
  } catch (err) {
    console.error(err);
    res.render("register", { error: "User already exists or invalid data", success: null });
  }
};



export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    // User not found
    if (result.rows.length === 0) {
      return res.render("login", { error: "User does not exist" });
    }

    const user = result.rows[0];

    // Password check
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.render("login", { error: "Incorrect password" });
    }

    // Login success
    req.session.loggedIn = true;
    req.session.email = user.email;

    res.redirect("/");

  } catch (err) {
    console.error(err);
    res.render("login", { error: "Login failed. Try again." });
  }
};


export const logoutUser = (req, res) => {
  req.session.destroy(() => res.redirect("/"));
};
