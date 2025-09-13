import jwt from "jsonwebtoken";
import pool from "../config/db.js";

export const login = async (req, res) => {
  const { email, mot_de_passe } = req.body;

  try {
    if (!email || !mot_de_passe) {
      return res.status(400).json({
        message: "⚠️ Email et mot de passe sont obligatoires",
        details: { email, mot_de_passe: mot_de_passe ? "****" : null },
      });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND mot_de_passe = $2",
      [email, mot_de_passe]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        message: "❌ Email ou mot de passe incorrect",
        input: { email },
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "SECRET_KEY",
      { expiresIn: "1h" }
    );

    res.json({
      message: "✅ Connexion réussie",
      token,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (err) {
    console.error("🔥 ERREUR LOGIN :", err);

    res.status(500).json({
      message: "Erreur interne du serveur",
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack, // utile en dev
        code: err.code || null,
        detail: err.detail || null,
      },
    });
  }
};

