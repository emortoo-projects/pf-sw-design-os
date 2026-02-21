import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.LLM_PROXY_PORT || 4001;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "agent-os-llm-proxy" });
});

app.listen(PORT, () => {
  console.log(`Agent OS LLM Proxy running on port ${PORT}`);
});

export default app;
