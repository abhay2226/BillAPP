import jwt from "jsonwebtoken";

const JWT_SECRET=process.env.JWT_SECRET! as string;
const JWT_EXPIRE=Number(process.env.JWT_EXPIRES_IN) || 86400;

if (!JWT_SECRET){
    throw new Error("JWT_SECRET is not set in the environment.");
}

export interface TokenPayload{
    userId: number;
    email: string;
    roleId?: number;
    storeId?: number;
    sessionId?: number;
}

export function signToken(payload:TokenPayload):string{
   return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE });
}

export function verifyToken(token:string):TokenPayload{
    return jwt.verify(token,JWT_SECRET) as TokenPayload;
}

