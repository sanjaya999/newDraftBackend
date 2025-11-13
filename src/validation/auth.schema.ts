import { z } from "zod";

export const registerSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    name: z.string().min(2, "Name must be at least 2 characters")
});

export type RegisterBody = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string(),
});

export type LoginBody = z.infer<typeof loginSchema>;
