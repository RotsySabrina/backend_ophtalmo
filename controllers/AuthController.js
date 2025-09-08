// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import pool from "../config/db.js"; // ta connexion pg

// export const login = async (req, res) => {
//   try {
//     const { email, mot_de_passe } = req.body;

//     // Vérifier si l’utilisateur existe
//     const result = await pool.query(
//       "SELECT * FROM users WHERE email = $1",
//       [email]
//     );

//     if (result.rows.length === 0) {
//       return res.status(401).json({ message: "Utilisateur introuvable" });
//     }

//     const user = result.rows[0];

//     // Vérifier le mot de passe
//     const isValid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
//     if (!isValid) {
//       return res.status(401).json({ message: "Mot de passe incorrect" });
//     }

//     // Générer un token JWT
//     const token = jwt.sign(
//       { id: user.id, email: user.email },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     res.json({ token, user: { id: user.id, email: user.email } });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Erreur serveur" });
//   }
// };

import jwt from "jsonwebtoken";
import pool from "../config/db.js"; // connexion PostgreSQL

export const login = async (req, res) => {
  const { email, mot_de_passe } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND mot_de_passe = $2",
      [email, mot_de_passe]
    );

    const user = result.rows[0];

    if (!user) return res.status(401).json({ message: "Email ou mot de passe incorrect" });

    const token = jwt.sign({ id: user.id, role: user.role }, "SECRET_KEY", { expiresIn: "1h" });

    res.json({ token, user: { id: user.id, nom: user.nom, prenom: user.prenom, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
