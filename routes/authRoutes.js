import express from "express";
import { showLogin, showRegister, registerUser, loginUser, logoutUser } from "../controllers/authController.js";

const router = express.Router();

router.get("/login", showLogin);
router.get("/register", showRegister);
router.post("/submit", registerUser);
router.post("/loginRedirect", loginUser);
router.get("/logout", logoutUser);

export default router;
