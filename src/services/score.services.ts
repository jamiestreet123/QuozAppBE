import { prisma } from '../server';
import { dateFormatter } from '../utils/helpers';
import { leaderBoardTypeToDates } from './leaderboard.services';

type ScoreRequest = {
    date: string;
    userId: string;
};

type Event = {
    type: 'ANSWER' | 'LIFELINE';
    time: number;
    currentScore: number;
}

type ScoreBody = {
    date: string;
    userId: string;
    score: number;
    events: Event[];
}

export const findUserScoreForDate = ( req : ScoreRequest ) => {
    const { date, userId } = req;

    return prisma.score.findFirst({where: {
        userId,
        date
    }});
};

export const createScore = (body : ScoreBody ) => {

    const newBody = {...body, events: {create: body.events || []}};

    return prisma.score.create({
        data: newBody,
        include: {events: true},
    });
};

export const updateScore = (body : ScoreBody, scoreId: string) => {

    const newBody = {...body, events: {create: body.events || []}};

    return prisma.score.update({
        where: {id: scoreId},
        data: newBody,
    });
};

export const findRecentScoresByUserId = (userId: string, recentDays: string[]) => {
    return prisma.score.findMany({
        where: {
            userId,
            date: {
                in: recentDays,
            },
        },
        orderBy: {
            date: 'desc',
        },
    });
};

export const getWeeklyScore = async (userId: string) => {
    const weeklyStart = leaderBoardTypeToDates("week").startDate;
    const startWeek = weeklyStart ?  new Date(weeklyStart).toISOString() : undefined;
    const weekly = await prisma.score.groupBy({
        by: ['userId'],
        where: {
            userId : userId,
            date : {
                gte: startWeek,
            }
        },
        _sum: {
            score: true,
        },
        _max: {
            score: true,
        }
    });
    return weekly.length !== 0 ? {total: weekly[0]._sum.score, max: weekly[0]._max.score} :  {total: 0, max: 0}
};

export const getMonthlyScore = async (userId: string) => {
    const monthlyStart = leaderBoardTypeToDates("month").startDate;
    const startMonth = monthlyStart ?  new Date(monthlyStart).toISOString() : undefined;
    const monthly = await prisma.score.groupBy({
        by: ['userId'],
        where: {
            userId : userId,
            date : {
                gte: startMonth,
            }
        },
        _sum: {
            score: true,
        },
        _max: {
            score: true,
        }
    });
    return monthly.length !== 0 ? {total: monthly[0]._sum.score, max: monthly[0]._max.score} :  {total: 0, max: 0};
};

export const getAllTimeScore = async (userId: string) => {
    const allTime = await prisma.score.groupBy({
        by: ['userId'],
        where: {
            userId : userId,
        },
        _sum: {
            score: true,
        },
        _max: {
            score: true,
        },
        _min: {
            date: true
        },
        _count: {
            score: true,
        },
        _avg: {
            score: true,
        }
    });
    return allTime.length !== 0 ? {total: allTime[0]._sum.score, max: allTime[0]._max.score, first: allTime[0]._min.date, taken: allTime[0]._count.score, average: allTime[0]._avg.score }
            : {total: 0, max: 0, first: 'never', taken: 0, average: 0};
};

export default {
    findUserScoreForDate,
    createScore,
    updateScore,
};