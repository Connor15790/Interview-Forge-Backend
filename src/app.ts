import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import courseRoutes from "./routes/course.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/course", courseRoutes);

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "InterviewForge API running",
  });
});

export default app;
