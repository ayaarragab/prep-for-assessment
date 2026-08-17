import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createProjectSchema, projectIdParamsSchema } from '../validation/project.validation.js';

const router: Router = Router();

router.use(authMiddleware);

router.get('/', ProjectController.getAll);
router.get('/:id', validate(projectIdParamsSchema), ProjectController.getById);
router.post('/', validate(createProjectSchema), ProjectController.create);
router.get('/:id/stats', validate(projectIdParamsSchema), ProjectController.getStats);

export default router;
