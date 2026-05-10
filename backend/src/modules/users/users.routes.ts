import { Router } from "express";
import { getCurrentUser } from "./users.controller";

const router = Router();

router.get("/me", getCurrentUser);

export default router;
