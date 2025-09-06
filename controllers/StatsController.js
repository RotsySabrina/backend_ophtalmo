import pool from "../config/db.js";

// 1. Total RDV par période
export const getTotalRdvParPeriode = async (req, res) => {
//console.log('GET request to /stats/total received. Query params:', req.query); 
  const { startDate, endDate } = req.query;
  try {
    const result = await pool.query(
      `SELECT COUNT(*) as total FROM rendez_vous WHERE date_heure BETWEEN $1 AND $2`,
      [startDate, endDate]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error });
  }
};

// 2. RDV par statut
export const getRdvParStatut = async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    const result = await pool.query(
      `SELECT
         sr.id AS status,
         sr.name AS status_name,
         COALESCE(COUNT(rv.status), 0)::int AS total
       FROM status_rdv sr
       LEFT JOIN rendez_vous rv ON sr.id = rv.status
           AND rv.date_heure BETWEEN $1 AND $2
       GROUP BY sr.id, sr.name
       ORDER BY sr.id`,
      [startDate, endDate]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error });
  }
};

// 3. Évolution (jour/semaine/mois)
export const getRdvEvolution = async (req, res) => {
//console.log('Query params:', req.query);
  const { start, end, interval } = req.query;

  let groupBy = "day";
  if (interval === "week") groupBy = "week";
  if (interval === "month") groupBy = "month";

  try {
    const result = await pool.query(
      `SELECT DATE_TRUNC($3, date_heure) as periode, COUNT(*) as total
       FROM rendez_vous
       WHERE date_heure BETWEEN $1 AND $2
       GROUP BY periode
       ORDER BY periode ASC`,
      [start, end, groupBy]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error });
  }
};

// 4. RDV par médecin
export const getRdvParMedecin = async (req, res) => {
  const { start, end } = req.query;
  const query = `
    SELECT u.nom, u.prenom, COUNT(r.id) as total
    FROM rendez_vous r
    JOIN users u ON r.id_medecin = u.id
    WHERE r.date_heure BETWEEN $1 AND $2
      AND r.status = 10
    GROUP BY u.nom, u.prenom
    ORDER BY total DESC
  `;

  try {
    const result = await pool.query(query, [start, end]);
    res.json(result.rows);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des RDV par médecin" });
  }
};

