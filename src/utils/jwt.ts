import { env } from "process";

const jwt = require('jsonwebtoken');

type User = {
    id: string
}

export const generateAccessToken = (user: User) => {
    return jwt.sign({userId: user.id}, process.env.JWT_ACCESS_SECRET, {expiresIn: '5m',});
}

export const generateRefreshToken = (user: User, jti: string) => {
    return jwt.sign({userId: user.id, jti}, process.env.JWT_REFRESH_SECRET, {expiresIn: '8h',});
}

export const generateTokens = (user: User, jti: string): {accessToken: string, refreshToken: string} => {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user, jti);

    return {
        accessToken,
        refreshToken
    }
};

export default {
    generateAccessToken,
    generateRefreshToken,
    generateTokens
};