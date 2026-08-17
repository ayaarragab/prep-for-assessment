import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { ProjectRepository } from "../repositories/project.repository.js";
import { ActivityRepository } from "../repositories/activity.repository.js";
import { db } from "../db.js";
import { logger } from "../logger.js";

export class ProjectController {
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const projects = ProjectRepository.findByUserId(req.user!.id);
      res.json(projects);
    } catch (error) {
      logger.error(
        { err: error, route: "GET /api/projects", userId: req.user?.id },
        "Failed to fetch projects",
      );
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const project = ProjectRepository.findById(id);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      res.json(project);
    } catch (error) {
      logger.error(
        {
          err: error,
          route: "GET /api/projects/:id",
          userId: req.user?.id,
          projectId: req.params.id,
        },
        "Failed to fetch project",
      );
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      const { name, description } = req.body;
      const project = ProjectRepository.create({
        name,
        description,
        ownerId: req.user!.id,
      });

      ActivityRepository.create({
        userId: req.user!.id,
        action: "create",
        resourceType: "project",
        resourceId: project.id,
        metadata: JSON.stringify({ name }),
      });

      res.status(201).json(project);
    } catch (error) {
      logger.error(
        { err: error, route: "POST /api/projects", userId: req.user?.id },
        "Failed to create project",
      );
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getStats(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const tasks = db
        .prepare("SELECT * FROM tasks WHERE project_id = ?")
        .all(id) as any[];
      const stats = {
        total: tasks.length,
        todo: tasks.filter((t) => t.status === "todo").length,
        inProgress: tasks.filter((t) => t.status === "in-progress").length,
        done: tasks.filter((t) => t.status === "done").length,
      };

      res.json(stats);
    } catch (error) {
      logger.error(
        {
          err: error,
          route: "GET /api/projects/:id/stats",
          userId: req.user?.id,
          projectId: req.params.id,
        },
        "Failed to fetch project stats",
      );
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
