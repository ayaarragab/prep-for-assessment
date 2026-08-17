import { db } from "../db.js";
import { Project, ProjectMember, UserRole } from "@teamflow/shared";
import { v4 as uuidv4 } from "uuid";

export class ProjectRepository {
  static findById(id: string) {
    const stmt = db.prepare(
      "SELECT id, name, description, owner_id as ownerId, created_at as createdAt FROM projects WHERE id = ?",
    );
    return stmt.get(id) as any;
  }

  static findByUserId(userId: string) {
    const stmt = db.prepare(`
      SELECT p.id, p.name, p.description, p.owner_id as ownerId, p.created_at as createdAt FROM projects p
      JOIN project_members pm ON p.id = pm.project_id
      WHERE pm.user_id = ?
    `);
    return stmt.all(userId) as any[];
  }

  static create(project: Omit<Project, "id" | "createdAt">) {
    const id = uuidv4();
    const createdAt = new Date().toISOString();

    // Prepare statements for transaction
    const insertProject = db.prepare(`
      INSERT INTO projects (id, name, description, owner_id)
      VALUES (?, ?, ?, ?)
    `);

    const insertMember = db.prepare(`
      INSERT INTO project_members (project_id, user_id, role)
      VALUES (?, ?, ?)
    `);

    // Use a transaction to batch both inserts into a single database operation,
    // eliminating the need for a separate SELECT query and reducing round trips
    const transaction = db.transaction(() => {
      insertProject.run(id, project.name, project.description, project.ownerId);
      insertMember.run(id, project.ownerId, "admin");
    });

    transaction();

    // Return constructed object directly without re-querying.
    // The database automatically sets created_at via DEFAULT CURRENT_TIMESTAMP.
    return {
      id,
      name: project.name,
      description: project.description,
      ownerId: project.ownerId,
      createdAt,
    };
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
