import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { createRateLimiter } from "../middleware/rate-limit.middleware.js";

const router: Router = Router();

const registerRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many registration attempts. Please try again later.",
});

const loginRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts. Please try again later.",
});

router.post("/register", registerRateLimit, AuthController.register);
router.post("/login", loginRateLimit, AuthController.login);

export default router;
