import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository.js';
import { AuthResponse, User } from '@teamflow/shared';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export class AuthService {
  static async register(email: string, password: string, name: string): Promise<AuthResponse> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = UserRepository.create({
      email,
      password: hashedPassword,
      name,
      role: 'user'
    });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    return { user, token };
  }

  static async login(email: string, password: string): Promise<AuthResponse | null> {
    const user = UserRepository.findByEmail(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }
}
