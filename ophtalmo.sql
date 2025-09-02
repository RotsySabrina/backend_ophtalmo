CREATE DATABASE ophtalmo;
\c ophtalmo;

CREATE TABLE "role" (
  "id" integer PRIMARY KEY,
  "titre" varchar
);

CREATE TABLE "users" (
  "id" integer PRIMARY KEY,
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
  "id" integer PRIMARY KEY,
  "id_patient" integer,
  "id_medecin" integer,
  "date_heure" datetime,
  "status" integer
);

CREATE TABLE "dossier_medical" (
  "id" integer PRIMARY KEY,
  "id_patient" integer,
  "date_creation" date
);

CREATE TABLE "consultation" (
  "id" integer PRIMARY KEY,
  "id_dossier" integer,
  "date_consultation" date,
  "type" text
);

CREATE TABLE "prescription" (
  "id" integer PRIMARY KEY,
  "id_consultation" integer,
  "type" text,
  "details" text
);

CREATE TABLE "notification" (
  "id" integer PRIMARY KEY,
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

ALTER TABLE "role" ADD FOREIGN KEY ("id") REFERENCES "users" ("role");

ALTER TABLE "users" ADD FOREIGN KEY ("id") REFERENCES "rendez_vous" ("id_patient");

ALTER TABLE "users" ADD FOREIGN KEY ("id") REFERENCES "rendez_vous" ("id_medecin");

ALTER TABLE "users" ADD FOREIGN KEY ("id") REFERENCES "dossier_medical" ("id_patient");

ALTER TABLE "dossier_medical" ADD FOREIGN KEY ("id") REFERENCES "consultation" ("id_dossier");

ALTER TABLE "consultation" ADD FOREIGN KEY ("id") REFERENCES "prescription" ("id_consultation");

ALTER TABLE "users" ADD FOREIGN KEY ("id") REFERENCES "notification" ("id_patient");
