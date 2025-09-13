import { getAllRendezVous } from "../models/RendezVous.js";
import pool from "../config/db.js";

export const getRendezVous = async (req, res) => {
  try {
    const rendez_vous = await getAllRendezVous();
    res.json(rendez_vous);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getCreneauxDisponibles = async (req, res) => {
  const { id_medecin } = req.query;

  try {
    const regleResult = await pool.query("SELECT * FROM regle_creneau LIMIT 1");
    if (regleResult.rows.length === 0) {
      return res.status(400).json({ error: "Aucune règle de créneau définie" });
    }

    const regle = regleResult.rows[0];
    const {
      ouverture,
      fermeture,
      pause_debut,
      pause_fin,
      jours_non_travailles,
      duree_rdv,
      delai_min_reservation,
    } = regle;

    // 2. Date minimum de réservation
    const dateMin = new Date();
    dateMin.setDate(dateMin.getDate() + delai_min_reservation);

    // 3. Générer les créneaux sur une période (par ex. 1 mois)
    const dateMax = new Date(dateMin);
    dateMax.setMonth(dateMax.getMonth() + 1); // génère pour 1 mois

    let creneauxDisponibles = [];

    for (
      let d = new Date(dateMin);
      d <= dateMax;
      d.setDate(d.getDate() + 1)
    ) {
      const jourSemaine = d.toLocaleDateString("fr-FR", { weekday: "long" }).toLowerCase();

      // Vérifier si jour non travaillé
      if (jours_non_travailles && jours_non_travailles.includes(jourSemaine)) {
        continue;
      }

      // Construire début / fin de journée
      const [hOuverture, mOuverture] = ouverture.split(":").map(Number);
      const [hFermeture, mFermeture] = fermeture.split(":").map(Number);
      const [hPauseDebut, mPauseDebut] = pause_debut.split(":").map(Number);
      const [hPauseFin, mPauseFin] = pause_fin.split(":").map(Number);

      const startDay = new Date(d);
      startDay.setHours(hOuverture, mOuverture, 0, 0);

      const endDay = new Date(d);
      endDay.setHours(hFermeture, mFermeture, 0, 0);

      // Génération des créneaux
      for (let t = new Date(startDay); t < endDay; t.setMinutes(t.getMinutes() + duree_rdv)) {
        const creneauDebut = new Date(t);
        const creneauFin = new Date(t);
        creneauFin.setMinutes(creneauFin.getMinutes() + duree_rdv);

        // Exclure les créneaux qui tombent pendant la pause
        const pauseStart = new Date(d);
        pauseStart.setHours(hPauseDebut, mPauseDebut, 0, 0);

        const pauseEnd = new Date(d);
        pauseEnd.setHours(hPauseFin, mPauseFin, 0, 0);

        if (creneauDebut >= pauseStart && creneauDebut < pauseEnd) {
          continue; // on saute les créneaux pendant la pause
        }

        // Vérifier si déjà réservé
        const rdvResult = await pool.query(
          `SELECT 1 FROM rendez_vous 
          WHERE id_medecin = $1 
            AND date_heure = $2 
            AND status = 10`,
          [id_medecin, creneauDebut]
        );

        if (rdvResult.rows.length === 0) {
          creneauxDisponibles.push({
            debut: creneauDebut.toLocaleString("fr-FR", { timeZone: "Indian/Antananarivo" }),
            fin: creneauFin.toLocaleString("fr-FR", { timeZone: "Indian/Antananarivo" }),
          });
        }
      }
    }

    res.json(creneauxDisponibles);
  } catch (error) {
    console.error("Erreur getCreneauxDisponibles:", error);
    res.status(500).json({ error: "Erreur génération créneaux" });
  }
};

export const addRendezVous = async (req, res) => {
  try {
    const { id_patient, id_medecin, date_heure, status } = req.body; 
    //console.log("🔍 Données parsées:", { id_patient, id_medecin, date_heure, status });
    
    if (!id_patient || !id_medecin || !date_heure) {
      return res.status(400).json({ 
        message: 'Veuillez fournir toutes les informations nécessaires (id_patient, id_medecin, date_heure).',
        received: req.body 
      });
    }

    const query = `
      INSERT INTO rendez_vous (id_patient, id_medecin, date_heure, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    
    const values = [id_patient, id_medecin, date_heure, status || 1];
    
    const result = await pool.query(query, values);

    if (result.rowCount > 0) {
      res.status(201).json({ 
        message: 'Rendez-vous créé avec succès.',
        rendezVous: result.rows[0]
      });
    } else {
      res.status(500).json({ message: 'Échec de la création du rendez-vous.' });
    }
    
  } catch (err) {    
    if (err.code === '23503') { 
      return res.status(400).json({ 
        message: 'L\'ID du patient ou du médecin fourni n\'existe pas.',
        error: err.detail 
      });
    }
    
    if (err.code === '22007') { // Format de date invalide
      return res.status(400).json({ 
        message: 'Format de date invalide.',
        expected_format: 'YYYY-MM-DD HH:MM:SS',
        received: req.body.date_heure 
      });
    }
    
    res.status(500).json({ 
      message: "Une erreur interne est survenue.", 
      error: err.message,
      code: err.code 
    });
  }
};


