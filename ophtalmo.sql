CREATE DATABASE ophtalmo;
\c ophtalmo;

CREATE TABLE "role" (
  "id" SERIAL PRIMARY KEY,
  "titre" varchar
);

CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "nom" varchar,
  "prenom" varchar,
  "sexe" integer,
  "date_naissance" date,
  "adresse" varchar,
  "telephone" text,
  "email" varchar,
  "role" integer,
  "mot_de_passe" varchar,
  "created_at" timestamp
);

CREATE TABLE "rendez_vous" (
  "id" SERIAL PRIMARY KEY,
  "id_patient" INTEGER,
  "id_medecin" INTEGER,
  "date_heure" TIMESTAMP,
  "status" INTEGER,
  CONSTRAINT fk_patient FOREIGN KEY (id_patient) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_medecin FOREIGN KEY (id_medecin) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE "dossier_medical" (
  "id" SERIAL PRIMARY KEY,
  "id_patient" INTEGER NOT NULL,
  "date_creation" DATE DEFAULT CURRENT_DATE,
  "antecedents_ophthalmologiques" TEXT,
  "antecedents_medicaux" TEXT,
  "allergies" TEXT,
  "traitements_actuels" TEXT,
  "remarques" TEXT,
  CONSTRAINT fk_patient FOREIGN KEY (id_patient) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE "consultation" (
  "id" SERIAL PRIMARY KEY,
  "id_dossier" INTEGER NOT NULL,
  "date_consultation" DATE NOT NULL,
  "id_medecin" INTEGER NOT NULL,
  "motif" TEXT NOT NULL,
  "acuite_visuelle_od" VARCHAR(20), -- Œil droit
  "acuite_visuelle_og" VARCHAR(20), -- Œil gauche
  "tonometrie_od" VARCHAR(20),      -- Pression œil droit
  "tonometrie_og" VARCHAR(20),      -- Pression œil gauche
  "refraction_od" VARCHAR(100),     -- Correction œil droit
  "refraction_og" VARCHAR(100),     -- Correction œil gauche
  "fond_oeil" TEXT,                 -- Observations fond d'œil
  "biometrie" TEXT,                 -- Mesures biométriques
  "diagnostic" TEXT,
  "traitement_propose" TEXT,
  "observations" TEXT,
  "prochaine_visite" DATE,
  CONSTRAINT fk_dossier FOREIGN KEY (id_dossier) REFERENCES dossier_medical(id) ON DELETE CASCADE,
  CONSTRAINT fk_medecin FOREIGN KEY (id_medecin) REFERENCES users(id) ON DELETE RESTRICT
);

-- Table prescription améliorée pour l'ophtalmologie
CREATE TABLE "prescription" (
  "id" SERIAL PRIMARY KEY,
  "id_consultation" INTEGER NOT NULL,
  "type" VARCHAR(50) NOT NULL CHECK (type IN ('lunettes', 'lentilles', 'medicament', 'examens', 'autre')),
  "details" TEXT NOT NULL,
  "oeil" VARCHAR(2) CHECK (oeil IN ('OD', 'OG', 'OD/OG')), -- Œil droit, œil gauche ou les deux
  "quantite" VARCHAR(50),
  "duree" VARCHAR(50),
  "posologie" TEXT,
  "date_debut" DATE,
  "date_fin" DATE,
  "statut" VARCHAR(20) DEFAULT 'prescrit' CHECK (statut IN ('prescrit', 'dispense', 'annule')),
  CONSTRAINT fk_consultation FOREIGN KEY (id_consultation) REFERENCES consultation(id) ON DELETE CASCADE
);

CREATE TABLE "notification" (
  "id" SERIAL  PRIMARY KEY,
  "id_patient" integer,
  "date_creation" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "message" text,
  "statut" INTEGER DEFAULT 0, -- 0 = non lu, 1 = lu
  "type" VARCHAR(50),
  "date_lu" TIMESTAMP
);

CREATE TABLE "regle_creneau" (
  "id" SERIAL  PRIMARY KEY,
  "ouverture" varchar,
  "fermeture" varchar,
  "pause_debut" varchar,
  "pause_fin" varchar,
  "jours_non_travailles" varchar
);

CREATE TABLE IF NOT EXISTS status_rdv (
    id INT PRIMARY KEY,
    name VARCHAR(50)
);

CREATE OR REPLACE VIEW vue_rendez_vous AS
SELECT rv.id,
       rv.date_heure,
       rv.status,
       p.id AS patient_id,
       p.nom AS patient_nom,
       p.prenom AS patient_prenom,
       m.id AS medecin_id,
       m.nom AS medecin_nom,
       m.prenom AS medecin_prenom
FROM rendez_vous rv
JOIN users p ON rv.id_patient = p.id
LEFT JOIN users m ON rv.id_medecin = m.id;


ALTER TABLE "role" ADD FOREIGN KEY ("id") REFERENCES "users" ("role");

ALTER TABLE "users" ADD FOREIGN KEY ("id") REFERENCES "rendez_vous" ("id_patient");

ALTER TABLE "users" ADD FOREIGN KEY ("id") REFERENCES "rendez_vous" ("id_medecin");

ALTER TABLE "users" ADD FOREIGN KEY ("id") REFERENCES "dossier_medical" ("id_patient");

ALTER TABLE "users" ADD FOREIGN KEY ("id") REFERENCES "notification" ("id_patient");




INSERT INTO "role" 
(titre)
VALUES
('patient'),('medecin'); 

INSERT INTO "users" 
(nom, prenom, sexe, date_naissance, adresse, telephone, email, role, mot_de_passe, created_at)
VALUES
('Rakoto', 'Jean', 1, '1985-03-12', 'Lot II A 45, Antananarivo', '0321234567', 'jean.rakoto@example.com', 1, 'hashedpassword1', NOW()),
('Rasoa', 'Marie', 2, '1992-07-25', 'Lot IV B 102, Toamasina', '0349876543', 'marie.rasoa@example.com', 1, 'hashedpassword2', NOW()),
('Randria', 'Paul ', 1, '1978-11-05', 'Lot III C 78, Fianarantsoa', '0336547891', 'paul.randria@example.com', 1, 'hashedpassword3', NOW()),
('Andriamanga', 'Hery', 1, '1975-11-20', 'Ivandry, Antananarivo', '0324455667', 'hery.andriamanga@ophtalmo.mg', 2, 'pass123', NOW()),
('Ravelo', 'Fara', 2, '1982-07-14', 'Isoraka, Antananarivo', '0335566778', 'fara.ravelo@ophtalmo.mg', 2, 'pass123', NOW()),
('Rakotobe', 'Lova', 1, '1979-02-08', 'Ambanidia, Antananarivo', '0346677889', 'lova.rakotobe@ophtalmo.mg', 2, 'pass123', NOW());

INSERT INTO "rendez_vous" (id_patient, id_medecin, date_heure, status) VALUES
(1, 4, '2025-09-05 09:00:00', 1),
(2, 5, '2025-09-06 10:30:00', 1),
(3, NULL, '2025-09-07 14:00:00', 0);

INSERT INTO "rendez_vous" (id_patient, id_medecin, date_heure, status) VALUES
-- Semaine 2
(1, 4, '2025-09-08 09:00:00', 10),
(2, 6, '2025-09-09 11:00:00', 10),
(3, NULL, '2025-09-10 15:00:00', 0),

-- Semaine 3
(1, 5, '2025-09-15 08:30:00', 10),
(2, 4, '2025-09-16 09:15:00', 10),
(3, NULL, '2025-09-17 10:00:00', 1),

-- Semaine 4
(1, 6, '2025-09-22 09:00:00', 10),
(2, 5, '2025-09-22 10:30:00', 10),
(3, NULL, '2025-09-23 14:00:00', 0),

-- Semaine 5
(1, 4, '2025-09-29 09:00:00', 10),
(2, 6, '2025-09-30 11:00:00', 10),
(3, 5, '2025-09-30 16:00:00', 10);

INSERT INTO status_rdv (id, name) VALUES
(1, 'en attente'),
(0, 'annule'),
(10, 'confirme');

ALTER TABLE regle_creneau 
ADD COLUMN duree_rdv INTEGER DEFAULT 60,  -- durée en minutes (ici 1h)
ADD COLUMN delai_min_reservation INTEGER DEFAULT 15; -- en jours

INSERT INTO regle_creneau (ouverture, fermeture, pause_debut, pause_fin, jours_non_travailles)
VALUES ('08:00', '17:00', '12:00', '14:00', 'dimanche'); 

INSERT INTO notification ('id_patient','message','type') VALUES(1, 'Votre rendez-vous est confirmé', 'confirmation_rdv')

/*avec postman:

Créer un dossier médical

POST http://localhost:5000/ophtalmologie/dossier

{
  "id_patient": 1,
  "antecedents_ophthalmologiques": "Myopie depuis l'enfance",
  "antecedents_medicaux": "Hypertension traitée",
  "allergies": "Pollen, acariens",
  "traitements_actuels": "Lumigan 1 goutte œil droit le soir",
  "remarques": "Patient très compliant"
}

Créer une consultation

POST http://localhost:5000/ophtalmologie/consultation

{
  "id_dossier": 1,
  "date_consultation": "2024-01-15",
  "id_medecin": 2,
  "motif": "Consultation de routine",
  "acuite_visuelle_od": "10/10",
  "acuite_visuelle_og": "8/10",
  "tonometrie_od": "15 mmHg",
  "tonometrie_og": "16 mmHg",
  "refraction_od": "Plan",
  "refraction_og": "-1.50 (-0.50) 180°",
  "fond_oeil": "Normal",
  "diagnostic": "Myopie légère œil gauche",
  "traitement_propose": "Correction optique",
  "observations": "Patient à revoir dans 1 an"
}

Ajouter une prescription

POST http://localhost:5000/ophtalmologie/prescription

{
  "id_consultation": 1,
  "type": "lunettes",
  "details": "Verres unifocaux anti-reflet",
  "oeil": "OG",
  "quantite": "1 paire",
  "duree": "Illimitée"
}

*/

