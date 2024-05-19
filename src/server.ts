import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import QuizRouter from "./routes/quiz.routes";
import AuthRouter from "./routes/auth.routes";
import ScoreRouter from './routes/score.route';
import LeaderboardRouter from './routes/leaderboard.routes';
import EmailRouter from './routes/email.routes';
import dotenv from 'dotenv';
import cors from 'cors';
import { getBaseUrl } from "./utils/helpers";

dotenv.config();

export const prisma = new PrismaClient();

const app = express();

const corsOptions = {
  origin: getBaseUrl(),
  optionsSuccessStatus: 200,
}

app.use(cors(corsOptions));
const port = 8080;

async function main() {
  app.use(express.json());

  // Register API routes
  app.use("/api/v1/quiz", QuizRouter);
  app.use("/api/v1/auth", AuthRouter);
  app.use("/api/v1/score", ScoreRouter);
  app.use("/api/v1/leaderboard", LeaderboardRouter)
  app.use("/api/v1/email", EmailRouter)


  // Catch unregistered routes
  app.all("*", (req: Request, res: Response) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
  });

  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}

main()
  .then(async () => {
    await prisma.$connect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });