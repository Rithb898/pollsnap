import { Router } from "express";
import HealthRouter from "../modules/health/health.routes";
import UsersRouter from "../modules/users/users.routes";

const router = Router();

router.use("/health", HealthRouter);
router.use("/v1/users", UsersRouter);

export default router;
