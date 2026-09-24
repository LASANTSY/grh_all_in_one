import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1727000000000 implements MigrationInterface {
  name = 'InitialSchema1727000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============================================================
    // EXTENSIONS
    // ============================================================
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // ============================================================
    // TYPES ENUM
    // ============================================================
    await queryRunner.query(
      `CREATE TYPE "grade_categorie" AS ENUM ('OFFICIER_GENERAL', 'OFFICIER_MARINE', 'OFFICIER_MARINIER', 'QMO')`,
    );
    await queryRunner.query(
      `CREATE TYPE "niveau_competence" AS ENUM ('AVANCE', 'MOYEN', 'MAUVAIS')`,
    );
    await queryRunner.query(
      `CREATE TYPE "type_compte" AS ENUM ('ADMIN_SYSTEME', 'RH_ETAT_MAJOR', 'RH_BASE', 'CHEF_COMMANDEMENT', 'PERSONNEL')`,
    );
    await queryRunner.query(
      `CREATE TYPE "statut_import" AS ENUM ('EN_COURS', 'TERMINE', 'ECHEC')`,
    );
    await queryRunner.query(
      `CREATE TYPE "statut_ligne_import" AS ENUM ('VALIDE', 'ERREUR', 'IGNOREE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "action_ligne_import" AS ENUM ('CREATION', 'MISE_A_JOUR', 'IGNOREE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "statut_demande" AS ENUM ('EN_ATTENTE', 'VALIDEE', 'REJETEE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "action_audit" AS ENUM ('CREATION', 'MODIFICATION', 'SUPPRESSION', 'CONNEXION', 'ECHEC_CONNEXION', 'DECONNEXION', 'IMPORT', 'EXPORT', 'VALIDATION', 'REJET')`,
    );

    // ============================================================
    // TABLE base
    // ============================================================
    await queryRunner.query(`
      CREATE TABLE "base" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "nom" varchar(100) NOT NULL,
        "ville" varchar(100) NOT NULL,
        "actif" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "uq_base_nom" UNIQUE ("nom")
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_base_nom" ON "base" ("nom")`);

    // ============================================================
    // TABLE unite
    // ============================================================
    await queryRunner.query(`
      CREATE TABLE "unite" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "nom" varchar(150) NOT NULL,
        "code" varchar(20) NOT NULL,
        "base_id" uuid NOT NULL,
        "actif" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "uq_unite_code" UNIQUE ("code"),
        CONSTRAINT "fk_unite_base" FOREIGN KEY ("base_id")
          REFERENCES "base" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_unite_code" ON "unite" ("code")`);
    await queryRunner.query(`CREATE INDEX "idx_unite_base_id" ON "unite" ("base_id")`);

    // ============================================================
    // TABLE grade
    // ============================================================
    await queryRunner.query(`
      CREATE TABLE "grade" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "libelle" varchar(100) NOT NULL,
        "categorie" "grade_categorie" NOT NULL,
        "age_depart_retraite" int NOT NULL,
        "ordre" int NOT NULL,
        "actif" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "uq_grade_libelle" UNIQUE ("libelle"),
        CONSTRAINT "chk_grade_age_positif" CHECK ("age_depart_retraite" > 0)
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_grade_libelle" ON "grade" ("libelle")`);
    await queryRunner.query(`CREATE INDEX "idx_grade_ordre" ON "grade" ("ordre")`);

    // ============================================================
    // TABLE specialite
    // ============================================================
    await queryRunner.query(`
      CREATE TABLE "specialite" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "libelle" varchar(150) NOT NULL,
        "actif" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "uq_specialite_libelle" UNIQUE ("libelle")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_specialite_libelle" ON "specialite" ("libelle")`,
    );

    // ============================================================
    // TABLE personnel
    // ============================================================
    await queryRunner.query(`
      CREATE TABLE "personnel" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "matricule_recrutement" varchar(50) NOT NULL,
        "matricule_financier" varchar(50),
        "nom" varchar(100) NOT NULL,
        "prenoms" varchar(150) NOT NULL,
        "photo_url" varchar(500),
        "date_naissance" date NOT NULL,
        "lieu_naissance" varchar(150) NOT NULL,
        "prefecture" varchar(150),
        "sous_prefecture" varchar(150),
        "province" varchar(150),
        "email" varchar(150),
        "telephone_mobile" varchar(30),
        "adresse_actuelle" text,
        "adresse_repli" text,
        "contact_urgence" text,
        "numero_cin" varchar(50),
        "date_delivrance_cin" date,
        "lieu_delivrance_cin" varchar(150),
        "date_duplicata_cin" date,
        "numero_passeport" varchar(50),
        "date_delivrance_passeport" date,
        "religion" varchar(50),
        "groupe_sanguin" varchar(10),
        "taille" int,
        "statut_familial" varchar(50),
        "numero_autorisation_mariage" varchar(50),
        "date_autorisation_mariage" date,
        "nom_conjoint" varchar(150),
        "date_naissance_conjoint" date,
        "lieu_naissance_conjoint" varchar(150),
        "fonction_conjoint" varchar(150),
        "nom_pere" varchar(150),
        "nom_mere" varchar(150),
        "sports_pratiques" text,
        "corps" varchar(100),
        "lieu_emploi" varchar(150),
        "fonction_actuelle" varchar(150),
        "numero_cim" varchar(50),
        "date_delivrance_cim" date,
        "date_effet_soc_hdrc" date,
        "reference_soc_hdrc" varchar(100),
        "date_effet_prime_technicite" date,
        "reference_prime_technicite" varchar(100),
        "numero_permis_civil" varchar(50),
        "date_permis_civil" date,
        "numero_permis_militaire" varchar(50),
        "date_permis_militaire" date,
        "situation_militaire" varchar(100),
        "origine_recrutement" varchar(150),
        "date_entree_service" date,
        "interruptions_service" text,
        "date_liberation_service_national" date,
        "date_premier_rengagement" date,
        "niveau_instruction" varchar(150),
        "connaissances_informatiques" text,
        "grade_id" uuid NOT NULL,
        "unite_id" uuid NOT NULL,
        "specialite_id" uuid,
        "actif" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        CONSTRAINT "fk_personnel_grade" FOREIGN KEY ("grade_id")
          REFERENCES "grade" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "fk_personnel_unite" FOREIGN KEY ("unite_id")
          REFERENCES "unite" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "fk_personnel_specialite" FOREIGN KEY ("specialite_id")
          REFERENCES "specialite" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT "chk_personnel_taille" CHECK ("taille" IS NULL OR ("taille" > 0 AND "taille" < 300))
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_personnel_matricule_recrutement" ON "personnel" ("matricule_recrutement")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_personnel_numero_cin" ON "personnel" ("numero_cin") WHERE "numero_cin" IS NOT NULL`,
    );
    await queryRunner.query(`CREATE INDEX "idx_personnel_nom" ON "personnel" ("nom")`);
    await queryRunner.query(
      `CREATE INDEX "idx_personnel_prenoms_trgm" ON "personnel" USING gin ("prenoms" gin_trgm_ops)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_personnel_nom_trgm" ON "personnel" USING gin ("nom" gin_trgm_ops)`,
    );
    await queryRunner.query(`CREATE INDEX "idx_personnel_grade_id" ON "personnel" ("grade_id")`);
    await queryRunner.query(`CREATE INDEX "idx_personnel_unite_id" ON "personnel" ("unite_id")`);
    await queryRunner.query(
      `CREATE INDEX "idx_personnel_specialite_id" ON "personnel" ("specialite_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_personnel_date_naissance" ON "personnel" ("date_naissance")`,
    );
    await queryRunner.query(`CREATE INDEX "idx_personnel_deleted_at" ON "personnel" ("deleted_at")`);

    // ============================================================
    // TABLE enfant
    // ============================================================
    await queryRunner.query(`
      CREATE TABLE "enfant" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "personnel_id" uuid NOT NULL,
        "rang" int NOT NULL,
        "nom" varchar(100) NOT NULL,
        "prenoms" varchar(150) NOT NULL,
        "date_naissance" date NOT NULL,
        "sexe" varchar(10) NOT NULL,
        "lien_parente" varchar(50) NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_enfant_personnel" FOREIGN KEY ("personnel_id")
          REFERENCES "personnel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "chk_enfant_rang_positif" CHECK ("rang" > 0)
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_enfant_personnel_id" ON "enfant" ("personnel_id")`,
    );

    // ============================================================
    // TABLE historique_grade
    // ============================================================
    await queryRunner.query(`
      CREATE TABLE "historique_grade" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "personnel_id" uuid NOT NULL,
        "grade_id" uuid NOT NULL,
        "reference_decret" varchar(150),
        "date_prise_commandement" date NOT NULL,
        "observations" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_historique_grade_personnel" FOREIGN KEY ("personnel_id")
          REFERENCES "personnel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "fk_historique_grade_grade" FOREIGN KEY ("grade_id")
          REFERENCES "grade" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_historique_grade_personnel_id" ON "historique_grade" ("personnel_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_historique_grade_grade_id" ON "historique_grade" ("grade_id")`,
    );

    // ============================================================
    // TABLE cursus_scolaire
    // ============================================================
    await queryRunner.query(`
      CREATE TABLE "cursus_scolaire" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "personnel_id" uuid NOT NULL,
        "etablissement" varchar(200) NOT NULL,
        "ville_pays" varchar(150),
        "date_debut" date,
        "date_fin" date,
        "diplome_obtenu" varchar(200),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_cursus_scolaire_personnel" FOREIGN KEY ("personnel_id")
          REFERENCES "personnel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_cursus_scolaire_personnel_id" ON "cursus_scolaire" ("personnel_id")`,
    );

    // ============================================================
    // TABLE stage_militaire
    // ============================================================
    await queryRunner.query(`
      CREATE TABLE "stage_militaire" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "personnel_id" uuid NOT NULL,
        "etablissement" varchar(200) NOT NULL,
        "lieu" varchar(150),
        "nature_formation" varchar(200) NOT NULL,
        "date_debut" date,
        "date_fin" date,
        "decision_envoi" varchar(150),
        "diplome_certificat" varchar(200),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_stage_militaire_personnel" FOREIGN KEY ("personnel_id")
          REFERENCES "personnel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_stage_militaire_personnel_id" ON "stage_militaire" ("personnel_id")`,
    );

    // ============================================================
    // TABLE competence_linguistique
    // ============================================================
    await queryRunner.query(`
      CREATE TABLE "competence_linguistique" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "personnel_id" uuid NOT NULL,
        "langue" varchar(100) NOT NULL,
        "niveau_ecrit" "niveau_competence" NOT NULL,
        "niveau_parle" "niveau_competence" NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_competence_linguistique_personnel" FOREIGN KEY ("personnel_id")
          REFERENCES "personnel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_competence_linguistique_personnel_id" ON "competence_linguistique" ("personnel_id")`,
    );

    // ============================================================
    // TABLE affectation
    // ============================================================
    await queryRunner.query(`
      CREATE TABLE "affectation" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "personnel_id" uuid NOT NULL,
        "unite_id" uuid NOT NULL,
        "decision" varchar(150),
        "date_effet" date NOT NULL,
        "fonction_emploi" varchar(200),
        "observations" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_affectation_personnel" FOREIGN KEY ("personnel_id")
          REFERENCES "personnel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "fk_affectation_unite" FOREIGN KEY ("unite_id")
          REFERENCES "unite" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_affectation_personnel_id" ON "affectation" ("personnel_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_affectation_unite_id" ON "affectation" ("unite_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_affectation_date_effet" ON "affectation" ("date_effet")`,
    );

    // ============================================================
    // TABLE decoration
    // ============================================================
    await queryRunner.query(`
      CREATE TABLE "decoration" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "personnel_id" uuid NOT NULL,
        "libelle" varchar(200) NOT NULL,
        "reference" varchar(150),
        "date_effet" date NOT NULL,
        "observations" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_decoration_personnel" FOREIGN KEY ("personnel_id")
          REFERENCES "personnel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_decoration_personnel_id" ON "decoration" ("personnel_id")`,
    );

    // ============================================================
    // TABLE compte_utilisateur
    // ============================================================
    await queryRunner.query(`
      CREATE TABLE "compte_utilisateur" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "identifiant" varchar(50) NOT NULL,
        "mot_de_passe_hash" varchar(255) NOT NULL,
        "type_compte" "type_compte" NOT NULL,
        "personnel_id" uuid,
        "unite_perimetre_id" uuid,
        "compte_verrouille" boolean NOT NULL DEFAULT false,
        "tentatives_echouees" int NOT NULL DEFAULT 0,
        "dernier_echec" timestamptz,
        "doit_changer_mot_de_passe" boolean NOT NULL DEFAULT false,
        "date_derniere_connexion" timestamptz,
        "actif" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "uq_compte_utilisateur_identifiant" UNIQUE ("identifiant"),
        CONSTRAINT "uq_compte_utilisateur_personnel_id" UNIQUE ("personnel_id"),
        CONSTRAINT "fk_compte_utilisateur_personnel" FOREIGN KEY ("personnel_id")
          REFERENCES "personnel" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT "fk_compte_utilisateur_unite_perimetre" FOREIGN KEY ("unite_perimetre_id")
          REFERENCES "unite" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT "chk_compte_utilisateur_tentatives" CHECK ("tentatives_echouees" >= 0)
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_compte_utilisateur_identifiant" ON "compte_utilisateur" ("identifiant")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_compte_utilisateur_personnel_id" ON "compte_utilisateur" ("personnel_id") WHERE "personnel_id" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_compte_utilisateur_type_compte" ON "compte_utilisateur" ("type_compte")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_compte_utilisateur_unite_perimetre_id" ON "compte_utilisateur" ("unite_perimetre_id")`,
    );

    // ============================================================
    // TABLE refresh_token
    // ============================================================
    await queryRunner.query(`
      CREATE TABLE "refresh_token" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "compte_id" uuid NOT NULL,
        "token_hash" varchar(255) NOT NULL,
        "expires_at" timestamptz NOT NULL,
        "revoked_at" timestamptz,
        "adresse_ip" inet,
        "user_agent" varchar(255),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_refresh_token_compte" FOREIGN KEY ("compte_id")
          REFERENCES "compte_utilisateur" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_refresh_token_token_hash" ON "refresh_token" ("token_hash")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_refresh_token_compte_id" ON "refresh_token" ("compte_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_refresh_token_expires_at" ON "refresh_token" ("expires_at")`,
    );

    // ============================================================
    // TABLE piece_jointe
    // ============================================================
    await queryRunner.query(`
      CREATE TABLE "piece_jointe" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "personnel_id" uuid NOT NULL,
        "type" varchar(100) NOT NULL,
        "libelle" varchar(200),
        "date_ajout" timestamptz NOT NULL DEFAULT now(),
        "actif" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_piece_jointe_personnel" FOREIGN KEY ("personnel_id")
          REFERENCES "personnel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_piece_jointe_personnel_id" ON "piece_jointe" ("personnel_id")`,
    );
    await queryRunner.query(`CREATE INDEX "idx_piece_jointe_type" ON "piece_jointe" ("type")`);

    // ============================================================
    // TABLE version_piece_jointe
    // ============================================================
    await queryRunner.query(`
      CREATE TABLE "version_piece_jointe" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "piece_jointe_id" uuid NOT NULL,
        "numero_version" int NOT NULL,
        "fichier_path" varchar(500) NOT NULL,
        "nom_original" varchar(255) NOT NULL,
        "format" varchar(100) NOT NULL,
        "taille_octets" bigint NOT NULL,
        "date_depot" timestamptz NOT NULL DEFAULT now(),
        "depose_par_id" uuid,
        "version_courante" boolean NOT NULL DEFAULT false,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_version_piece_jointe_piece_jointe" FOREIGN KEY ("piece_jointe_id")
          REFERENCES "piece_jointe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "fk_version_piece_jointe_depose_par" FOREIGN KEY ("depose_par_id")
          REFERENCES "compte_utilisateur" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT "uq_version_piece_jointe_numero" UNIQUE ("piece_jointe_id", "numero_version"),
        CONSTRAINT "chk_version_piece_jointe_taille" CHECK ("taille_octets" > 0)
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_version_piece_jointe_piece_jointe_id" ON "version_piece_jointe" ("piece_jointe_id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_version_piece_jointe_courante" ON "version_piece_jointe" ("piece_jointe_id") WHERE "version_courante" = true`,
    );

    // ============================================================
    // TABLE import_personnel
    // ============================================================
    await queryRunner.query(`
      CREATE TABLE "import_personnel" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "importateur_id" uuid,
        "date_import" timestamptz NOT NULL DEFAULT now(),
        "nom_fichier_source" varchar(255) NOT NULL,
        "chemin_fichier" varchar(500),
        "nombre_lignes" int NOT NULL DEFAULT 0,
        "lignes_valides" int NOT NULL DEFAULT 0,
        "lignes_erreur" int NOT NULL DEFAULT 0,
        "lignes_creees" int NOT NULL DEFAULT 0,
        "lignes_mises_a_jour" int NOT NULL DEFAULT 0,
        "statut" "statut_import" NOT NULL DEFAULT 'EN_COURS',
        "message_erreur" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_import_personnel_importateur" FOREIGN KEY ("importateur_id")
          REFERENCES "compte_utilisateur" ("id") ON DELETE SET NULL ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_import_personnel_date_import" ON "import_personnel" ("date_import")`,
    );

    // ============================================================
    // TABLE ligne_import
    // ============================================================
    await queryRunner.query(`
      CREATE TABLE "ligne_import" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "import_id" uuid NOT NULL,
        "numero_ligne" int NOT NULL,
        "statut" "statut_ligne_import" NOT NULL,
        "action_appliquee" "action_ligne_import",
        "message_erreur" text,
        "personnel_id" uuid,
        "donnees_brutes" jsonb,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_ligne_import_import" FOREIGN KEY ("import_id")
          REFERENCES "import_personnel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "fk_ligne_import_personnel" FOREIGN KEY ("personnel_id")
          REFERENCES "personnel" ("id") ON DELETE SET NULL ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_ligne_import_import_id" ON "ligne_import" ("import_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ligne_import_statut" ON "ligne_import" ("statut")`,
    );

    // ============================================================
    // TABLE demande_modification
    // ============================================================
    await queryRunner.query(`
      CREATE TABLE "demande_modification" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "personnel_id" uuid NOT NULL,
        "demandeur_id" uuid NOT NULL,
        "champ_modifie" varchar(100) NOT NULL,
        "ancienne_valeur" text,
        "nouvelle_valeur" text NOT NULL,
        "statut" "statut_demande" NOT NULL DEFAULT 'EN_ATTENTE',
        "date_demande" timestamptz NOT NULL DEFAULT now(),
        "date_traitement" timestamptz,
        "valideur_id" uuid,
        "motif_rejet" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_demande_modification_personnel" FOREIGN KEY ("personnel_id")
          REFERENCES "personnel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "fk_demande_modification_demandeur" FOREIGN KEY ("demandeur_id")
          REFERENCES "compte_utilisateur" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "fk_demande_modification_valideur" FOREIGN KEY ("valideur_id")
          REFERENCES "compte_utilisateur" ("id") ON DELETE SET NULL ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_demande_modification_personnel_id" ON "demande_modification" ("personnel_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_demande_modification_statut" ON "demande_modification" ("statut")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_demande_modification_demandeur_id" ON "demande_modification" ("demandeur_id")`,
    );

    // ============================================================
    // TABLE entree_audit
    // ============================================================
    await queryRunner.query(`
      CREATE TABLE "entree_audit" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "action" "action_audit" NOT NULL,
        "entite_type" varchar(50) NOT NULL,
        "entite_id" uuid NOT NULL,
        "personnel_id" uuid,
        "auteur_id" uuid,
        "champ_modifie" varchar(100),
        "ancienne_valeur" text,
        "nouvelle_valeur" text,
        "adresse_ip" inet,
        "user_agent" varchar(255),
        "date_heure" timestamptz NOT NULL DEFAULT now(),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_entree_audit_personnel" FOREIGN KEY ("personnel_id")
          REFERENCES "personnel" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT "fk_entree_audit_auteur" FOREIGN KEY ("auteur_id")
          REFERENCES "compte_utilisateur" ("id") ON DELETE SET NULL ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_entree_audit_date_heure" ON "entree_audit" ("date_heure")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_entree_audit_auteur_id" ON "entree_audit" ("auteur_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_entree_audit_entite" ON "entree_audit" ("entite_type", "entite_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_entree_audit_personnel_id" ON "entree_audit" ("personnel_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Ordre inverse des dependances
    await queryRunner.query(`DROP TABLE IF EXISTS "entree_audit" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "demande_modification" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ligne_import" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "import_personnel" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "version_piece_jointe" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "piece_jointe" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "refresh_token" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "compte_utilisateur" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "decoration" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "affectation" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "competence_linguistique" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "stage_militaire" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cursus_scolaire" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "historique_grade" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "enfant" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "personnel" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "specialite" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "grade" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "unite" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "base" CASCADE`);

    // Types enum
    await queryRunner.query(`DROP TYPE IF EXISTS "action_audit"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "statut_demande"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "action_ligne_import"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "statut_ligne_import"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "statut_import"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "type_compte"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "niveau_competence"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "grade_categorie"`);

    // Note : les extensions pg_trgm et uuid-ossp ne sont pas supprimees
    // car elles peuvent etre utilisees par d'autres schemas de la meme base.
  }
}