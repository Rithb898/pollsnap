import { Router } from "express";
import HealthRouter from "../modules/health/health.routes";
import AuthRouter from "../modules/auth/auth.routes";
import UserRouter from "../modules/user/user.routes";

const router = Router();

router.use("/health", HealthRouter);
router.use("/auth", AuthRouter);
router.use("/users", UserRouter);

export default router;
