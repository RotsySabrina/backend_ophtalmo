import "dotenv/config";
import express from "express";
import cors from "cors";

import roleRoutes from "./routes/RoleRoutes.js";
import userRoutes from "./routes/UsersRoutes.js";
import RendezVousRoutes from "./routes/RendezVousRoutes.js"
import statsRoutes from "./routes/StatsRoutes.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => res.send("Backend Ophtalmo is running 🚀"));
app.use("/roles", roleRoutes);
app.use("/users", userRoutes);
app.use("/rendez_vous", RendezVousRoutes);
app.use("/stats", statsRoutes);


app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`)
);
