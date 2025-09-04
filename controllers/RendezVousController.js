import { getAllRendezVous } from "../models/RendezVous.js";

export const getRendezVous = async (req, res) => {
  try {
    const rendez_vous = await getAllRendezVous();
    res.json(rendez_vous);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
