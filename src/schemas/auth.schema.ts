import z from "zod";

export const registerSchema = z.object({
    body: z.object({
        name: z.string(
             "Name is required."
        ).min(3, "Name must be at least 3 characters long."),
        
        email: z.string(
             "Email is required."
        ).email("Invalid email format."),
        
        password: z.string( "Password is required.").min(6, "Password must be at least 6 characters."),
    }),
    query: z.object({}).optional(),
    params: z.object({}).optional(),

})
