import pool from "../config/db.js";

export const getAllUsers = async () => {
  const result = await pool.query("SELECT * FROM users WHERE role = 1");
  return result.rows;
};
0