import { createApp } from "./app";
import { env } from "./config/env";
import { pool } from "./config/db";

const app = createApp();

const PORT = Number(process.env.PORT) || env.port || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend listening on ${PORT}`);
});

(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ DB Connected");
  } catch (err) {
    console.error("❌ DB Error:", err);
  }
})();