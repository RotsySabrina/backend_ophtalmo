import "dotenv/config";
import express from "express";
import cors from "cors";
import pkg from "pg";

const { Pool } = pkg;
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.get("/", (req, res) => {
  res.send("Backend Ophtalmo is running 🚀");
});

app.get("/roles", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM role");
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
