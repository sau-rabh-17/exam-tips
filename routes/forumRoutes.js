import express from "express";
import { listPosts, createPost } from "../controllers/forumController.js";

const router = express.Router();

router.get("/", listPosts);
router.post("/create-post", createPost);

export default router;
