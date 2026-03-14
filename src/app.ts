import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./controllers/auth"));

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "InterviewForge API running",
  });
});

export default app;
