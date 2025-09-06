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
  "id" SERIAL  PRIMARY KEY,
  "id_patient" integer,
  "date_creation" date
);

CREATE TABLE "consultation" (
  "id" SERIAL  PRIMARY KEY,
  "id_dossier" integer,
  "date_consultation" date,
  "type" text
);

CREATE TABLE "prescription" (
  "id" SERIAL  PRIMARY KEY,
  "id_consultation" integer,
  "type" text,
  "details" text
);

CREATE TABLE "notification" (
  "id" SERIAL  PRIMARY KEY,
  "id_patient" integer,
  "date_creation" date,
  "message" text
);

CREATE TABLE "regle_creneau" (
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

ALTER TABLE "role" ADD FOREIGN KEY ("id") REFERENCES "users" ("role");

ALTER TABLE "users" ADD FOREIGN KEY ("id") REFERENCES "rendez_vous" ("id_patient");

ALTER TABLE "users" ADD FOREIGN KEY ("id") REFERENCES "rendez_vous" ("id_medecin");

ALTER TABLE "users" ADD FOREIGN KEY ("id") REFERENCES "dossier_medical" ("id_patient");

ALTER TABLE "dossier_medical" ADD FOREIGN KEY ("id") REFERENCES "consultation" ("id_dossier");

ALTER TABLE "consultation" ADD FOREIGN KEY ("id") REFERENCES "prescription" ("id_consultation");

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
