import express from "express";
import { listRepos, createRepo } from "../controllers/repoController.js";

const router = express.Router();

router.get("/", listRepos);
router.post("/create-repo", createRepo);

export default router;
