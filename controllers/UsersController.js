import { getAllUsers,
  getAllMedecins
 } from "../models/Users.js";

export const getUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMedecins = async (req, res) =>{
  try {
    const medecins = await getAllMedecins();
    res.json(medecins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
