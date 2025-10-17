import express, { Response, Request, NextFunction } from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import axios from "axios";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 3000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: "error",
    error: "Too many requests, please try again later.",
  },
});

app.use(morgan("dev"));
app.use(limiter);
app.use(cors());
app.use(helmet());

interface UserProfile {
  email: string;
  name: string;
  stack: string;
}

interface ApiResponse {
  status: "success";
  user: UserProfile;
  timestamp: string;
  fact: string;
}

app.get("/me", async (req: Request, res: Response) => {
  try {
    const fact = await axios.get("https://catfact.ninja/fact", {
      timeout: 10000,
    });
    const response: ApiResponse = {
      status: "success",
      user: {
        email: "jewoolafavour2020@gmail.com",
        name: "Jewoola Favour",
        stack: "Node.js/Express",
      },
      timestamp: new Date().toISOString(),
      fact: fact.data.fact || "No cat fact available at the moment.",
    };
    res.status(200).json(response);
  } catch (error) {
    res.status(200).json({
      status: "success",
      user: {
        email: "jewoolafavour2020@gmail.com",
        name: "Jewoola Favour",
        stack: "Node.js/Express",
      },
      timestamp: new Date().toISOString(),
      fact: "Could not fetch cat fact at the moment.",
    });
  }
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message: "Something went wrong!",
  });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
