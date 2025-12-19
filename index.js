const app = require("./server/index");

const PORT = parseInt(process.env.PORT) || 8080;
const HOST = "0.0.0.0";

// Global error handlers
process.on("uncaughtException", (err) => {
  console.error("CRITICAL ERROR: Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("CRITICAL ERROR: Unhandled Rejection:", reason);
});

app.listen(PORT, HOST, () => {
  console.log(`Server running and listening on http://${HOST}:${PORT}`);
});
