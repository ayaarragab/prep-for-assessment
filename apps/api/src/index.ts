import "dotenv/config";
import express, { Express } from "express";
import cors from "cors";
import { initDb } from "./db.js";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import { logger } from "./logger.js";

const app: Express = express();
const port = process.env.PORT || 3001;

app.set("trust proxy", 1);
app.use(cors());
app.use(express.json());

// Initialize Database
initDb();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  logger.info({ port }, "Server running");
});

export default app;
