import { NextFunction, Request, Response } from "express";
import { prisma } from "../server";
import { createLeaderboard, validateLeaderbaord, findLeaderboardById, leaderBoardTypeToDates, userNotInLeaderboard, addUserToRequests, userHasRequested, adminHasRights, addUserToLeaderboard, makeUserAdmin, userInLeaderboard, removeUserFromLeaderboard, getUserLeaderboards, findLeaderboardByCode, findLeaderboardByIdAdmin, toggleIsPublic, rejectUserRequest, removeAdminStatus } from "../services/leaderboard.services";

const postLeaderboard = async (req: Request, res: Response) => {

    try {
        const { body } = req;

        if (validateLeaderbaord(body)){

            const newLeaderboard = await createLeaderboard(body);
            res.status(200).json(newLeaderboard);
        } else {
            res.status(400).json({error: new Error("Leaderboard is invalid")});
        }
    } catch (e) {
        res.status(500).json({ error: e })
    }
};

const getLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { params } = req;
        const id = params.leaderboard_id;
        const type = params.type || undefined;
        const { startDate } = leaderBoardTypeToDates(type);
        const leaderboard = await findLeaderboardById({id, startDate});
        if (leaderboard) {
            res.status(200).json(leaderboard);
        } else {
            
            const error = new Error('No leaderboard found');
            res.status(404).json({ error: error.message });
        }
    } catch (e) {
        next()
    }
};

const getLeaderboardAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { params } = req;
        const id = params.leaderboard_id;
        const type = params.type || undefined;
        const leaderboard = await findLeaderboardByIdAdmin(id);
        if (leaderboard) {
            res.status(200).json(leaderboard);
        } else {
            
            const error = new Error('No leaderboard found');
            res.status(404).json({ error: error.message });
        }
    } catch (e) {
        next()
    }
};

const requestLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { body } = req;
        const { code, user_id } = body;
        const validCode = await findLeaderboardByCode(code);
        if (validCode){
            const validUser = await userNotInLeaderboard(validCode.id, user_id);
            if (validUser){
                if (validCode.isPublic){
                    const result = await addUserToLeaderboard(validCode.id, user_id);
                    res.status(200).json(result); 
                } else {
                    const result = await addUserToRequests(validCode.id, user_id);
                    res.status(200).json(result);
                }
            } else {
                const error = new Error('User already in leaderboard or has requested');
                res.status(409).json({ error: error.message });
            }
        } else {
                const error = new Error('Code not found');
                res.status(409).json({ error: error.message });
            }
    } catch (e) {
        next()
    }
};

const acceptLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { body } = req;
        const { leaderboard_id, user_id, admin_id } = body;
        const isAdmin = await adminHasRights(leaderboard_id, admin_id);
        if (isAdmin){
            const validUser = await userHasRequested(leaderboard_id, user_id);
            if (validUser){
                const result = await addUserToLeaderboard(leaderboard_id, user_id);
                res.status(200).json(result);
            } else {
                const error = new Error('User already in leaderboard or has not requested');
                res.status(409).json({ error: error.message });
            }
        } else {
            const error = new Error('No admin rights');
            res.status(401).json({ error: error.message });
        }
    } catch (e) {
        next()
    }
};

const makeAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { body } = req;
        const { leaderboard_id, user_id, admin_id } = body;
        const isAdmin = await adminHasRights(leaderboard_id, admin_id);
        if (isAdmin){
            const validUser = await userInLeaderboard(leaderboard_id, user_id);
            if (validUser){
                const result = await makeUserAdmin(leaderboard_id, user_id);
                res.status(200).json(result);
            } else {
                const error = new Error('User not in leaderboard');
                res.status(409).json({ error: error.message });
            }
        } else {
            const error = new Error('No admin rights');
            res.status(401).json({ error: error.message });
        }
    } catch (e) {
        next()
    }
};

const removeUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { body } = req;
        const { leaderboard_id, user_id, admin_id } = body;
        const isAdmin = await adminHasRights(leaderboard_id, admin_id);
        if (isAdmin){
            const validUser = await userInLeaderboard(leaderboard_id, user_id);
            if (validUser){
                const result = await removeUserFromLeaderboard(leaderboard_id, user_id);
                res.status(200).json(result);
            } else {
                const error = new Error('User not in leaderboard');
                res.status(409).json({ error: error.message });
            }
        } else {
            const error = new Error('No admin rights');
            res.status(401).json({ error: error.message });
        }
    } catch (e) {
        next()
    }
};

const userLeaderboards = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { params } = req;
        const { user_id } = params;
        const result = await getUserLeaderboards(user_id);
        res.status(200).json(result);
    } catch (e) {
        next()
    }
}

const toggleAccess = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { body } = req;
        const { isPublic, leaderboard_id, admin_id } = body;
        const isAdmin = await adminHasRights(leaderboard_id, admin_id);
        if (isAdmin){
            const result = await toggleIsPublic(leaderboard_id, isPublic);
            res.status(200).json(result);
        } else {
            const error = new Error('No admin rights');
            res.status(401).json({ error: error.message });
        }
    } catch (e) {
        next()
    }
}

const rejectRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { body } = req;
        const { leaderboard_id, user_id, admin_id } = body;
        const isAdmin = await adminHasRights(leaderboard_id, admin_id);
        if (isAdmin){
            const validUser = await userHasRequested(leaderboard_id, user_id);
            if (validUser){
                await rejectUserRequest(leaderboard_id, user_id);
                res.status(200).json("Success");
            } else {
                const error = new Error('User already in leaderboard or has not requested');
                res.status(409).json({ error: error.message });
            }
        } else {
            const error = new Error('No admin rights');
            res.status(401).json({ error: error.message });
        }
    } catch (e) {
        next()
    }
};

const removeAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { body } = req;
        const { leaderboard_id, user_id, admin_id } = body;
        const isAdmin = await adminHasRights(leaderboard_id, admin_id);
        if (isAdmin){
            const validAdmin = await adminHasRights(leaderboard_id, user_id);
            if (validAdmin){
                const result = await removeAdminStatus(leaderboard_id, user_id);
                res.status(200).json(result);
            } else {
                const error = new Error('User not an admin');
                res.status(409).json({ error: error.message });
            }
        } else {
            const error = new Error('No admin rights');
            res.status(401).json({ error: error.message });
        }
    } catch (e) {
        next()
    }
};

const leaveLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { body } = req;
        const { leaderboard_id, user_id } = body;
        const validUser = await userInLeaderboard(leaderboard_id, user_id);
            if (validUser){
                await removeUserFromLeaderboard(leaderboard_id, user_id);
                res.status(200).json("Success");
            } else {
                const error = new Error('User not in leaderboard');
                res.status(409).json({ error: error.message });
            }
    } catch (e) {
        next()
    }
};

export default {
    postLeaderboard,
    getLeaderboard,
    getLeaderboardAdmin,
    requestLeaderboard,
    acceptLeaderboard,
    makeAdmin,
    removeUser,
    userLeaderboards,
    toggleAccess,
    rejectRequest,
    removeAdmin,
    leaveLeaderboard,
}
