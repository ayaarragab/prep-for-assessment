import { db } from '../db.js';
import { ActivityLog } from '@teamflow/shared';
import { v4 as uuidv4 } from 'uuid';

export class ActivityRepository {
  static create(log: Omit<ActivityLog, 'id' | 'timestamp'>) {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO activity_logs (id, user_id, action, resource_type, resource_id, metadata)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, log.userId, log.action, log.resourceType, log.resourceId, log.metadata);
    return id;
  }

  static findByProjectId(projectId: string) {
    // This is a bit tricky since activity_logs doesn't have project_id directly
    // Usually we'd want to join or have a project_id column
    // For now, let's just get logs related to the project or its tasks
    const stmt = db.prepare(`
      SELECT * FROM activity_logs 
      WHERE (resource_type = 'project' AND resource_id = ?)
      OR (resource_type = 'task' AND resource_id IN (SELECT id FROM tasks WHERE project_id = ?))
      ORDER BY timestamp DESC
      LIMIT 50
    `);
    return stmt.all(projectId, projectId) as any[];
  }
}
