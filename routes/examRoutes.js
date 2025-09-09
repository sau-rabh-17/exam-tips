import express from "express";
import { examPortal, startExam, submitExam, viewResult } from "../controllers/examController.js";

const router = express.Router();

router.get("/", examPortal);
router.get("/exam", startExam);
router.post("/submit-exam", submitExam);
router.get("/results/:id", viewResult);

export default router;
