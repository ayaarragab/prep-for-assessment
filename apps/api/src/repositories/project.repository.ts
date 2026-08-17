import { db } from '../db.js';
import { Project, ProjectMember, UserRole } from '@teamflow/shared';
import { v4 as uuidv4 } from 'uuid';

export class ProjectRepository {
  static findById(id: string) {
    const stmt = db.prepare('SELECT * FROM projects WHERE id = ?');
    return stmt.get(id) as any;
  }

  static findByUserId(userId: string) {

    const stmt = db.prepare(`
      SELECT p.* FROM projects p
      JOIN project_members pm ON p.id = pm.project_id
      WHERE pm.user_id = ?
    `);
    return stmt.all(userId) as any[];
  }

  static create(project: Omit<Project, 'id' | 'createdAt'>) {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO projects (id, name, description, owner_id)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(id, project.name, project.description, project.ownerId);
    
    // Add owner as admin member
    this.addMember(id, project.ownerId, 'admin');
    
    return this.findById(id);
  }

  static addMember(projectId: string, userId: string, role: UserRole) {
    const stmt = db.prepare(`
      INSERT INTO project_members (project_id, user_id, role)
      VALUES (?, ?, ?)
    `);
    stmt.run(projectId, userId, role);
  }

  static getMembers(projectId: string) {
    const stmt = db.prepare(`
      SELECT u.id, u.email, u.name, pm.role
      FROM users u
      JOIN project_members pm ON u.id = pm.user_id
      WHERE pm.project_id = ?
    `);
    return stmt.all(projectId) as any[];
  }
}
