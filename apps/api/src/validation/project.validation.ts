import { z } from 'zod';

export const createProjectSchema = z.object({
	body: z.object({
		name: z.string().trim().min(1, { message: 'Name is required' }),
		description: z.string().trim().max(1000).optional()
	})
});

export const projectIdParamsSchema = z.object({
	params: z.object({
		id: z.string().uuid({ message: 'Invalid project ID' })
	})
});
