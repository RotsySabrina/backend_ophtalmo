import express from "express";
import { getUsers,
    getMedecins
} from "../controllers/UsersController.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/medecins", getMedecins);

export default router;
