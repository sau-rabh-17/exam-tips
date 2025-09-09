import express from "express";
import { myWall, updateAbout, updateExperience, updateContributions } from "../controllers/wallController.js";

const router = express.Router();

router.get("/", myWall);
router.post("/update-about", updateAbout);
router.post("/update-experience", updateExperience);
router.post("/update-contributions", updateContributions);

export default router;
