import express from 'express';
import {
  getPatientNotifications,
  getNotification,
  createNotification,
  markAsRead,
  markAllAsRead,
  countUnreadNotifications,
  deleteNotification,
  deleteAllNotifications
} from '../controllers/NotificationController.js';

const router = express.Router();

router.get('/patient/:idPatient', getPatientNotifications);

router.get('/:id', getNotification);

router.post('/', createNotification);

router.put('/:id/lu', markAsRead);

router.put('/patient/:idPatient/marquer-lues', markAllAsRead);

router.get('/patient/:idPatient/non-lues/count', countUnreadNotifications);

router.delete('/:id', deleteNotification);

router.delete('/patient/:idPatient/tout-supprimer', deleteAllNotifications);

export default router;