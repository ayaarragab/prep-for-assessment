import { z } from "zod";

const taskStatusSchema = z.enum(["todo", "in-progress", "done", "archived"]);

const taskBaseFields = {
  title: z.string().trim().min(1, { message: "Title is required" }),
  description: z.string().trim().max(2000).optional().nullable(),
  status: taskStatusSchema.optional(),
  assigneeId: z
    .string()
    .uuid({ message: "Invalid assignee ID" })
    .optional()
    .nullable(),
};

export const createTaskSchema = z.object({
  body: z
    .object({
      projectId: z.string().uuid({ message: "Invalid project ID" }),
      ...taskBaseFields,
    })
    .strict(),
});

export const updateTaskSchema = z.object({
  body: z
    .object(taskBaseFields)
    .partial()
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required",
    }),
});

export const taskIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: "Invalid task ID" }),
  }),
});

export const projectIdParamsSchema = z.object({
  params: z.object({
    projectId: z.string().uuid({ message: "Invalid project ID" }),
  }),
});
