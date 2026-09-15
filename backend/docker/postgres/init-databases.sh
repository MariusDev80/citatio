#!/bin/sh
# Initialisation de Postgres : une base et un rôle par microservice.
#
# Ne s'exécute qu'au PREMIER démarrage du conteneur, sur un dossier de données
# vide (comportement de l'image officielle). Sur un volume déjà peuplé, rien ne
# se passe : pour régénérer, arrêter la base et vider ./data/db.
#
# Pourquoi un rôle par service (audit SEC-04). u1 et u2 se connectaient avec le
# superutilisateur de l'image : une injection SQL dans u2 (le futur blog, le
# service le plus exposé aux entrées) lisait les demandes de contact de u1, et
# un superutilisateur peut exécuter des commandes système depuis SQL
# (COPY ... TO PROGRAM). L'interdiction des jointures entre modules ne tenait que
# par discipline ; elle tient maintenant par les droits.
#
# Script shell et non plus init.sql : les mots de passe arrivent par variables
# d'environnement (secrets GitHub en production), qu'un fichier .sql ne sait pas lire.
# L'image source ce fichier quand il n'est pas exécutable (cas d'une copie par
# scp) : pas de `set -u` ni de sortie prématurée qui modifieraient son propre shell.

for var in U1_DB_PASSWORD U2_DB_PASSWORD; do
  eval "value=\${$var:-}"
  if [ -z "$value" ]; then
    echo "init-databases.sh : $var est vide, initialisation interrompue" >&2
    exit 1
  fi
done

# Les mots de passe passent en variables psql (-v) et sont cités par :'...' :
# jamais recopiés dans le texte SQL par le shell, donc aucune injection possible
# quel que soit leur contenu.
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
     -v u1_password="$U1_DB_PASSWORD" -v u2_password="$U2_DB_PASSWORD" <<'SQL'
CREATE ROLE u1_app LOGIN PASSWORD :'u1_password';
CREATE ROLE u2_app LOGIN PASSWORD :'u2_password';

-- Chaque rôle possède sa base. Depuis Postgres 15, le schéma public appartient à
-- pg_database_owner : être propriétaire de la base suffit pour y créer ses
-- tables (ddl-auto aujourd'hui, Flyway demain), sans aucun droit ailleurs.
CREATE DATABASE citatio_u1_db OWNER u1_app;
CREATE DATABASE citatio_u2_db OWNER u2_app;

-- Par défaut, tout rôle peut se connecter à toute base (droit accordé à PUBLIC).
-- On le retire : u2_app ne peut plus ouvrir citatio_u1_db, et inversement. Le
-- propriétaire garde son accès, le superutilisateur aussi.
REVOKE CONNECT, TEMPORARY ON DATABASE citatio_u1_db FROM PUBLIC;
REVOKE CONNECT, TEMPORARY ON DATABASE citatio_u2_db FROM PUBLIC;
REVOKE CONNECT, TEMPORARY ON DATABASE postgres FROM PUBLIC;
SQL

# POSTGRES_DB est créée par l'image avant ce script ; même fermeture.
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
     -c "REVOKE CONNECT, TEMPORARY ON DATABASE \"$POSTGRES_DB\" FROM PUBLIC;"
