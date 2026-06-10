import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./infra/database/mongodb.js";

require("dotenv").config();

const PORT = process.env.PORT || 3001;

async function startServer() {
  // mongodb connection
  await connectDB(); // ✅ connect DB first

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();
