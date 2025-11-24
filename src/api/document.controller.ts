import { asyncHandler } from "../middleware/asyncHandler.js";
import type{ Request, Response } from "express";
import { createDocument, upsertDocumentPermission } from "../repository/document.repository.js";
import { sendResponse } from "../utils/response.js";
import { StatusCodes } from "http-status-codes";
import { addCollaborator, getDocumentById, updateDocumentService, getAllDocument, getAllCollaborationDocument, getDocumentCollaboratorsService } from "../services/docs.js";

export const createDocumentController = asyncHandler(async(req: Request, res:Response)=>{
    const userId = req.user?.id;
    const { title, docType } = req.body;

    const result = await createDocument(userId, {
        title,
        docType,
    });
    return sendResponse(res, StatusCodes.CREATED, {
        data: result,
        message:"Document Created"
    })
})
export const getAllDocumentController = asyncHandler(async(req:Request , res:Response)=>{
    const userId = req.user.id;

    const result = await getAllDocument(userId);
    return sendResponse(res, StatusCodes.OK,{
        data: result.document,
        message:"Document fetched success"
    })
})

export const getDocumentController = asyncHandler(async(req:Request , res:Response)=>{
    const userId = req.user.id;
    const  id = req.params.id!;

    const result = await getDocumentById(id , userId);
    return sendResponse(res, StatusCodes.OK,{
        data: result.document,
        message:"Document fetched success"
    })
})

export const addCollaboratorController = asyncHandler(async(req: Request, res: Response)=>{
    const userId = req.user.id;
    const documentId = req.params.docID!;
    const {email , role} = req.body;

    const result = await addCollaborator(
        documentId,
        userId,
        email,
        role
    )

    return sendResponse(res, StatusCodes.OK,{
        data:result,
        message:"Collaborator added successfully"
    })

}) 

export const updateDocumentController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const documentId  = req.params.docID!;
    const { title, content } = req.body;

    const result = await updateDocumentService({
      title,
      // content,
    }, documentId);

    return sendResponse(res, StatusCodes.OK, {
      data: result.document,
      message:result.message,
    });
  }
);

export const getAllCollaborationDocumentController = asyncHandler(async(req:Request , res:Response)=>{
    const userId = req.user.id;
    const result = await getAllCollaborationDocument(userId);
    return sendResponse(res, StatusCodes.OK,{
        data: result.documents,
        message:"Document fetched success"
    })
})

export const getAllCollaborators = asyncHandler(async(req:Request , res:Response)=>{
    const userId = req.user.id;
    const documentId = req.params.docID!;
    const result = await getDocumentCollaboratorsService(documentId);
    return sendResponse(res, StatusCodes.OK,{
        data: result.collaborators,
        message:"Collaborators fetched success"
    })
})
