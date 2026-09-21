#!/usr/bin/env bash
# Déploiement sur le VPS, lancé par la CI : `bash deploy.sh prod` depuis
# .github/workflows/deploy-prod.yml, `bash deploy.sh dev` depuis le job
# `deploy-dev` de .github/workflows/main.yml.
#
# Le script est copié sur le VPS avec la configuration de la cible (compose,
# Caddyfile, routes, script d'init de la base) puis exécuté par ssh. Un fichier
# versionné plutôt qu'un bloc `script:` dans le workflow : il se relit, se teste
# avec `bash -n`, et ne dépend d'aucune action tierce (audit SEC-02).
#
# Entrée standard : le PAT GHCR, et rien d'autre. Il n'apparaît ainsi ni dans
# une ligne de commande (visible dans `ps` sur le VPS), ni dans un fichier.
set -euo pipefail

target=${1:?usage: deploy.sh prod|dev}
case "$target" in
  prod)
    cd /opt/citatio
    compose=(docker compose)
    ;;
  dev)
    cd /opt/citatio-dev
    compose=(docker compose -f docker-compose.yml -f docker-compose.dev.yml)
    ;;
  *)
    echo "cible inconnue : $target (attendu : prod ou dev)" >&2
    exit 2
    ;;
esac

# Un déploiement à la fois sur le VPS, toutes cibles confondues. La CI met déjà
# les déploiements dev en série entre eux, et ceux de production entre eux, mais
# une PR peut se déployer en dev pendant une mise en production : le nettoyage
# d'images de l'un pourrait alors supprimer une image que l'autre vient de tirer
# et n'a pas encore démarrée. Le verrou attend au lieu d'échouer.
exec 9>"$HOME/.citatio-deploy.lock"
flock 9

# Authentification au registre privé GHCR à chaque déploiement, pour ne pas
# dépendre d'un login manuel sur le VPS qui expire silencieusement. Déconnexion
# en sortie, y compris sur échec, pour ne pas laisser le PAT dans
# ~/.docker/config.json.
docker login ghcr.io -u MariusDev80 --password-stdin
trap 'docker logout ghcr.io >/dev/null' EXIT

# Seul réseau partagé entre les deux piles : la gateway de production y rejoint
# la gateway dev. Déclaré par docker-compose.yml, mais externe pour la dev : on
# le crée s'il manque, pour que le premier déploiement dev n'attende pas un
# déploiement de production.
#
# Avec les étiquettes que Compose poserait lui-même pour le projet de production :
# un réseau créé sans elles, Compose refuse ensuite de l'utiliser pour un réseau
# qu'il déclare (« network citatio-edge was found but has incorrect label »), et
# le déploiement de production suivant échouerait. Vérifié le 15 septembre 2026
# avec Compose 2.39 et 5.0 (celle du VPS).
docker network inspect citatio-edge >/dev/null 2>&1 \
  || docker network create \
       --label com.docker.compose.project=citatio \
       --label com.docker.compose.network=edge \
       citatio-edge

# Validation du Caddyfile avant tout arrêt de conteneur : une configuration
# invalide fait échouer le déploiement et laisse tourner l'ancienne, au lieu de
# couper le site. `compose run` et non `docker run` : le conteneur jetable reçoit
# exactement les montages et l'environnement du service (routes partagées,
# hash de l'authentification dev), donc valide ce que la gateway lira.
"${compose[@]}" run --rm --no-deps --entrypoint caddy gateway \
  validate --config /etc/caddy/Caddyfile --adapter caddyfile

"${compose[@]}" pull

if [ "$target" = dev ]; then
  # Base recréée à chaque déploiement : `down -v` supprime le volume dev-db, et
  # Postgres rejoue init-databases.sh au démarrage suivant. Une PR qui ajoute une
  # migration ne laisse ainsi rien derrière elle, et le déploiement suivant
  # (autre PR, ou develop) repart d'une base vide sans conflit de schéma.
  "${compose[@]}" down -v --remove-orphans
fi

"${compose[@]}" up -d --remove-orphans

if [ "$target" = prod ]; then
  # Compose ne recrée pas la gateway quand seul le contenu d'un fichier monté
  # change (la définition du service, elle, ne bouge pas), et Caddy ne relit pas
  # sa configuration. Sans ce bloc, la production a tourné du 2 au 14 septembre
  # 2026 sur un ancien Caddyfile : ni redirection www, ni en-têtes de sécurité,
  # diagnostics publics, avec un pipeline au vert (audit INF-01).
  #
  # Le témoin couvre les deux fichiers lus par Caddy : une modification de
  # caddy/routes.caddy seule doit elle aussi être appliquée. Recréation plutôt
  # que `caddy reload` : les fichiers sont montés seuls, donc liés à leur inode,
  # et la copie du déploiement les remplace au lieu de les réécrire.
  # (La gateway dev, elle, est recréée à chaque déploiement par `down`.)
  if ! cat Caddyfile caddy/routes.caddy | cmp -s - .caddyfile.applied; then
    # --no-deps : seule la gateway est recréée, coupure de l'ordre de la seconde.
    "${compose[@]}" up -d --no-deps --force-recreate gateway
    cat Caddyfile caddy/routes.caddy > .caddyfile.applied
  fi
fi

# Les images sont taguées par commit : aucune ne devient orpheline au `pull`
# suivant, et `prune -f` seul ne supprimait plus rien. On retire les images
# inutilisées construites il y a plus d'une semaine ; celles des conteneurs en
# marche sont toujours gardées, quel que soit leur âge. Un retour en arrière
# vers une image plus ancienne la retélécharge simplement depuis GHCR. Le verrou
# plus haut empêche de supprimer l'image d'un déploiement concurrent.
docker image prune -af --filter "until=168h"
"${compose[@]}" ps
