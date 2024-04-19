import brcypt from 'bcrypt';
import {prisma} from '../server';
import { createHash, randomBytes } from 'crypto';

type User = {
    email: string;
    password: string;
    username: string;
}

export const findUserByEmail = (email: string) => {
    return prisma.user.findUnique({where: {email}});
};

export const findUserByUsername = (username: string) => {
    return prisma.user.findUnique({where: {username}})
}

export const createUserByEmailAndPassword = (user: User) => {
    user.password = brcypt.hashSync(user.password, 12);
    return prisma.user.create({
        data: user
    });
};

export const getUserById = (id: string) => {
    return prisma.user.findUnique({
        where: {
            id,
        }
    });
};

export const loadUser = (id: string) => {
    return prisma.user.findUnique({
        where: {
            id: id
        },
        select: {
            id: true,
            username: true,
        }
    })
}

export const passwordResetCreateToken = (id: string, token: string, expiry: number) => {

    return prisma.passwordResetToken.create({
        data: {
            userId: id,
            token: token,
            tokenExpiry: expiry
        }
    })
}

export const checkPasswordResetTokenValid = (id: string) => {
    return prisma.passwordResetToken.findFirst({
        where: {
            userId: id,
            tokenExpiry: {
                gte: Date.now()
            }
        }
    });
};

export const resetUserPassword = async (id: string, password: string) => {
    const newPassword = await brcypt.hash(password, 12);
    return prisma.user.update({
        where: {
            id: id,
        },
        data: {
            password: newPassword,
        }
    });
};

export const deletePasswordResetToken = (id: string) => {
    return prisma.passwordResetToken.delete({
        where: {
            id: id
        }
    })
};

export default {
    findUserByEmail, getUserById, createUserByEmailAndPassword
};