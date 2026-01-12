import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import type { IDocumentService } from "../interfaces/index.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { sendResponse } from "../utils/response.js";
import * as docService from "../services/docs.js";
import * as docRepository from "../repository/document.repository.js";

/**
 * DocumentController handles document HTTP endpoints.
 * Follows Single Responsibility Principle: only handles HTTP layer.
 * Follows Dependency Inversion Principle: depends on IDocumentService abstraction.
 */
export class DocumentController {
  constructor(private readonly documentService: IDocumentService) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { title, docType } = req.body;

    const result = await this.documentService.create(userId, {
      title,
      docType,
    });
    return sendResponse(res, StatusCodes.CREATED, {
      data: result.data,
      message: "Document Created",
    });
  });

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const result = await this.documentService.getAll(userId);
    return sendResponse(res, StatusCodes.OK, {
      data: result.data,
      message: "Document fetched success",
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const id = req.params.id as string;

    const result = await this.documentService.getById(id, userId);
    return sendResponse(res, StatusCodes.OK, {
      data: result.data,
      message: "Document fetched success",
    });
  });

  addCollaborator = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const documentId = req.params.docID as string;
    const { email, role } = req.body;

    const result = await this.documentService.addCollaborator(
      documentId,
      userId,
      email,
      role,
    );

    return sendResponse(res, StatusCodes.OK, {
      data: { collaborator: result.data },
      message: "Collaborator added successfully",
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const documentId = req.params.docID!;
    const { title, content } = req.body;

    const result = await this.documentService.update(documentId, { title });

    return sendResponse(res, StatusCodes.OK, {
      data: result.data,
      message: result.message,
    });
  });

  getAllCollaboration = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const result =
      await this.documentService.getAllCollaborationDocuments(userId);
    return sendResponse(res, StatusCodes.OK, {
      data: result.data,
      message: "Document fetched success",
    });
  });

  getCollaborators = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const documentId = req.params.docID!;
    const result = await this.documentService.getCollaborators(documentId);
    return sendResponse(res, StatusCodes.OK, {
      data: result.data,
      message: "Collaborators fetched success",
    });
  });
}

// Backward compatibility exports - these call the imported modules directly
// so that vi.mock() can intercept them in tests
export const createDocumentController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { title, docType } = req.body;

    const result = await docRepository.createDocument(userId, {
      title,
      docType,
    });
    return sendResponse(res, StatusCodes.CREATED, {
      data: result,
      message: "Document Created",
    });
  },
);

export const getAllDocumentController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const result = await docService.getAllDocument(userId);
    return sendResponse(res, StatusCodes.OK, {
      data: result.document,
      message: "Document fetched success",
    });
  },
);

export const getDocumentController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const id = req.params.id!;

    const result = await docService.getDocumentById(id, userId);
    return sendResponse(res, StatusCodes.OK, {
      data: result.document,
      message: "Document fetched success",
    });
  },
);

export const addCollaboratorController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const documentId = req.params.docID!;
    const { email, role } = req.body;

    const result = await docService.addCollaborator(
      documentId,
      userId,
      email,
      role,
    );

    return sendResponse(res, StatusCodes.OK, {
      data: result,
      message: "Collaborator added successfully",
    });
  },
);

export const updateDocumentController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const documentId = req.params.docID!;
    const { title, content } = req.body;

    const result = await docService.updateDocumentService(
      { title },
      documentId,
    );

    return sendResponse(res, StatusCodes.OK, {
      data: result.document,
      message: result.message,
    });
  },
);

export const getAllCollaborationDocumentController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const result = await docService.getAllCollaborationDocument(userId);
    return sendResponse(res, StatusCodes.OK, {
      data: result.documents,
      message: "Document fetched success",
    });
  },
);

export const getAllCollaborators = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const documentId = req.params.docID!;
    const result = await docService.getDocumentCollaboratorsService(documentId);
    return sendResponse(res, StatusCodes.OK, {
      data: result.collaborators,
      message: "Collaborators fetched success",
    });
  },
);
