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

export const AcitvateUserInput = z.object({
  id: z.string({
    required_error: "Token Id is required",
  }),
});

export const ResendtActivationTokenInput = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
});

export const ResetPasswordRequestInput = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
});

export const ResetPasswordInput = z
  .object({
    token: z.string(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ),

    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // This will attach the error to confirmPassword field
  });

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type LoginUserInput = z.infer<typeof LoginUserInput>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

export type ActivateUserInput = z.infer<typeof AcitvateUserInput>;

export type ResendtActivationTokenInput = z.infer<typeof ResendtActivationTokenInput>;

export type ResetPasswordRequestInput = z.infer<typeof ResetPasswordRequestInput>;

export type ResetPasswordInput = z.infer<typeof ResetPasswordInput>;
