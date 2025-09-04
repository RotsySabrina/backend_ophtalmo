import pool from "../config/db.js";

export const getAllRendezVous = async () => {
  const result = await pool.query("SELECT * FROM rendez_vous");
  return result.rows;
};
