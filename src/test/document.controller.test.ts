import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createDocumentController,
  getAllDocumentController,
  getDocumentController,
  addCollaboratorController,
  updateDocumentController,
  getAllCollaborationDocumentController,
  getAllCollaborators,
} from "../api/document.controller.js";
import * as docRepository from "../repository/document.repository.js";
import * as docService from "../services/docs.js";
import { StatusCodes } from "http-status-codes";

vi.mock("../repository/document.repository.js", () => ({
  createDocument: vi.fn(),
  upsertDocumentPermission: vi.fn(),
}));

vi.mock("../services/docs.js", () => ({
  addCollaborator: vi.fn(),
  getDocumentById: vi.fn(),
  updateDocumentService: vi.fn(),
  getAllDocument: vi.fn(),
  getAllCollaborationDocument: vi.fn(),
  getDocumentCollaboratorsService: vi.fn(),
}));

describe("Document Controller", () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {
      user: { id: "user-123" },
      body: {},
      params: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    vi.clearAllMocks();
  });

  describe("createDocumentController", () => {
    it("should create a document", async () => {
      const mockDoc = { id: "doc-1", title: "New Doc", ownerId: "user-123" };
      req.body = { title: "New Doc", docType: "text" };
      (docRepository.createDocument as any).mockResolvedValue(mockDoc);

      await createDocumentController(req, res, () => {});

      expect(docRepository.createDocument).toHaveBeenCalledWith("user-123", {
        title: "New Doc",
        docType: "text",
      });
      expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Document Created",
        data: mockDoc,
      });
    });
  });

  describe("getAllDocumentController", () => {
    it("should fetch all documents for a user", async () => {
      const mockDocs = [{ id: "doc-1", title: "Doc 1" }];
      (docService.getAllDocument as any).mockResolvedValue({
        document: mockDocs,
      });

      await getAllDocumentController(req, res, () => {});

      expect(docService.getAllDocument).toHaveBeenCalledWith("user-123");
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Document fetched success",
        data: mockDocs,
      });
    });
  });

  describe("getDocumentController", () => {
    it("should fetch a document by ID", async () => {
      const mockDoc = { id: "doc-1", title: "Doc 1" };
      req.params.id = "doc-1";
      (docService.getDocumentById as any).mockResolvedValue({
        document: mockDoc,
      });

      await getDocumentController(req, res, () => {});

      expect(docService.getDocumentById).toHaveBeenCalledWith(
        "doc-1",
        "user-123",
      );
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Document fetched success",
        data: mockDoc,
      });
    });
  });

  describe("addCollaboratorController", () => {
    it("should add a collaborator", async () => {
      const mockResult = {
        collaborator: {
          id: "user-456",
          email: "test@test.com",
          role: "EDITOR",
        },
      };
      req.params.docID = "doc-1";
      req.body = { email: "test@test.com", role: "EDITOR" };
      (docService.addCollaborator as any).mockResolvedValue(mockResult);

      await addCollaboratorController(req, res, () => {});

      expect(docService.addCollaborator).toHaveBeenCalledWith(
        "doc-1",
        "user-123",
        "test@test.com",
        "EDITOR",
      );
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Collaborator added successfully",
        data: mockResult,
      });
    });
  });

  describe("updateDocumentController", () => {
    it("should update a document", async () => {
      const mockDoc = { id: "doc-1", title: "Updated Title" };
      req.params.docID = "doc-1";
      req.body = { title: "Updated Title" };
      (docService.updateDocumentService as any).mockResolvedValue({
        document: mockDoc,
        message: "Updated",
      });

      await updateDocumentController(req, res, () => {});

      expect(docService.updateDocumentService).toHaveBeenCalledWith(
        { title: "Updated Title" },
        "doc-1",
      );
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Updated",
        data: mockDoc,
      });
    });
  });

  describe("getAllCollaborationDocumentController", () => {
    it("should fetch collaboration documents", async () => {
      const mockDocs = [{ id: "doc-2", title: "Shared Doc" }];
      (docService.getAllCollaborationDocument as any).mockResolvedValue({
        documents: mockDocs,
      });

      await getAllCollaborationDocumentController(req, res, () => {});

      expect(docService.getAllCollaborationDocument).toHaveBeenCalledWith(
        "user-123",
      );
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Document fetched success",
        data: mockDocs,
      });
    });
  });

  describe("getAllCollaborators", () => {
    it("should fetch all collaborators for a document", async () => {
      const mockCollabs = [{ id: "user-456", email: "test@test.com" }];
      req.params.docID = "doc-1";
      (docService.getDocumentCollaboratorsService as any).mockResolvedValue({
        collaborators: mockCollabs,
      });

      await getAllCollaborators(req, res, () => {});

      expect(docService.getDocumentCollaboratorsService).toHaveBeenCalledWith(
        "doc-1",
      );
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Collaborators fetched success",
        data: mockCollabs,
      });
    });
  });
});
