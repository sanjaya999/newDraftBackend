import type { JwtPayload } from "jsonwebtoken";

export interface CustomJwtPayload extends JwtPayload{
    id: string;
}

declare global{
    namespace Express {
        interface Request {

            user?: any
        }
    }
}