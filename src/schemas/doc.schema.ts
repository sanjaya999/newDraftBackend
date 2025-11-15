import z from "zod";

export const createDocumentSchema = z.object({
  body: z.object({
    title: z.string(),
    content: z.any().optional(),
  }),
});

export const updateDocumentSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    content: z.any().optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
});

export const getDocumentSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const shareDocumentSchema = z.object({
  body: z.object({
    email: z.string().email(),
    role: z.enum(["VIEWER", "EDITOR"]),
  })
});

export const removeCollaboratorSchema = z.object({
  params: z.object({
    id: z.string(),
    permissionId: z.string(),
  }),
});

