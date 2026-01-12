import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createDocumentSchema,
  getDocumentSchema,
  shareDocumentSchema,
  updateDocumentSchema,
} from "../schemas/doc.schema.js";
import { authorize } from "../middleware/authorization.js";
import { container, DEPS } from "../infrastructure/container.js";
import type { DocumentController } from "../api/document.controller.js";

/**
 * Creates the document router with DI-injected controller.
 * Follows Dependency Inversion Principle.
 */
export function createDocumentRouter(): Router {
  const docController = container.get<DocumentController>(
    DEPS.DOCUMENT_CONTROLLER,
  );
  const router = Router();

  router.use(authenticate);

  router.post("/", docController.create);
  router.get("/collaboration", docController.getAllCollaboration);
  router.get(
    "/collaborators/:docID",
    authorize("READ_DOCUMENT"),
    docController.getCollaborators,
  );
  router.get("/:id", validate(getDocumentSchema), docController.getById);
  router.get("/", docController.getAll);
  router.put(
    "/addCol/:docID",
    validate(shareDocumentSchema),
    authorize("ADD_COLLABORATOR"),
    docController.addCollaborator,
  );
  router.put(
    "/upDocs/:docID",
    validate(updateDocumentSchema),
    authorize("UPDATE_DOCUMENT"),
    docController.update,
  );

  return router;
}

// Default export for backward compatibility during transition
const documentRouter = Router();
documentRouter.use(authenticate);

let initialized = false;
documentRouter.use((req, res, next) => {
  if (!initialized) {
    const controller = container.get<DocumentController>(
      DEPS.DOCUMENT_CONTROLLER,
    );
    documentRouter.post("/", controller.create);
    documentRouter.get("/collaboration", controller.getAllCollaboration);
    documentRouter.get(
      "/collaborators/:docID",
      authorize("READ_DOCUMENT"),
      controller.getCollaborators,
    );
    documentRouter.get("/:id", validate(getDocumentSchema), controller.getById);
    documentRouter.get("/", controller.getAll);
    documentRouter.put(
      "/addCol/:docID",
      validate(shareDocumentSchema),
      authorize("ADD_COLLABORATOR"),
      controller.addCollaborator,
    );
    documentRouter.put(
      "/upDocs/:docID",
      validate(updateDocumentSchema),
      authorize("UPDATE_DOCUMENT"),
      controller.update,
    );
    initialized = true;
  }
  next();
});

export default documentRouter;
