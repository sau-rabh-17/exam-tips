import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import dotenv from "dotenv";
import path from "path";

import authRoutes from "./routes/authRoutes.js";
import repoRoutes from "./routes/repoRoutes.js";
import wallRoutes from "./routes/wallRoutes.js";
import forumRoutes from "./routes/forumRoutes.js";
import examRoutes from "./routes/examRoutes.js";

import pool from "./config/db.js";

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");



// Sessions
app.use(
  session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: false,
  })
);

// Global variable for login state
app.use((req, res, next) => {
  res.locals.loggedIn = req.session.loggedIn || false;
  next();
});

// Routes
app.get("/", (req, res) => res.render("index"));
app.use("/", authRoutes);
app.use("/erepo", repoRoutes);
app.use("/myWall", wallRoutes);
app.use("/forum", forumRoutes);
app.use("/exam-portal", examRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).render("404");
});

// Start server
app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`)
);
