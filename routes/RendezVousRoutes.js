import express from "express";
import { getRendezVous } from "../controllers/RendezVousController.js";

const router = express.Router();

router.get("/", getRendezVous);

export default router;
