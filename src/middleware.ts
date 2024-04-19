import { Request, Response, NextFunction } from "express";
import jwt, {Secret} from 'jsonwebtoken';
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    
    const { authorization } = req.headers;

    if (!authorization) {
        const error = new Error("Unauthorized.");
        res.status(401).json({error});
        throw error;
    }

    try {
        const token = authorization.split(' ')[1];
        jwt.verify(token, process.env.JWT_ACCESS_SECRET as Secret);
    } catch (e: any) {
        res.status(401).json({error: e.message});
        throw e;
    }

    return next();
}

export default {
    isAuthenticated
};