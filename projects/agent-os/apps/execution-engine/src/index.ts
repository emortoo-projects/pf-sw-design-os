import dotenv from "dotenv";

dotenv.config();

console.log("Agent OS Execution Engine starting...");

process.on("SIGTERM", () => {
  console.log("Shutting down execution engine...");
  process.exit(0);
});
