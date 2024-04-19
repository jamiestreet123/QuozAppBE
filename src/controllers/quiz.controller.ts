import { NextFunction, Request, Response } from "express";
import { prisma } from "../server";
import { createQuiz, validateQuiz } from "../services/quiz.services";

const postQuiz = async (req: Request, res: Response) => {

    try {
        const { body } = req;

        if (validateQuiz(body)){

            const newQuiz = await createQuiz(body);

            res.status(200).json(newQuiz);
        } else {
            res.status(400).json({error: new Error("Quiz is invalid")});
        }
    } catch (e) {
        res.status(500).json({ error: e })
    }
};

const getQuizByDate = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { params } = req;
        const date = new Date(params.date).toISOString();
        const todaysQuiz = await prisma.quiz.findFirst({
            where: {
                date: date
            },
            include: {
                questions: {
                    include: {
                        answers: true
                    }
                }
            }
        });
        if (todaysQuiz) {
            res.status(200).json(todaysQuiz);
        } else {
            
            const error = new Error('No quiz found');
            res.status(404).json({ error: error.message });
        }
    } catch (e) {
        next()
    }
};

export default {
  postQuiz,
  getQuizByDate
};