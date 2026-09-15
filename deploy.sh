#!/usr/bin/env bash
# Déploiement sur le VPS, lancé par le job `deploy` de .github/workflows/main.yml.
#
# Le script est copié sur le VPS avec docker-compose.yml et le Caddyfile, puis
# exécuté par `ssh ... bash /opt/citatio/deploy.sh`. Un fichier versionné plutôt
# qu'un bloc `script:` dans le workflow : il se relit, se teste avec `bash -n`, et
# ne dépend plus d'une action tierce qui recevait la clé SSH (audit SEC-02).
#
# Entrée standard : le PAT GHCR, et rien d'autre. Il n'apparaît ainsi ni dans
# une ligne de commande (visible dans `ps` sur le VPS), ni dans un fichier.
set -euo pipefail
cd /opt/citatio

# Authentification au registre privé GHCR à chaque déploiement, pour ne pas
# dépendre d'un login manuel sur le VPS qui expire silencieusement. Déconnexion
# en sortie, y compris sur échec, pour ne pas laisser le PAT dans
# ~/.docker/config.json.
docker login ghcr.io -u MariusDev80 --password-stdin
trap 'docker logout ghcr.io >/dev/null' EXIT

docker compose pull
docker compose up -d --remove-orphans

# Compose ne recrée pas la gateway quand seul le contenu du Caddyfile change (la
# définition du service, elle, ne bouge pas), et Caddy ne relit pas son fichier.
# Sans ce bloc, la production a tourné du 2 au 14 septembre 2026 sur un ancien
# Caddyfile : ni redirection www, ni en-têtes de sécurité, diagnostics publics,
# avec un pipeline au vert (audit INF-01).
#
# Recréation plutôt que `caddy reload` : le Caddyfile est monté seul, donc lié à
# son inode au démarrage du conteneur, et la copie du déploiement remplace le
# fichier au lieu de le réécrire.
#
# Validation d'abord, dans un conteneur jetable de la même image que la gateway :
# un Caddyfile invalide fait échouer le déploiement et laisse tourner l'ancienne
# configuration, au lieu de couper le site.
if ! cmp -s Caddyfile .caddyfile.applied; then
  gateway_image=$(docker inspect -f '{{.Config.Image}}' citatio-gateway)
  docker run --rm -v "$PWD/Caddyfile:/etc/caddy/Caddyfile:ro" "$gateway_image" \
    caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
  # --no-deps : seule la gateway est recréée, coupure de l'ordre de la seconde.
  docker compose up -d --no-deps --force-recreate gateway
  cp Caddyfile .caddyfile.applied
fi

docker image prune -f
docker ps
