import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.middleware.js";
import { createDocumentSchema, getDocumentSchema, shareDocumentSchema } from "../schemas/doc.schema.js";
import { addCollaboratorController, createDocumentController, getDocumentController } from "../api/document.controller.js";
import { authorize } from "../middleware/authorization.js";

const documentRouter = Router();
documentRouter.use(authenticate);

documentRouter.post("/" , authenticate , createDocumentController);
documentRouter.get("/:id" ,authenticate, validate(getDocumentSchema),getDocumentController);
documentRouter.put("/addCol/:docID" , authenticate , validate(shareDocumentSchema), authorize("ADD_COLLABORATOR"),addCollaboratorController)
export default documentRouter;