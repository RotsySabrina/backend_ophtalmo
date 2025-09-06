import { Router } from "express";
import { 
  getTotalRdvParPeriode,
  getRdvParStatut,
  getRdvEvolution,
  getRdvParMedecin,
} from "../controllers/StatsController.js";

const router = Router();

router.get("/total", getTotalRdvParPeriode);
router.get("/statut", getRdvParStatut);
router.get("/evolution", getRdvEvolution);
router.get("/medecin", getRdvParMedecin);

export default router;
