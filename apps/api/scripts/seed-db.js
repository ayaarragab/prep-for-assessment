import { UserRepository } from '../src/repositories/user.repository.js';
import { ProjectRepository } from '../src/repositories/project.repository.js';
import { TaskRepository } from '../src/repositories/task.repository.js';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('Seeding database...');
  
  // Create users
  const password = await bcrypt.hash('password123', 10);
  const admin = UserRepository.create({
    email: 'admin@teamflow.com',
    password,
    name: 'Admin User',
    role: 'admin'
  });

  const user = UserRepository.create({
    email: 'user@teamflow.com',
    password,
    name: 'Regular User',
    role: 'user'
  });

  // Create project
  const project = ProjectRepository.create({
    name: 'Test Project',
    description: 'A project for testing purposes',
    owner_id: admin.id
  });

  // Add user to project
  ProjectRepository.addMember(project.id, user.id, 'user');

  // Create tasks
  TaskRepository.create({
    projectId: project.id,
    title: 'Setup Environment',
    description: 'Configure the monorepo and install dependencies',
    status: 'done',
    creatorId: admin.id
  });

  TaskRepository.create({
    projectId: project.id,
    title: 'Implement Authentication',
    description: 'Add JWT auth middleware',
    status: 'in-progress',
    assigneeId: user.id,
    creatorId: admin.id
  });

  console.log('Database seeded successfully.');
}

seed().catch(console.error);
