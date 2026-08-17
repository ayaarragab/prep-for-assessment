import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router: Router = Router();

router.use(authMiddleware);

router.get('/', ProjectController.getAll);
router.get('/:id', ProjectController.getById);
router.post('/', ProjectController.create);
router.get('/:id/stats', ProjectController.getStats);

export default router;
