import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { TaskRepository } from "../repositories/task.repository.js";
import { ActivityRepository } from "../repositories/activity.repository.js";
import { ProjectRepository } from "../repositories/project.repository.js";
import { logger } from "../logger.js";

export class TaskController {
  static async getByProject(req: AuthRequest, res: Response) {
    try {
      const { projectId } = req.params;

      // Check membership
      const members = ProjectRepository.getMembers(projectId);
      if (!members.find((m) => m.id === req.user!.id)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const tasks = TaskRepository.findByProjectId(projectId);
      res.json(tasks);
    } catch (error) {
      logger.error(
        {
          err: error,
          route: "GET /api/tasks/project/:projectId",
          userId: req.user?.id,
          projectId: req.params.projectId,
        },
        "Failed to fetch tasks for project",
      );
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      const { projectId, title, description, status, assigneeId } = req.body;
      const project = ProjectRepository.findById(projectId);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const members = ProjectRepository.getMembers(projectId);

      if (!members.find((member) => member.id === req.user!.id)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      if (assigneeId && !members.find((member) => member.id === assigneeId)) {
        return res.status(400).json({ message: "Invalid assignee" });
      }

      const task = TaskRepository.create({
        projectId,
        title,
        description,
        status: status || "todo",
        assigneeId,
        creatorId: req.user!.id,
      });

      ActivityRepository.create({
        userId: req.user!.id,
        action: "create",
        resourceType: "task",
        resourceId: task.id,
        metadata: JSON.stringify({ title }),
      });

      res.status(201).json(task);
    } catch (error) {
      logger.error(
        {
          err: error,
          route: "POST /api/tasks",
          userId: req.user?.id,
          projectId: req.body?.projectId,
        },
        "Failed to create task",
      );
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const task = TaskRepository.findById(id);

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const members = ProjectRepository.getMembers(task.project_id);

      if (!members.find((member) => member.id === req.user!.id)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const updatedTask = TaskRepository.update(id, updates);

      ActivityRepository.create({
        userId: req.user!.id,
        action: "update",
        resourceType: "task",
        resourceId: id,
        metadata: JSON.stringify(updates),
      });

      res.json(updatedTask);
    } catch (error) {
      logger.error(
        {
          err: error,
          route: "PATCH /api/tasks/:id",
          userId: req.user?.id,
          taskId: req.params.id,
        },
        "Failed to update task",
      );
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
