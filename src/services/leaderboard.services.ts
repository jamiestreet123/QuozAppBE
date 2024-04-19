import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../server";

type Leaderboard = {
    name: string;
    user_id: string;
}

export const validateLeaderbaord = (body: Leaderboard) => {
    // check there is a creator
    const hasName = body.name !== null;
    // check the leaderboard has a name
    const creator = prisma.user.findFirst({
    where: { id: body.user_id }
    });
    return hasName && creator;
};

export const createLeaderboard = async (body: Leaderboard) => {

    var code = Math.random().toString(36).substr(2, 6);
    while (true) {
        const leaderboard = await prisma.leaderboard.findFirst({
            where: {
                code: code
            }
        });
        if (leaderboard === null){
            break;
        }
        code = Math.random().toString(36).substr(2, 6);
    }

    return prisma.leaderboard.create({
        data: {
            name: body.name,
            code: code,
            creator: {
                connect: {
                    id: body.user_id
                }
            },
            members: {
                connect: {
                    id: body.user_id
                }
            },
            admins: {
                connect: {
                    id: body.user_id
                }
            },
        },
    });
};

type LeaderboardRequest = {
    id: string,
    startDate?: Date,
    endDate?: Date,
}

export const leaderBoardTypeToDates = (type: string | undefined) => {
    switch(type){
        case "week":
            // find previous Monday
            const prevMonday = new Date();
            prevMonday.setDate(prevMonday.getDate() - (prevMonday.getDay() + 6) % 7);
            return { startDate: prevMonday };
        case "month":
            // find first day of month
            const date = new Date();
            const firstDayMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            return { startDate: firstDayMonth};
        case "year":
            // find first day of year
            const firstDayYear = new Date(new Date().getFullYear(), 0, 1);
            return { startDate: firstDayYear};
        default: 
            return { startDate: undefined};
    }
}

export const findLeaderboardById = async ({id, startDate, endDate}: LeaderboardRequest) => {

    const start = startDate ?  new Date(startDate).toISOString() : undefined;
    const end = endDate ? new Date(endDate).toISOString() : undefined;

    const leaderboard = await prisma.leaderboard.findFirst({
        where: {
            id: id
        },
        select: { id: true, name: true, admins: { select: {id: true}}},
    });

    const members = await prisma.user.findMany({
        where: {
            leaderboards: {
                some: {
                    id: id
                }
            }
        },
    });

    const memberIds = members.map(member => member.id);

    const scores = await prisma.score.groupBy({
        by: ['userId'],
        where: {
            userId : { in: memberIds},
            date : {
                gte: start,
                lte: end,
            }
        },
        _sum: {
            score: true,
        },
    });

    const out = members.map(member => {
        return {
            id: member.id,
            username: member.username,
            score: scores.find(score => score.userId === member.id)?._sum.score || 0,
        }
    }).sort((a, b) => a.score < b.score ? 1 : -1);

    return {
        leaderboard,
        members: out,
    };
};

export const findLeaderboardByCode = async (code: string) => {
    return prisma.leaderboard.findUnique({
        where: {
            code: code.toLowerCase(),
        }
    });
}

export const userNotInLeaderboard = async (leaderboard_id: string, user_id: string) => {
    const invalidUser = await prisma.user.findFirst({
        where: {
            id: user_id,
            OR: [
                {
                    leaderboards: {
                        some: {
                            id: leaderboard_id
                        }
                    }
                },
                {
                    requestedFor: {
                        some: {
                            id: leaderboard_id
                        }
                    }
                }
            ]
        }
    });
    return invalidUser === null;
};

export const userInLeaderboard = async (leaderboard_id: string, user_id: string) => {
    const user = await prisma.user.findFirst({
        where: {
            id: user_id,
            leaderboards: {
                        some: {
                            id: leaderboard_id
                        }
                    }
        },
    });
    return user !== null;
};

export const addUserToRequests = (leaderboard_id: string, user_id: string) => {
    return prisma.user.update({
        where: {
            id: user_id
        },
        data: {
            requestedFor: {
                connect: {
                    id: leaderboard_id
                }
            }
        }
    });
};

export const adminHasRights = async (leaderboard_id: string, admin_id: string) => {
    const admin = await prisma.user.findFirst({
        where: {
            id: admin_id,
            adminFor: {
                some: {
                    id: leaderboard_id
                }
            }
        }
    });
    return admin !== null;
};


export const userHasRequested = async (leaderboard_id: string, user_id: string) => {
    const hasRequested = await prisma.user.findFirst({
        where: {
            id: user_id,
            requestedFor: {
                some: {
                    id: leaderboard_id,
                }
            }
        }
    });
    return hasRequested !== null;
};

export const addUserToLeaderboard = (leaderboard_id: string, user_id: string) => {
    return prisma.user.update({
        where: {
            id: user_id,
        },
        data: {
            requestedFor: {
                disconnect: {id: leaderboard_id}
            },
            leaderboards: {
                connect: {id: leaderboard_id}
            }
        }
    })
};

export const makeUserAdmin = (leaderboard_id: string, user_id: string) => {
    return prisma.user.update({
        where: {
            id: user_id,
        },
        data: {
            adminFor: {
                connect: {id: leaderboard_id}
            }
        }
    })
};

export const removeUserFromLeaderboard = (leaderboard_id: string, user_id: string) => {
    return prisma.user.update({
        where: {
            id: user_id,
        },
        data: {
            leaderboards: {
                disconnect: {id: leaderboard_id}
            },
            adminFor: {
                disconnect: {id: leaderboard_id}
            }
        }
    })
};

export const getUserLeaderboards = (user_id: string) => {
    return prisma.user.findFirst({
        where: {
            id: user_id,
        },
        select: {leaderboards: {
            select: {id: true, name: true},
        }}
    });
};

export const findLeaderboardByIdAdmin = (leaderboard_id: string) => {
    return prisma.leaderboard.findFirst({
        where: {
            id: leaderboard_id,
        },
        select: {id: true, name: true, code: true, isPublic: true, members: { select: {id: true, username: true}}, requests: {select: {id: true, username: true}}, admins: {select: {id: true, username: true}}},
    });
};

export const toggleIsPublic = (leaderboard_id: string, isPublic: boolean) => {
    return prisma.leaderboard.update({
        where: {
            id: leaderboard_id,
        },
        data: {
            isPublic: isPublic
        }
    })
};

export const rejectUserRequest = (leaderboard_id: string, user_id: string) => {
    return prisma.user.update({
        where : {
            id: user_id,
        },
        data: {
            requestedFor: {
                disconnect: {
                    id: leaderboard_id,
                }
            }
        }
    });
};

export const removeAdminStatus = (leaderboard_id: string, user_id: string) => {
    return prisma.user.update({
        where : {
            id: user_id,
        },
        data: {
            adminFor: {
                disconnect: {
                    id: leaderboard_id,
                }
            }
        }
    });
};

export default {
    validateLeaderbaord,
    createLeaderboard,
    userNotInLeaderboard,
    addUserToRequests,
};