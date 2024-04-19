import { next } from "cheerio/lib/api/traversing";
import { NextFunction, Request, Response } from "express";
import { findUserScoreForDate, createScore, updateScore, findRecentScoresByUserId, getWeeklyScore, getMonthlyScore, getAllTimeScore } from "../services/score.services";
import { dateFormatter } from "../utils/helpers";

const postScore = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { body } = req;

        const { userId, date, score } = body;

        if (!date) {
            const error = new Error("No date provided. Score could not be posted.")
            res.status(400).json({ error: error.message });
            throw error;
        }

        if (!userId) {
            const error = new Error("No user provided. Score could not be posted.")
            res.status(400).json({ error: error.message });
            throw error;
        }

        if (score === null || score === undefined) {
            const error = new Error("No score provided. Score could not be posted.")
            res.status(400).json({ error: error.message });
            throw error;   
        }

        const alreadyPosted = await findUserScoreForDate({ date, userId });

        if (alreadyPosted) {
            const updatedScore = await updateScore(body, alreadyPosted.id);
            res.status(200).json(updatedScore);
        } else {
            const postedScore = await createScore(body);
            res.status(200).json(postedScore);
        }

    } catch (e) {
        next(e);
    }
};

const getScoreByDate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { query } = req;
        const { date, userId } = query;

        if (!date || typeof date !== 'string') {
            const error = new Error("No date provided. Score could not be found.")
            res.status(400).json({ error: error.message });
            throw error;
        };

        if (!userId || typeof userId !== 'string') {
            const error = new Error("No user provided. Score could not be found.")
            res.status(400).json({ error: error.message });
            throw error;
        };

        const score = await findUserScoreForDate({date, userId});

        if (!score) {
            res.status(200).json({
                date,
                userId,
                score: null,
                events: null
            });
        }

        res.status(200).json(score);
    } catch (e) {
        next();
    }
};

const getRecentScoresByUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { params } = req;
        const { userId } = params;

        if (!userId || typeof userId !== 'string') {
            const error = new Error("No user provided. Scores could not be found.")
            res.status(400).json({ error: error.message });
            throw error;
        };

        const recentDays = [0, 1, 2, 3, 4, 5, 6].map(item => new Date(new Date().setDate(new Date().getDate() - item))).map(item => dateFormatter(item));    

        const scoresFound = await findRecentScoresByUserId( userId, recentDays );

        const recentScores = recentDays.map(date => scoresFound.find(score => score.date === date) || {date, userId, score: 0});

        res.status(200).json(recentScores);
    } catch (e) {
        next();
    };
};

const getProfileScores = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { params } = req;
        const id = params.user_id;
        const weekly = await getWeeklyScore(id);
        const monthly = await getMonthlyScore(id);
        const alltime = await getAllTimeScore(id);
        res.status(200).json({weekly, monthly, alltime});
    } catch (e) {
        next()
    }
};

export default {
    postScore,
    getScoreByDate,
    getRecentScoresByUser,
    getProfileScores,
};