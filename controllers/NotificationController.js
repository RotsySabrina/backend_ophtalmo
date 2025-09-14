import pool from "../config/db.js";

// 1. Récupérer toutes les notifications d'un patient
export const getPatientNotifications = async (req, res) => {
  const { idPatient } = req.params;
  const { nonLuSeulement, type } = req.query;

  try {
    let query = `
      SELECT n.* 
      FROM notification n
      WHERE n.id_patient = $1
    `;

    let params = [idPatient];
    let paramCount = 1;

    if (nonLuSeulement === 'true') {
      paramCount++;
      query += ` AND n.statut = $${paramCount}`;
      params.push(0);
    }

    if (type) {
      paramCount++;
      query += ` AND n.type = $${paramCount}`;
      params.push(type);
    }

    query += ' ORDER BY n.date_creation DESC, n.id DESC';

    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erreur récupération notifications:', error);
    res.status(500).json({ 
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};

// 2. Récupérer une notification spécifique
export const getNotification = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM notification WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur récupération notification:', error);
    res.status(500).json({ 
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};

// 3. Créer une nouvelle notification
export const createNotification = async (req, res) => {
  const { id_patient, message, type } = req.body;

  try {
    if (!id_patient || !message) {
      return res.status(400).json({ 
        message: 'id_patient et message sont obligatoires' 
      });
    }

    const result = await pool.query(
      `INSERT INTO notification (id_patient, message, type, date_creation)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       RETURNING *`,
      [id_patient, message, type]
    );

    res.status(201).json({
      message: 'Notification créée avec succès',
      notification: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur création notification:', error);
    res.status(500).json({ 
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};

// 4. Marquer une notification comme lue
export const markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE notification 
       SET statut = 1, date_lu = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }

    res.status(200).json({
      message: 'Notification marquée comme lue',
      notification: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur mise à jour notification:', error);
    res.status(500).json({ 
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};

// 5. Marquer toutes les notifications comme lues pour un patient
export const markAllAsRead = async (req, res) => {
  const { idPatient } = req.params;

  try {
    const result = await pool.query(
      `UPDATE notification 
       SET statut = 1, date_lu = CURRENT_TIMESTAMP
       WHERE id_patient = $1 AND statut = 0
       RETURNING *`,
      [idPatient]
    );

    res.status(200).json({
      message: `${result.rowCount} notification(s) marquée(s) comme lue(s)`,
      count: result.rowCount,
      notifications: result.rows
    });
  } catch (error) {
    console.error('Erreur mise à jour notifications:', error);
    res.status(500).json({ 
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};

// 6. Compter les notifications non lues d'un patient
export const countUnreadNotifications = async (req, res) => {
  const { idPatient } = req.params;

  try {
    const result = await pool.query(
      `SELECT COUNT(*) as count_non_lu
       FROM notification 
       WHERE id_patient = $1 AND statut = 0`,
      [idPatient]
    );

    res.status(200).json({ 
      count_non_lu: parseInt(result.rows[0].count_non_lu),
      id_patient: idPatient
    });
  } catch (error) {
    console.error('Erreur comptage notifications:', error);
    res.status(500).json({ 
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};

// 7. Supprimer une notification
export const deleteNotification = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM notification WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }

    res.status(200).json({ 
      message: 'Notification supprimée avec succès',
      notification: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur suppression notification:', error);
    res.status(500).json({ 
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};

// 8. Supprimer toutes les notifications d'un patient
export const deleteAllNotifications = async (req, res) => {
  const { idPatient } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM notification WHERE id_patient = $1 RETURNING *',
      [idPatient]
    );

    res.status(200).json({ 
      message: `${result.rowCount} notification(s) supprimée(s)`,
      count: result.rowCount,
      notifications: result.rows
    });
  } catch (error) {
    console.error('Erreur suppression notifications:', error);
    res.status(500).json({ 
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};