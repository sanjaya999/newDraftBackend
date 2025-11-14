import type { ZodError } from "zod";

export const validationError = (error: ZodError):string=>{
    const validationErrors = error.issues.map(issue => {
        const path = issue.path.join(".");
        return `${issue.message}`
    }).join(" | ")
    return `${validationErrors}`
}