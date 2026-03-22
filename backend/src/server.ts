import { createApp } from "./app";
import { env } from "./config/env";

const app = createApp();

app.listen(env.port, "0.0.0.0", () => {
  console.log(`Backend listening on 0.0.0.0:${env.port}`);
});

import { pool } from "./config/db";

(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ DB Connected");
  } catch (err) {
    console.error("❌ DB Error:", err);
  }
})();
