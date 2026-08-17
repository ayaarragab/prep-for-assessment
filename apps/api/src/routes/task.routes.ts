import { Router } from "express";
import { TaskController } from "../controllers/task.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createTaskSchema,
  projectIdParamsSchema,
  taskIdParamsSchema,
  updateTaskSchema,
} from "../validation/task.validation.js";

const router: Router = Router();

router.use(authMiddleware);

router.get(
  "/project/:projectId",
  validate(projectIdParamsSchema),
  TaskController.getByProject,
);
router.post("/", validate(createTaskSchema), TaskController.create);
router.patch(
  "/:id",
  validate(taskIdParamsSchema),
  validate(updateTaskSchema),
  TaskController.update,
);

export default router;
