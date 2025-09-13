import pool from "../config/db.js";

export const getAllUsers = async () => {
  const result = await pool.query("SELECT * FROM users WHERE role = 1");
  return result.rows;
};

export const getAllMedecins = async () => {
  const result = await pool.query("SELECT id, nom, prenom FROM users WHERE role = 2");
  return result.rows;
};