import { db } from '../db.js';
import { Task, TaskStatus } from '@teamflow/shared';
import { v4 as uuidv4 } from 'uuid';

export class TaskRepository {
  static findById(id: string) {
    const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    return stmt.get(id) as any;
  }

  static findByProjectId(projectId: string) {
    const stmt = db.prepare('SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC');
    return stmt.all(projectId) as any[];
  }

  static create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO tasks (id, project_id, title, description, status, assignee_id, creator_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, task.projectId, task.title, task.description, task.status, task.assigneeId, task.creatorId);
    return this.findById(id);
  }

  static update(id: string, updates: Partial<Task>) {
    const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = Object.values(updates);
    const stmt = db.prepare(`UPDATE tasks SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(...values, id);
    return this.findById(id);
  }

  static search(query: string) {
    const stmt = db.prepare('SELECT * FROM tasks WHERE title LIKE ? OR description LIKE ?');
    return stmt.all(`%${query}%`, `%${query}%`) as any[];
  }
}
