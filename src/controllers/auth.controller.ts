import { NextFunction, Request, Response } from "express";
import { findUserByEmail, createUserByEmailAndPassword, getUserById, loadUser, findUserByUsername } from '../services/user.services';
import { generateTokens } from '../utils/jwt';
import { v4 as uuidv4 } from 'uuid';
import { addRefreshTokenToWhitelist, deleteRefreshToken, getRefreshTokenById, revokeTokens} from "../services/auth.services";
import bcrypt from 'bcrypt';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import hashToken from "../utils/hashToken";
import { schema } from "../utils/helpers";

const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, password, username} = req.body;

        if (!email || !password) {
            const error = new Error("You must provide an email, password and username.")
            res.status(400).json({ error: error.message });
            throw error;
        };

        const existingUser = await findUserByEmail(email);


        if (existingUser) {
            const error = new Error("Email already in use.")
            res.status(400).json({ error: error.message });
            throw error;
        }
        const exisitngUsername = await findUserByUsername(username);
        if (exisitngUsername) {
            const error = new Error("Username already in use.")
            res.status(400).json({ error: error.message });
            throw error;   
        }
        if (!schema.validate(password)) {
            const error = new Error("Invalid password.")
            res.status(400).json({ error: error.message });
            throw error; 
        }
        const user = await createUserByEmailAndPassword({email, password, username});
        const jti = uuidv4();
        const { accessToken, refreshToken } = generateTokens(user, jti);
        await addRefreshTokenToWhitelist({ jti, refreshToken, userId: user.id });
        res.status(200).json({
            accessToken,
            refreshToken,
        });
    } catch (e) {
        next(e);
    };
};

const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, password} = req.body;

        if (!email || !password) {
            const error = new Error("You must provide an email and password.")
            res.status(400).json({ error: error.message });
            throw error;
        };

        const existingUser = await findUserByEmail(email);

        if (!existingUser) {
            const error = new Error("Invalid login credentials.")
            res.status(403).json({ error: error.message });
            throw error;        }

        if (existingUser) {
            const validPassword = await bcrypt.compare(password, existingUser.password);
            if (!validPassword) {
                const error = new Error("Invalid login credentials.")
                res.status(403).json({ error: error.message });
                throw error;
                
            }

            const jti = uuidv4();
            const { accessToken, refreshToken } = generateTokens(existingUser, jti);
            await addRefreshTokenToWhitelist( { jti, refreshToken, userId: existingUser.id } );

            res.status(200).json({
                accessToken,
                refreshToken,
                userId: existingUser.id,
            });
        } else {
            const error = new Error('Could not log in.')
            res.status(500).json({ error: error.message });
            throw error;
        };

    } catch (e) {
        next(e);
    };
};

const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            const error = new Error("Missing refresh token.")
            res.status(400).json({ error: error.message });
            throw error;
        }

        const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as Secret) as JwtPayload & {userId: string};
        if (payload.jti) {
            const savedRefreshToken = await getRefreshTokenById(payload.jti);
            if (!savedRefreshToken || savedRefreshToken.revoked === true) {
                const error = new Error("Unauthorised.")
                res.status(401).json({ error: error.message });
                throw error;            
            }

            const hashedToken = hashToken(refreshToken);
            if (hashedToken !== savedRefreshToken.hashedToken) {
                const error = new Error("Unauthorised.")
                res.status(401).json({ error: error.message });
                throw error;       
            }

            const user = await getUserById(payload.userId);
            if (!user) {
                const error = new Error("Unauthorised.")
                res.status(401).json({ error: error.message });
                throw error;    
            }

            await deleteRefreshToken(savedRefreshToken.id);
            const jti = uuidv4();
            const { accessToken, refreshToken: newRefreshToken } = generateTokens(user, jti);
            await addRefreshTokenToWhitelist( { jti, refreshToken: newRefreshToken, userId: user.id});

            res.status(200).json({
                accessToken,
                refreshToken: newRefreshToken,
            });
        } else {
            const error = new Error("Could not refresh token.")
            res.status(500).json({ error: error.message });
            throw error;
        }

    } catch (e) {
        next(e);
    }
};

const auth = async (req: Request, res: Response, next: NextFunction) => {
        
        try {
        
        const { authorization } = req.headers;
        
        if (!authorization) {
            const error = new Error("Unauthorized.");
            res.status(401).json({error: error.message});
            throw error;
        }
    
        try {
            const token = authorization.split(' ')[1];
            const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET as Secret) as JwtPayload & {userId: string};
            const user = await loadUser(payload.userId);
            res.status(200).json({authenticated: true, userId: payload.userId, user});
        } catch (e: any) {
            res.status(401).json({error: e.message});
            throw e;
        }
    } catch (e: any) {
        next();
    }
};

const revokeToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user_id } = req.params;
        await revokeTokens(user_id);
        res.status(200).json("Success");
    }  catch (e: any) {
    next();
}
};

export default {
    registerUser,
    login,
    refreshToken,
    auth,
    revokeToken,
};
