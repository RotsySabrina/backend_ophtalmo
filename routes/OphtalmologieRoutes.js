import express from 'express';
import {
  getDossierMedical,
  getConsultationDetail,
  createConsultation,
  createPrescription,
  createDossierMedical
} from '../controllers/OphtalmologieController.js';

const router = express.Router();

// Routes pour les dossiers médicaux
router.get('/dossier/patient/:idPatient', getDossierMedical);
router.post('/dossier', createDossierMedical);

// Routes pour les consultations
router.get('/consultation/:id', getConsultationDetail);
router.post('/consultation', createConsultation);

// Routes pour les prescriptions
router.post('/prescription', createPrescription);

export default router;