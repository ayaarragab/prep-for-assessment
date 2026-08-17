import { db } from "../db.js";
import { Task, TaskStatus } from "@teamflow/shared";
import { v4 as uuidv4 } from "uuid";

export class TaskRepository {
  static findById(id: string) {
    const stmt = db.prepare(
      "SELECT id, project_id as projectId, title, description, status, assignee_id as assigneeId, creator_id as creatorId, created_at as createdAt, updated_at as updatedAt FROM tasks WHERE id = ?",
    );
    return stmt.get(id) as any;
  }

  static findByProjectId(projectId: string) {
    const stmt = db.prepare(
      "SELECT id, project_id as projectId, title, description, status, assignee_id as assigneeId, creator_id as creatorId, created_at as createdAt, updated_at as updatedAt FROM tasks WHERE project_id = ? ORDER BY created_at DESC",
    );
    return stmt.all(projectId) as any[];
  }

  static create(task: Omit<Task, "id" | "createdAt" | "updatedAt">) {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO tasks (id, project_id, title, description, status, assignee_id, creator_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      task.projectId,
      task.title,
      task.description,
      task.status,
      task.assigneeId,
      task.creatorId,
    );
    return this.findById(id);
  }

  static update(id: string, updates: Partial<Task>) {
    const fieldMap: Record<
      keyof Pick<Task, "title" | "description" | "status" | "assigneeId">,
      string
    > = {
      title: "title",
      description: "description",
      status: "status",
      assigneeId: "assignee_id",
    };

    const entries = Object.entries(updates).filter(
      ([, value]) => value !== undefined,
    );
    const invalidFields = entries
      .map(([key]) => key)
      .filter((key): key is string => !(key in fieldMap));

    if (invalidFields.length > 0) {
      throw new Error(
        `Unsupported task update fields: ${invalidFields.join(", ")}`,
      );
    }

    const fields = entries
      .map(([key]) => `${fieldMap[key as keyof typeof fieldMap]} = ?`)
      .join(", ");

    if (!fields) {
      throw new Error("No valid task update fields provided");
    }

    const values = entries.map(([, value]) => value);
    const stmt = db.prepare(
      `UPDATE tasks SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    );
    stmt.run(...values, id);
    return this.findById(id);
  }

  static search(query: string) {
    const stmt = db.prepare(
      "SELECT id, project_id as projectId, title, description, status, assignee_id as assigneeId, creator_id as creatorId, created_at as createdAt, updated_at as updatedAt FROM tasks WHERE title LIKE ? OR description LIKE ? ORDER BY created_at DESC",
    );
    return stmt.all(`${query}%`, `${query}%`) as any[];
  }
}
