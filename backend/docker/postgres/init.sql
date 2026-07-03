-- Init des bases par microservice (une DB par module — cf. CLAUDE.md).
-- ATTENTION : ce script ne s'execute qu'au PREMIER init du conteneur
-- (volume de donnees vide). Sur un volume deja peuple, creer les bases
-- manuellement (voir le plan de deploiement).
CREATE DATABASE citatio_u1_db;
CREATE DATABASE citatio_u2_db;
