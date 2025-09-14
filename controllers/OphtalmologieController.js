import pool from '../config/db.js';

// GET - Récupérer le dossier médical d'un patient
export const getDossierMedical = async (req, res) => {
  try {
    const { idPatient } = req.params;

    console.log('📋 Tentative de récupération du dossier pour patient:', idPatient);

    // 1. Récupérer le dossier médical de base
    const dossierQuery = `
      SELECT dm.*, u.nom as patient_nom, u.prenom as patient_prenom
      FROM dossier_medical dm
      JOIN users u ON dm.id_patient = u.id
      WHERE dm.id_patient = $1
    `;
    
    const dossierResult = await pool.query(dossierQuery, [idPatient]);

    if (dossierResult.rows.length === 0) {
      console.log('❌ Aucun dossier trouvé pour patient:', idPatient);
      return res.status(404).json({ 
        success: false,
        message: 'Dossier médical non trouvé' 
      });
    }

    const dossier = dossierResult.rows[0];
    console.log('✅ Dossier trouvé:', dossier.id);

    // 2. Récupérer les consultations avec les médecins
    const consultationsQuery = `
      SELECT c.*, 
             m.nom as medecin_nom, m.prenom as medecin_prenom
      FROM consultation c
      JOIN users m ON c.id_medecin = m.id
      WHERE c.id_dossier = $1
      ORDER BY c.date_consultation DESC
    `;
    
    const consultationsResult = await pool.query(consultationsQuery, [dossier.id]);
    const consultations = consultationsResult.rows;
    console.log('📊 Consultations trouvées:', consultations.length);

    // 3. Pour chaque consultation, récupérer les prescriptions
    const consultationsAvecPrescriptions = await Promise.all(
      consultations.map(async (consultation) => {
        const prescriptionsQuery = `
          SELECT * FROM prescription 
          WHERE id_consultation = $1 
          ORDER BY type, oeil
        `;
        const prescriptionsResult = await pool.query(prescriptionsQuery, [consultation.id]);
        
        return {
          ...consultation,
          prescriptions: prescriptionsResult.rows
        };
      })
    );

    res.json({
      success: true,
      dossier,
      consultations: consultationsAvecPrescriptions,
      total_consultations: consultations.length
    });

  } catch (error) {
    console.error('❌ Erreur récupération dossier médical:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};

// GET - Récupérer une consultation spécifique
export const getConsultationDetail = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ 
        success: false,
        message: 'ID de consultation invalide' 
      });
    }

    const consultationQuery = `
      SELECT c.*, 
             m.nom as medecin_nom, m.prenom as medecin_prenom,
             p.nom as patient_nom, p.prenom as patient_prenom
      FROM consultation c
      JOIN users m ON c.id_medecin = m.id
      JOIN dossier_medical dm ON c.id_dossier = dm.id
      JOIN users p ON dm.id_patient = p.id
      WHERE c.id = $1
    `;

    const consultationResult = await pool.query(consultationQuery, [id]);

    if (consultationResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Consultation non trouvée' 
      });
    }

    const consultation = consultationResult.rows[0];

    // Récupérer les prescriptions
    const prescriptionsQuery = `
      SELECT * FROM prescription 
      WHERE id_consultation = $1 
      ORDER BY type, oeil
    `;
    const prescriptionsResult = await pool.query(prescriptionsQuery, [id]);

    res.json({
      success: true,
      consultation: {
        ...consultation,
        prescriptions: prescriptionsResult.rows
      }
    });

  } catch (error) {
    console.error('❌ Erreur détail consultation:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};

// POST - Créer une nouvelle consultation
export const createConsultation = async (req, res) => {
  try {
    const {
      id_dossier,
      date_consultation,
      id_medecin,
      motif,
      acuite_visuelle_od,
      acuite_visuelle_og,
      tonometrie_od,
      tonometrie_og,
      refraction_od,
      refraction_og,
      fond_oeil,
      biometrie,
      diagnostic,
      traitement_propose,
      observations,
      prochaine_visite
    } = req.body;

    console.log('➕ Création consultation:', { id_dossier, motif });

    const query = `
      INSERT INTO consultation 
      (id_dossier, date_consultation, id_medecin, motif,
       acuite_visuelle_od, acuite_visuelle_og,
       tonometrie_od, tonometrie_og,
       refraction_od, refraction_og,
       fond_oeil, biometrie,
       diagnostic, traitement_propose, observations, prochaine_visite)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;
    
    const values = [
      id_dossier, date_consultation, id_medecin, motif,
      acuite_visuelle_od, acuite_visuelle_og,
      tonometrie_od, tonometrie_og,
      refraction_od, refraction_og,
      fond_oeil, biometrie,
      diagnostic, traitement_propose, observations, prochaine_visite
    ];
    
    const result = await pool.query(query, values);

    console.log('✅ Consultation créée ID:', result.rows[0].id);

    res.status(201).json({
      success: true,
      message: 'Consultation créée avec succès',
      consultation: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Erreur création consultation:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};

// POST - Ajouter une prescription
export const createPrescription = async (req, res) => {
  try {
    const {
      id_consultation,
      type,
      details,
      oeil,
      quantite,
      duree,
      posologie,
      date_debut,
      date_fin
    } = req.body;

    console.log('💊 Création prescription pour consultation:', id_consultation);

    const query = `
      INSERT INTO prescription 
      (id_consultation, type, details, oeil, quantite, duree, posologie, date_debut, date_fin)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      id_consultation, type, details, oeil, quantite, duree, posologie, date_debut, date_fin
    ];
    
    const result = await pool.query(query, values);

    console.log('✅ Prescription créée ID:', result.rows[0].id);

    res.status(201).json({
      success: true,
      message: 'Prescription ajoutée avec succès',
      prescription: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Erreur création prescription:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};

// POST - Créer un dossier médical
export const createDossierMedical = async (req, res) => {
  try {
    const {
      id_patient,
      antecedents_ophthalmologiques,
      antecedents_medicaux,
      allergies,
      traitements_actuels,
      remarques
    } = req.body;

    console.log('📁 Création dossier médical pour patient:', id_patient);

    // Vérifier si le patient a déjà un dossier
    const checkQuery = 'SELECT id FROM dossier_medical WHERE id_patient = $1';
    const checkResult = await pool.query(checkQuery, [id_patient]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Le patient a déjà un dossier médical'
      });
    }

    const query = `
      INSERT INTO dossier_medical 
      (id_patient, antecedents_ophthalmologiques, antecedents_medicaux, allergies, traitements_actuels, remarques)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      id_patient,
      antecedents_ophthalmologiques,
      antecedents_medicaux,
      allergies,
      traitements_actuels,
      remarques
    ];
    
    const result = await pool.query(query, values);

    console.log('✅ Dossier médical créé ID:', result.rows[0].id);

    res.status(201).json({
      success: true,
      message: 'Dossier médical créé avec succès',
      dossier: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Erreur création dossier médical:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};