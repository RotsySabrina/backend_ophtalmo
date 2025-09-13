import express from "express";
import { getRendezVous,
    getCreneauxDisponibles,
    addRendezVous
} from "../controllers/RendezVousController.js";

const router = express.Router();

router.get("/", getRendezVous);
router.get("/creneaux", getCreneauxDisponibles);
router.post("/", addRendezVous);

export default router;
