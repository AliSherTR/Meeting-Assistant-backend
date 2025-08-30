import { z } from "zod";

export const RoleEnum = z.enum(["employee", "employer"]);

export const CreateUserSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8),
  role: RoleEnum,
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Phone must be E.164")
    .optional(),
});

export const LoginUserInput = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a string",
  }),
});

export const UpdateUserSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  role: RoleEnum.optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Phone must be E.164")
    .optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type LoginUserInput = z.infer<typeof LoginUserInput>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
