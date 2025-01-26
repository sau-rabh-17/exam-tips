import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import bcrypt from "bcrypt";
import pg from "pg";

import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 3000;

// PostgreSQL connection
const pool = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
pool.connect();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(
  session({
    secret: "yourSecretKey", 
    resave: false,
    saveUninitialized: false,
  })
);

// Middleware to add loggedIn to all responses
app.use((req, res, next) => {
  res.locals.loggedIn = req.session.loggedIn || false;
  next();
});

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

app.get("/register", (req, res) => {
  res.render("register", { error: null });
});

// Handle registration
app.post("/submit", async (req, res) => {
  const { name, aadhar, password, email, age, gender, address, branch, skills } = req.body;

  // Convert skills to a comma-separated string
  const technical_skills = Array.isArray(skills) ? skills.join(", ") : skills;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO users (name, aadhar, password, email, age, gender, college_address, branch, technical_skills) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [name, aadhar, hashedPassword, email, age, gender, address, branch, technical_skills]
    );
    await pool.query(
      `INSERT INTO user_info(name, aadhar, skills)
      Values ($1, $2, $3)`,
      [name,aadhar, technical_skills]
    );
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.render("register", { error: "Error saving to the database. Please try again." });
  }
});

// Handle login
app.post("/loginRedirect", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const validPassword = await bcrypt.compare(password, user.password);

      if (validPassword) {
        
        req.session.loggedIn = true;
        req.session.email = email;
        req.session.aadhar = user.aadhar;  // Store the Aadhar in the session
        return res.redirect("/");
      }
    }
    res.render("login", { error: "Invalid email or password. Please try again." });
  } catch (err) {
    console.error(err);
    res.render("login", { error: "Error during login. Please try again." });
  }
});


// Handle logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// Route to display repositories page
app.get("/erepo", async (req, res) => {
  if (req.session.loggedIn) {
    try {
      const aadhar = req.session.aadhar;  // Get logged-in user's aadhar from session
      const result = await pool.query(
        `SELECT e.repo_name, e.description, e.is_readme, e.created_at, u.name as user_name 
         FROM erepo e 
         JOIN users u ON e.aadhar = u.aadhar`
      );
      const repositories = result.rows;  // Get the repositories for the logged-in user
      res.render("respo", { repositories: repositories });
    } catch (err) {
      console.error(err);
      res.render("respo", { error: "Error fetching repositories. Please try again later." });
    }
  } else {
    res.redirect("/login");
  }
});

// Handle new repository creation
app.post("/create-repo", async (req, res) => {
  const { repo_name, description, is_readme } = req.body;
  const aadhar = req.session.aadhar;  // Get logged-in user's aadhar from session

  if (!aadhar) {
    return res.redirect("/login");
  }

  try {
    // Fetch user's name based on the aadhar
    const userResult = await pool.query("SELECT name FROM users WHERE aadhar = $1", [aadhar]);
    

    if (userResult.rows.length === 0) {
      return res.redirect("/login");
    }

    const userName = userResult.rows[0].name;

    // Insert the new repository into the erepo table
    await pool.query(
      `INSERT INTO erepo (aadhar, user_name, repo_name, description, is_readme) 
       VALUES ($1, $2, $3, $4, $5)`,
      [aadhar, userName, repo_name, description, is_readme]
    );
    await pool.query(
      `UPDATE user_info SET repositories = array_append(repositories, $1) WHERE aadhar = $2`,
      [repo_name, aadhar]
    );

    res.redirect("/erepo");  // Redirect back to the repositories page
  } catch (err) {
    console.error(err);
    res.render("respo", { error: "Error creating the repository. Please try again." });
  }
});


// Route to display "My Wall" page
app.get("/myWall", async (req, res) => {
  if (req.session.loggedIn) {
    try {
      const aadhar = req.session.aadhar;
      const result = await pool.query(
        `SELECT name, skills, about, contributions, experiences, repositories FROM user_info WHERE aadhar = $1`,
        [aadhar]
      );
      const user = result.rows[0]; // Assuming only one result for the user

      // If skills are stored as a string, split them into an array
      if (user.skills && typeof user.skills === 'string') {
        user.skills = user.skills.split(',').map(skill => skill.trim());
      }

      res.render("myWall", { user });
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.redirect("/login"); // Redirect to login if not logged in
  }
});

// Route to handle updating About section
app.post("/update-about", async (req, res) => {
  try {
    const aadhar = req.session.aadhar;
    const about = req.body.about;
    await pool.query(
      `UPDATE user_info SET about = $1 WHERE aadhar = $2`,
      [about, aadhar]
    );
    res.redirect("/myWall");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Route to handle updating Experience section
app.post("/update-experience", async (req, res) => {
  try {
    const aadhar = req.session.aadhar;
    const experience = req.body.experience;
    await pool.query(
      `UPDATE user_info SET experiences = $1 WHERE aadhar = $2`,
      [experience, aadhar]
    );
    res.redirect("/myWall");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Route to handle updating Contributions section
app.post("/update-contributions", async (req, res) => {
  try {
    const aadhar = req.session.aadhar;
    const contributions = req.body.contributions;
    await pool.query(
      `UPDATE user_info SET contributions = $1 WHERE aadhar = $2`,
      [contributions, aadhar]
    );
    res.redirect("/myWall");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Route to display forum page with posts
app.get("/forum", async (req, res) => {
  if (req.session.loggedIn) {
    try {
      // Fetch posts from the database
      const result = await pool.query("SELECT * FROM posts ORDER BY created_at DESC");
      const posts = result.rows;
      res.render("forum", { posts: posts });
    } catch (err) {
      console.error(err);
      res.render("forum", { error: "Error fetching posts. Please try again later." });
    }
  } else {
    res.redirect("/login");
  }
});


// Handle new post submission
app.post("/create-post", async (req, res) => {
  const { title, category, content } = req.body;
  const aadhar = req.session.aadhar; // Retrieve Aadhar from the session

  // If the user is not logged in, redirect to the login page
  if (!aadhar) {
    return res.redirect("/login");
  }

  try {
    // Fetch the user's name based on the logged-in Aadhar
    const userResult = await pool.query("SELECT name FROM users WHERE aadhar = $1", [aadhar]);

    if (userResult.rows.length === 0) {
      return res.redirect("/login");
    }

    const userName = userResult.rows[0].name;

    // Insert the new post into the database, including the user's name
    await pool.query(
      `INSERT INTO posts (aadhar, name, title, category, content) VALUES ($1, $2, $3, $4, $5)`,
      [aadhar, userName, title, category, content]
    );

    res.redirect("/forum"); // Redirect back to the forum page
  } catch (err) {
    console.error(err);
    res.render("forum", { error: "Error submitting the post. Please try again." });
  }
});




app.get("/exam-portal", (req, res) => {
  if (req.session.loggedIn) {
    res.render("examportal");
  } else {
    res.redirect("/login");
  }
});

app.get("/examportal", (req, res) => {
  if (req.session.loggedIn) {
    res.render("exam-portal");
  } else {
    res.redirect("/login");
  }
});

app.get("/exam",(req,res)=>{
  if(req.session.loggedIn){
    res.render("exam");
  }else{
    res.redirect("/login");
  }
})

app.get("/cpp",(req,res)=>{
  res.render("c");
})

app.get("/results",(req, res)=>{
  res.render("results");
})

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
