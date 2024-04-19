import { prisma } from '../server';

type Answer = {
    full_answer: string;
    correct: boolean;
}

type Question = {
    full_question: string;
    answers: Answer[]
}

type Quiz = {
    date: string;
    questions: Question[];
}

const validateQuestion = (question: Question) => {
    return question.answers.length === 4 && 
            question.answers.filter((answer: Answer) => answer.correct === true).length === 1 && 
            question.answers.filter((answer: Answer) => answer.correct === false).length === 3;
}

export const validateQuiz = (body: Quiz) => {
    // check there are 20 questions
    const has20Questions = body.questions.length === 20;
    // check each question has 3 incorrect answers and 1 correct answer
    const allQuestionsValid = body.questions.filter((question: Question) => !validateQuestion(question)).length === 0;
    return has20Questions && allQuestionsValid;
};

export const createQuiz = (body: Quiz) => {

    const newDate = new Date(body.date).toISOString();
    const newQuestions = body.questions.map((item: Question) => {
        return {full_question: item.full_question, answers: {create: item.answers}}
    });
    
    const newBody = {
        date: newDate,
        questions: {
            create: newQuestions
        }
    };

    return prisma.quiz.create({
        data: newBody,
        include: {
            questions: {
                include: {
                    answers: true,
                }
            },
        }
    });
}

export default {
    validateQuiz,
    createQuiz,
}