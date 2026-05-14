import { Router } from "express";
import HealthRouter from "../modules/health/health.routes";
import UsersRouter from "../modules/users/users.routes";
import PollsRouter from "../modules/polls/polls.routes";
import DashboardRouter from "../modules/dashboard/dashboard.routes";

const router = Router();

router.use("/health", HealthRouter);
router.use("/v1/users", UsersRouter);
router.use("/v1/polls", PollsRouter);
router.use("/v1/dashboard", DashboardRouter);

export default router;
