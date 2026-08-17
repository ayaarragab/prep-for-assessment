import { Router } from 'express';
import { TaskController } from '../controllers/task.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router: Router = Router();

router.use(authMiddleware);

router.get('/project/:projectId', TaskController.getByProject);
router.post('/', TaskController.create);
router.patch('/:id', TaskController.update);

export default router;
