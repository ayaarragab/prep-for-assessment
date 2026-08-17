import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { TaskRepository } from '../repositories/task.repository.js';
import { ActivityRepository } from '../repositories/activity.repository.js';
import { ProjectRepository } from '../repositories/project.repository.js';

export class TaskController {
  static async getByProject(req: AuthRequest, res: Response) {
    try {
      const { projectId } = req.params;
      
      // Check membership
      const members = ProjectRepository.getMembers(projectId);
      if (!members.find(m => m.id === req.user!.id)) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const tasks = TaskRepository.findByProjectId(projectId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      const { projectId, title, description, status, assigneeId } = req.body;
      
      const task = TaskRepository.create({
        projectId,
        title,
        description,
        status: status || 'todo',
        assigneeId,
        creatorId: req.user!.id
      });

      ActivityRepository.create({
        userId: req.user!.id,
        action: 'create',
        resourceType: 'task',
        resourceId: task.id,
        metadata: JSON.stringify({ title })
      });

      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const task = TaskRepository.update(id, updates);
      
      ActivityRepository.create({
        userId: req.user!.id,
        action: 'update',
        resourceType: 'task',
        resourceId: id,
        metadata: JSON.stringify(updates)
      });

      res.json(task);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
