import { Request, Response, NextFunction } from "express"
import jwt, { JwtPayload } from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

const SECRET = process.env.SECRET

export interface CustomJwtPayload extends JwtPayload {
    id: string;
    username: string;
  }

export interface CustomRequest extends Request {
    user?: CustomJwtPayload
}

export const validateToken = (req: CustomRequest, res: Response, next: NextFunction): void => {
    const token: string | undefined = req.header('authorization')?.split(" ")[1]

    if(!token) {
        res.status(401).json({message: "Access denied, missing token"})
        return
    }

    try {
        const verified = jwt.verify(token, SECRET as string) as CustomJwtPayload
        req.user = verified
        next()
    } catch (error: any) {
        res.status(401).json({message: "Access denied, missing token"})
        return
    }
}