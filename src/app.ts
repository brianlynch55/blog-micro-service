import "reflect-metadata";
import express from "express";
import blogRoutes from "./routes/blog";
import { AppDataSource } from "./ormconfig";
import { errorHandler } from "./middleware/errorHandler";
import dotenv from "dotenv";
import redisClient from "./config/redis";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

async function initializeApp() {
  try {
    await AppDataSource.initialize();
    console.log("Data Source has been initialized!");

    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log("Redis client has been connected!");
    }

    app.use("/api", blogRoutes(AppDataSource));
    app.use(errorHandler);
    app.use("/api", apiLimiter);

    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port ${process.env.PORT || 3000}`);
    });
  } catch (error) {
    console.error("Error during initialization:", error);
  }
}

initializeApp();

export default app;
