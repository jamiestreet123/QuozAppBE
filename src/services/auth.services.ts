import { prisma } from '../server';
import hashToken from '../utils/hashToken';

type Token = {
    jti: string;
    refreshToken: string;
    userId: string;
}

export const addRefreshTokenToWhitelist = ( token: Token ) => {
    return prisma.refreshToken.create({
        data: {
            id: token.jti,
            hashedToken: hashToken(token.refreshToken),
            userId: token.userId,
        }
    });
};

export const getRefreshTokenById = (id: string) => {
    return prisma.refreshToken.findUnique({
        where: {
            id,
        },
    });
};

export const deleteRefreshToken = (id: string) => {
    return prisma.refreshToken.update({
        where: {
            id,
        },
        data: {
            revoked: true,
        }
    });
};

export const revokeTokens = (userId: string) => {
    return prisma.refreshToken.updateMany({
        where: {
            userId,
        },
        data: {
            revoked: true,
        }
    });
};

export default {
    addRefreshTokenToWhitelist, getRefreshTokenById, deleteRefreshToken, revokeTokens
}
