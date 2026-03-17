import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import courseRoutes from "./routes/course.routes";
import enrollmentRoutes from "./routes/enroll.routes";
import generateRoutes from "./routes/generate.routes";
import stripeRoutes from "./routes/stripe.routes";

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/enrollment", enrollmentRoutes);
app.use("/api/generate", generateRoutes);
app.use("/api/stripe", stripeRoutes);

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "InterviewForge API running",
  });
});

export default app;
