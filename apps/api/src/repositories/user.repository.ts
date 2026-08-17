import { db } from '../db.js';
import { User, UserRole } from '@teamflow/shared';
import { v4 as uuidv4 } from 'uuid';

export class UserRepository {
  static findByEmail(email: string) {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email) as any;
  }

  static findById(id: string) {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as any;
  }

  static create(user: Omit<User, 'id' | 'createdAt'> & { password?: string }) {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO users (id, email, password, name, role)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, user.email, user.password, user.name, user.role);
    return this.findById(id);
  }

  static getAll() {
    const stmt = db.prepare('SELECT id, email, name, role, created_at as createdAt FROM users');
    return stmt.all() as User[];
  }
}
