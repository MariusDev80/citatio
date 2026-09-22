# CLAUDE.md, Citatio

> Document de référence du dépôt. Toute personne et tout agent qui touche à ce code le lit d'abord.
> **Il se suffit à lui-même** : il n'y a ni persona, ni skill, ni document annexe à charger. Ce qui
> compte pour livrer ici est écrit ci-dessous, y compris les vérifications à faire et les erreurs à
> ne pas commettre, avec la raison de chacune.
>
> En cas de contradiction entre ce fichier et le code, le code gagne : signale l'écart et corrige le
> document dans la foulée.

---

## 1. Le projet en une page

Citatio est une **agence web de trois personnes installée à La Chapelle-sur-Erdre (44), près de
Nantes**. Elle conçoit, développe et héberge des **sites vitrines sur mesure** pour artisans,
commerces, TPE, PME et indépendants. Le **référencement Google (SEO)** et la **visibilité dans les
réponses des IA (GEO)** sont vendus en options, avec un abonnement couvrant hébergement, nom de
domaine et maintenance.

L'entreprise vient d'un positionnement **100 % GEO** et a pivoté vers le studio de sites vitrines.
Des traces de l'ancien positionnement peuvent subsister ; le nom de domaine `citatio-geo.com` en est
une, assumée et conservée (`citatio.fr` et `citatio.com` appartiennent à des tiers). **La marque est
`Citatio`, sans suffixe GEO.**

### 1.1 La question à poser avant toute tâche : notre site, ou celui d'un client ?

C'est la confusion la plus coûteuse du projet, et la seule qui fasse perdre une journée entière.
Deux objets portent les mêmes mots (« le site », « la page d'accueil », « le SEO ») :

- **🏠 Le site Citatio, le nôtre.** Ce dépôt. Notre vitrine, notre outil de vente, et la seule preuve
  de savoir-faire dont l'agence dispose aujourd'hui. C'est **la cible par défaut** de toute demande.
- **👥 Les sites de nos clients.** Ce que nous construisons **pour d'autres entreprises**, vendu sous
  forme de formules et d'options (vitrine, SEO, GEO, hébergement, nom de domaine, maintenance).
  Ce sont des **prestations commerciales**. **Elles ne vivent pas dans ce dépôt**, et rien de ce qui
  est décrit ici ne doit être livré tel quel à un client sans décision explicite.

**Protocole, à appliquer systématiquement :**

1. Si la demande nomme un client, une entreprise tierce, un autre domaine, ou parle de « livrer »,
   « le site du client », « son SEO », alors **arrête-toi et demande confirmation avant d'écrire une
   ligne**. Formulation suggérée :

   > « Avant de commencer, je confirme la cible : cette demande concerne bien **notre site Citatio**
   > (ce dépôt), ou bien **le site d'un client** ? »

2. Si rien ne l'indique, considère qu'il s'agit du **site Citatio**, et **dis-le explicitement** dans
   ta réponse pour que l'hypothèse soit visible et corrigeable en une phrase.
3. Dans les plans, les messages de commit et les commentaires, **nomme la cible** quand une
   ambiguïté est possible : « sur notre site », « pour un site client ».
4. Le code de ce dépôt ne contient aucune notion de client. Si une demande implique d'en créer une
   (multi-tenant, thème par client, gabarit vendu), c'est une **décision produit** : elle revient au
   propriétaire, pas à toi.

### 1.2 État réel du projet, au 11 septembre 2026

Ce que le dépôt contient vraiment, pour éviter de raisonner sur un système imaginaire :

| Brique | État |
|--------|------|
| Site vitrine Angular, 11 routes, entièrement pré-rendu | **En production**, sur `citatio-geo.com` |
| Design system éditorial (tokens, typo, filets, thème sombre) | **En production** |
| SEO / GEO on-page (meta, JSON-LD, sitemap, llms.txt, robots) | **En production** |
| CI GitHub Actions (Vitest + Playwright + build/push GHCR + déploiement VPS) | **Opérationnelle** |
| Environnement dev (`dev.citatio-geo.com`, même VPS, cloisonné) | **Déployé à chaque commit de PR et push sur `develop`**. La production ne part plus que par le bouton « Deploy production » (§4.3) |
| Gateway Caddy, TLS, en-têtes de sécurité, routage `/api/uX` | **Opérationnelle** |
| `u1-communication` (Spring Boot) | **Une fonction réelle** : réception du formulaire de contact (entité `ContactRequest`, envoi SMTP asynchrone). Le reste (`/health`, sondes, `ping-u2`) est inchangé |
| `u2-blog` (Spring Boot) | **Squelette** : `/health`, sondes Actuator et `ping-u1`, aucune entité métier |
| Indépendance des deux microservices | **Acquise** : aucun `depends_on` croisé, appels absorbés par `UpstreamClient` (timeouts, disjoncteur, dégradation gracieuse) |
| Consommation du backend par le frontend | **Un seul appel** : `ContactService` poste sur `/api/u1/contact-requests`. `provideHttpClient(withFetch())` est en place, les 11 routes restent pré-rendues et aucune requête ne part au rendu |
| Formulaire de contact | **Branché sur `u1-communication`** : la demande est enregistrée en base puis notifiée par email. Le `mailto:` a été retiré |
| Blog | **Pas commencé**, prévu sur `u2-blog` |

Conséquence pratique : **une modification du frontend n'a toujours besoin d'aucun backend démarré**,
les 11 routes étant pré-rendues au build. Seul l'envoi du formulaire de contact appelle une API, et
seulement sur un clic du visiteur. En dehors de ce point, ne raisonne pas comme si une API était
branchée : il n'y en a qu'une.

---

## 2. Protocole de travail

### 2.1 Avant d'écrire une ligne

1. **Confirmer la cible** (§1.1) : notre site ou un site client.
2. **Vérifier l'état réel** (§1.2). La moitié des mauvaises implémentations viennent de l'hypothèse
   qu'un backend, une API ou un blog existe déjà.
3. **Ouvrir la source de vérité** du sujet touché (§11). Un prix, une adresse, un chiffre mesuré, un
   token de couleur ont chacun **un seul** fichier propriétaire.
4. **Lire le code voisin.** Ce dépôt a un style : commentaires qui expliquent la décision, pas la
   ligne suivante. Écris dans ce style, pas dans le tien.
5. Si la demande contredit une règle de ce document, **dis-le en une phrase, propose l'alternative,
   et attends l'arbitrage** plutôt que de contourner en silence.

### 2.2 Pendant

- Respecter les règles de la couche touchée : §4.1 frontend, §4.2 backend, §4.3 infra, §5 design.
- Toute nouvelle dépendance se justifie. Le site tient à 100/100 en partie parce qu'il en a peu.
- Chaque garde-fou retiré emporte le commentaire qui l'explique ; chaque garde-fou ajouté vient avec
  la raison de son existence.
- Ne « corrige » pas un test qui échoue en modifiant le test. Plusieurs tests e2e sont des garde-fous
  de doctrine (§8.2) : leur échec signale presque toujours une régression réelle.

### 2.3 Avant de dire que c'est fini

Les commandes sont détaillées en §8. Selon ce que tu as touché :

**Changement visuel, de copie ou de composant (frontend)**

1. `npm test` (Vitest) au vert.
2. `npm run build`, puis les e2e contre le dist pré-rendu : `npm run e2e`.
3. Si une couleur, un token ou le thème sont touchés : `npm run check:contrast` (thème sombre).
4. **Ouvrir la page dans les deux thèmes.** Le thème sombre n'est pas une variante secondaire.
5. Balayage de largeurs 320 / 768 / 1024 / 1440 / 2560 px : aucun débordement horizontal.
6. Si la structure, une police ou un asset changent : Lighthouse sur les routes touchées, profil
   ordinateur. Le site publie 100/100/100/100, une baisse doit être vue avant la mise en ligne.
7. Relecture contre les marqueurs interdits (§6.1) et le ton éditorial (§6.3), tirets cadratins
   compris.

**Nouvelle route**

La liste complète des sept points est en §7. En oublier un (typiquement le `sitemap.xml` ou le
`llms.txt`) est la régression la plus fréquente du projet.

**Chiffre, score ou promesse affichés sur le site**

1. La mesure a été **refaite**, pas recopiée.
2. `site-metrics.config.ts` porte le `howToVerify` et la date `MEASURED_ON` mise à jour.
3. Si tu ne peux pas mesurer, **tu n'affiches pas**. Voir la règle de preuve (§6.2).

**Endpoint ou entité backend**

1. `./mvnw -pl <module> -am test` au vert.
2. DTO en records, aucune entité JPA exposée, validation `@Valid`, erreurs en Problem Details.
3. Contrôleur mappé sous `/api/u1` ou `/api/u2`, préfixe conservé.
4. Aucune jointure vers la base d'un autre module.
5. Si le contrat change : `docker compose up --build` et appel réel de l'endpoint.
6. **Si le frontend doit le consommer** : il n'y a aujourd'hui aucun `HttpClient`. Il faut ajouter
   `provideHttpClient(withFetch())` **et trancher le mode de rendu de la route concernée** : une page
   qui dépend d'une API ne peut plus être pré-rendue au build comme les autres (§4.1).

**Infrastructure**

1. `docker compose up --build` en local, la pile complète démarre.
2. Le fichier modifié est-il **synchronisé vers le VPS** par les étapes `scp` des deux workflows
   (`deploy-dev` dans `main.yml`, et `deploy-prod.yml`) ? Sinon le changement n'aura aucun effet.
3. Aucun `ports:` sur `u1-communication` ni `u2-blog`.
4. La PR passe **en dev** (job `Deploy to dev` vert, contrôles compris) avant le merge.
5. Après la mise en production, le step « Verify production » vérifie en une passe :
   `https://www.citatio-geo.com` répond 301, une route pré-rendue répond 200 **sans redirection**,
   une URL inconnue répond **404** et non 200, la dev répond 401.

### 2.4 Les interdits, et pourquoi

| Ne fais pas ça | Parce que |
|---|---|
| Une paire `dark:` de couleur dans un gabarit | Le thème sombre est une permutation de tokens (§5.1). La paire mécanique réintroduit le marqueur générique et double la maintenance. |
| Une couleur Tailwind brute (`indigo-600`, `slate-900`) | Elle échappe au thème, donc au thème sombre et au contrôle de contraste. |
| Coder en dur un prix, une adresse, un SIRET, un score | Trois fichiers de configuration font autorité (§11). Un doublon dérive, et ici une dérive est un mensonge affiché. |
| Afficher un chiffre non mesuré, un faux avis, un logo client | Le site est notre seule preuve. Une preuve fausse détruit l'argument commercial entier (§6.2). |
| Écrire un tiret cadratin | C'est le marqueur d'écriture par IA le plus reconnaissable, et le site est notre seule preuve. **Interdit dans tout fichier du dépôt**, code, commentaires, Markdown et messages de commit compris. Ordre complet et commande de vérification en §6.3. |
| `standalone: true`, `@Input()`, `ngClass`, injection par constructeur | Conventions Angular 21 du projet (§4.1). L'uniformité rend le code relisible en un coup d'œil. |
| Toucher au DOM, à `window` ou à `localStorage` hors `afterNextRender` | Le prerendering plante, et l'hydratation avec lui. Les 11 routes sont pré-rendues. |
| Cacher du contenu derrière une animation sans garde `html.ct-js` | Sans JavaScript et pour un crawler, le contenu resterait invisible. |
| Exposer une entité JPA dans une réponse | Le schéma de base devient un contrat public, impossible à faire évoluer. |
| Une jointure vers la base d'un autre module | Le découpage en microservices ne tiendrait plus, et les deux bases se verrouilleraient mutuellement. |
| `ports:` sur `u1` ou `u2` dans `docker-compose.yml` | Cela publie les microservices sur Internet. Déjà corrigé une fois (§10). |
| `handle_path` à la place de `handle` dans `caddy/routes.caddy` | Le préfixe `/api/uX` serait retiré, alors que les contrôleurs Spring sont mappés dessus. |
| Retirer une étape `scp` d'un workflow de déploiement | `docker-compose.yml`, le `Caddyfile` et les routes ne seraient plus déployés : le VPS resterait sur l'ancienne configuration, en silence. |
| Pousser sur `develop` sans demande explicite, ou lancer « Deploy production » | Un push sur `develop` **redéploie la dev**, qu'une PR en cours de test occupait peut-être. Le bouton **met en production**. |
| Faire rejoindre `citatio-edge` à un autre conteneur que les deux gateways | Les noms de service (`frontend`, `u1-communication`) s'y résoudraient entre dev et production : la gateway de production pourrait servir la dev. |
| Remettre un tag `latest` dans le déploiement | La dev et la production tirent un SHA précis. Avec `latest`, une PR pourrait remplacer l'image de production. |
| Annoncer une vérification qui n'a pas tourné | Voir §2.5. |

### 2.5 Rendre compte

- Dis ce que tu as **réellement** vérifié, et nomme ce que tu n'as pas pu vérifier. « Lighthouse non
  relancé » est une information utile ; « tout est vert » quand rien n'a tourné est une faute.
- Si un test échoue, montre la sortie. Si une partie du périmètre est bloquée, termine le reste et
  dis précisément ce qui manque et pourquoi.
- Le même standard s'applique au site lui-même : ce document et le produit partagent une seule
  exigence, **ne rien affirmer qui ne soit vérifiable**.

---

## 3. Carte du dépôt

```
citatio/
├── CLAUDE.md                     ← ce fichier, seul document de référence
├── docker-compose.yml            ← orchestration complète (db, u1, u2, front, gateway), production
├── docker-compose.dev.yml        ← surcharge de l'environnement dev (noms, base jetable, sans port)
├── Caddyfile                     ← gateway de production : domaines, TLS, www, porte de la dev
├── caddy/routes.caddy            ← en-têtes, diagnostics, routage /api/uX, communs prod et dev
├── caddy/Caddyfile.dev           ← gateway dev, derrière celle de production
├── .github/workflows/main.yml    ← tests, build, déploiement dev
├── .github/workflows/cleanup-ghcr.yml ← ménage quotidien des images GitHub Packages
├── .github/workflows/deploy-prod.yml ← bouton de mise en production (et de retour en arrière)
├── .github/workflows/dev-dependabot.yml ← build et dev des PR Dependabot (workflow_run)
├── .github/actions/vps-ssh/      ← connexion SSH au VPS, clé d'hôte vérifiée
├── .github/actions/build-images/ ← construction et publication des trois images
├── .github/actions/deploy-dev/   ← déploiement dev et ses contrôles
├── deploy.sh                     ← exécuté sur le VPS : `deploy.sh prod` ou `deploy.sh dev`
├── data/                         ← volumes Docker locaux, ignoré par git
├── frontend/                     ← Angular 21, SSR + prerendering
│   ├── src/app/config/           ← identité, tarifs, mesures : sources de vérité uniques
│   ├── src/app/pages/            ← une route = un dossier (ts + html + css)
│   ├── src/app/services/         ← SeoService, JsonLdService, ThemeService
│   ├── src/app/shared/           ← FlourishComponent, RevealDirective, format-euro
│   ├── src/app/theme/            ← preset PrimeNG dérivé de la palette
│   ├── src/styles.css            ← design system complet (tokens, base, composants ct-*)
│   ├── public/                   ← robots.txt, sitemap.xml, llms.txt, polices, images
│   ├── tools/                    ← scripts de vérification et de génération d'assets
│   ├── e2e/                      ← Playwright, tourne contre le dist pré-rendu
│   └── nginx.conf                ← cache, redirections 301, vraies 404
└── backend/                      ← Maven multi-modules, Spring Boot 4
    ├── pom.xml                   ← POM parent agrégateur (packaging pom, aucun code applicatif)
    ├── common-libs/              ← DTO et config partagés
    ├── u1-communication/         ← mails, contact (port 8081, base citatio_u1_db)
    ├── u2-blog/                  ← blog (port 8082, base citatio_u2_db)
    └── docker/postgres/init-databases.sh ← bases et rôles u1_app / u2_app, premier démarrage du volume
```

---

## 4. Stack et architecture

### 4.1 Frontend, Angular 21

**Stack** : Angular 21.1.2 (`@angular/build:application`, esbuild) · **SSR + prerendering**
(`@angular/ssr`) · **Tailwind CSS v4** via `@tailwindcss/postcss` (configuré dans
`postcss.config.json`, **jamais** en `.js`, aucun `tailwind.config`) · PrimeNG 21 thémé par
`@primeuix/themes` (preset Aura dérivé dans `src/app/theme/citatio-preset.ts`) · PrimeIcons ·
**CSS pur** (jamais de SCSS) · **Vitest** (unitaire) · **Playwright** (e2e) · TypeScript strict.

**Rendu** : les 11 routes sont **pré-rendues** (`app.routes.server.ts`, `RenderMode.Prerender`),
la 404 seule est rendue côté client. Le build produit du HTML statique servi par nginx. C'est un
**argument commercial affiché sur `/ce-site`** : le contenu doit être dans le HTML source, jamais
injecté par JavaScript. Un test e2e verrouille cette propriété. Toute page future qui dépendra d'une
API (le blog en premier) devra **choisir explicitement** son mode de rendu, prerender au build ou
rendu serveur, et ce choix se justifie dans le code.

**Règles non négociables :**

- Composants **standalone** uniquement. Ne jamais écrire `standalone: true`, c'est le défaut.
- `ChangeDetectionStrategy.OnPush` dans **tous** les composants.
- **Signals** pour l'état réactif, `computed()` pour le dérivé. Jamais `mutate`, utiliser `set` / `update`.
- `inject()` pour l'injection de dépendances. **Jamais d'injection par constructeur.**
- `input()`, `input.required()`, `output()`. **Jamais** `@Input()` / `@Output()`.
- Flux de contrôle natif `@if` / `@for` / `@switch`. **Aucune fonction fléchée dans un template.**
- **Trois fichiers par composant** : `.ts`, `templateUrl` `.html`, `styleUrl` `.css` (singulier, `.css`).
- Objet `host: {}`. **Jamais** `@HostBinding` / `@HostListener`.
- `NgOptimizedImage` pour les images statiques. Chargement paresseux de chaque route (`loadComponent`).
- **Ni `ngClass` ni `ngStyle`** : bindings `[class.x]` ou classes Tailwind statiques.
  (Un `[class]` global avait cassé l'hydratation en fusionnant `pi-moon` et `pi-sun`, voir §10.)
- Formulaires **réactifs**, jamais template-driven.
- TypeScript strict, `strictTemplates` actif. Jamais `any`, utiliser `unknown`.
- **Compatibilité SSR obligatoire** : aucun accès au DOM, à `window`, `localStorage` ou
  `IntersectionObserver` hors `afterNextRender()` et hors garde `isPlatformBrowser`.

### 4.2 Backend, Java 21 et Spring Boot 4

**Stack** : Java 21 (records, pattern matching, threads virtuels) · Spring Boot 4.0.2 · Spring Data
JPA · PostgreSQL 15 · Lombok · Maven multi-modules · JUnit 5 + Mockito (H2 en test).

**Architecture microservices :**

- **Une base et un rôle par module.** `citatio_u1_db` appartient à `u1_app`, `citatio_u2_db` à
  `u2_app`, créés par `init-databases.sh`. Chaque rôle est refusé sur la base de l'autre (droit
  `CONNECT` retiré à `PUBLIC`) et n'est pas superutilisateur : les **jointures inter-modules sont
  interdites**, sans exception, et la base le garantit. Aucun service ne se connecte avec le
  superutilisateur `user`, réservé à l'administration.
- Les modules ne se parlent **qu'en REST**, et **jamais en direct** : tout appel inter-modules passe
  par `common-libs/client/UpstreamClient`, qui absorbe la panne et la rend en `UpstreamStatus`
  (`REACHABLE` / `UNREACHABLE` + motif fermé). L'appelant n'a donc **aucune exception à gérer** et
  reste disponible quand son voisin est coupé. Trois pièces derrière : `RestClientFactory`
  (transport JDK avec pool, 2 s de connexion, 2 s de lecture), `UpstreamCircuitBreakers` (Resilience4j
  nu, pas le starter, incompatible Boot 4) et le motif d'échec, volontairement grossier pour ne rien
  dire de l'infrastructure.
- **Un motif d'échec ne contient jamais le message d'exception.** Il a déjà publié
  `http://u2-blog:8082/...` sur un endpoint accessible depuis Internet. Le détail va dans les logs.
- L'URL de base vient d'une variable d'environnement (`U1_BASE_URL`), qui vaut le **nom de service
  Docker** en production et `localhost` en développement.
- Chaque module se construit et se teste **indépendamment** : `./mvnw -pl u2-blog -am package`.
- Les DTO et configurations partagés vivent dans `common-libs`, importés explicitement
  (`@Import(CommonWebConfig.class)`). Jamais de fuite d'interne de module.

**Règles Java :**

- **Records** pour tous les DTO, requêtes, réponses, projections.
- Injection par constructeur : champs `final` + `@RequiredArgsConstructor`. **Jamais `@Autowired`
  sur un champ.**
- `jakarta.validation` sur les DTO d'entrée, activée par `@Valid`.
- Style fonctionnel : `Optional`, streams, lambdas plutôt que boucles et tests de nullité.
- Contrôleurs mappés sous **`/api/u1`** et **`/api/u2`** : le préfixe est **conservé** par la
  gateway (`handle`, pas `handle_path`).
- Ressources au pluriel (`/articles`, `/messages`), sémantique HTTP stricte,
  **Problem Details (RFC 7807)** via l'`ApiExceptionHandler` partagé, 201 à la création,
  204 à la suppression, 400 en validation, 404 en absence.
- Un `@RestControllerAdvice` qui attrape `Exception` **hérite de `ResponseEntityExceptionHandler`**,
  sinon il avale les exceptions de Spring MVC qui portaient déjà le bon statut (§10).
- Pagination (`Page<T>` / `Slice<T>`) sur toute liste, suppressions logiques plutôt que physiques.
- **Interdits** : injection par champ, logique métier dans un contrôleur (elle va en `@Service`),
  exposition d'entités JPA (toujours mapper vers un record), `System.out.println` (SLF4J `@Slf4j`),
  types bruts.
- **Dette connue** : `spring.jpa.hibernate.ddl-auto=update` sur les deux modules. Dès qu'une entité
  réelle apparaît, passer à **Flyway** avant la première mise en production de schéma.
- Les origines CORS sont **fermées** (`citatio.cors.allowed-origins`, la production par défaut).
  En dev avec `ng serve` : `CORS_ALLOWED_ORIGINS=http://localhost:4200`.

### 4.3 Infrastructure

**Chaîne complète** : GitHub Actions → images `ghcr.io` → VPS Hostinger → `docker compose` →
Caddy (TLS, gateway) → nginx (statique) ou microservices Spring.

- **Caddy** (`Caddyfile` pour les domaines, `caddy/routes.caddy` pour le reste, importé aussi par
  la dev) : certificats automatiques, `www` redirigé en **301** vers l'apex,
  compression `zstd gzip`, en-têtes de sécurité (HSTS 2 ans, `nosniff`, `Referrer-Policy`,
  `X-Frame-Options`, `Permissions-Policy`, suppression de l'en-tête `Server`).
  Routage : `/api/u1/*` → `u1-communication:8081`, `/api/u2/*` → `u2-blog:8082`, tout le reste →
  `frontend:80`. Les endpoints de diagnostic `/api/u1/ping-u2` et `/api/u2/ping-u1` sont
  **coupés de la surface publique** (404 avant les règles de proxy, un 403 confirmerait la route) :
  ils nomment les services internes sans rien rendre au visiteur. Ils restent joignables depuis le
  réseau Docker, ce qui suffit à l'exploitation :
  `docker exec citatio-gateway wget -qO- http://u1-communication:8081/api/u1/ping-u2`.
  Les sondes `/actuator/**` ne sont routées vers aucun microservice, donc inaccessibles de l'extérieur.
- **Sondes de santé** : le `healthcheck` Docker de `u1` et `u2` interroge
  `/actuator/health/liveness`, et non `/api/uX/health` qui répond `UP` tant que le serveur web
  répond, base coupée comprise. La liveness ignore délibérément la base (une base momentanément
  absente ne doit pas déclencher une boucle de redémarrage) ; la readiness, elle, l'inclut.
  À savoir : `restart: always` ne redémarre **pas** un conteneur `unhealthy`, et plus aucun
  `depends_on` ne consomme ces sondes. Elles sont **informatives, pas correctives** : ne compte pas
  dessus pour de l'auto-guérison.
- **Exposition réseau** : les microservices utilisent `expose`, **jamais `ports`**. Ils ne sont
  joignables que depuis le réseau Docker interne.
- **nginx** (`frontend/nginx.conf`) : cache immuable d'un an sur les assets hachés, `no-cache` sur
  le HTML, 301 des anciennes URL anglaises (`/about`, `/services`), résolution
  `try_files $uri $uri/index.html` pour servir les routes pré-rendues **sans slash final**
  (le slash contredirait les balises canoniques), et `error_page 404` renvoyant le corps du SPA avec
  un **vrai statut 404** (un « soft 404 » se fait désindexer).
- **CI/CD, intégration et dev** (`.github/workflows/main.yml`) : tests unitaires, e2e et **tests
  backend** (`./mvnw -B test`) sur **tout push sur `develop` et toute PR vers `develop`**. Les images
  se construisant avec `-DskipTests`, sans ce job les tests backend ne tourneraient nulle part.
  Ensuite, sur un push `develop` **et sur chaque commit d'une PR du dépôt** (ni les forks, ni
  Dependabot, voir juste en dessous) : build et push des trois images **taguées par SHA** (jamais
  `latest`), puis **déploiement en dev** et contrôles depuis le VPS (u1 et u2 prêts base comprise,
  200, 404, diagnostics coupés, 405). Un nouveau commit sur une PR annule le pipeline du précédent ;
  les déploiements dev passent en série, le dernier l'emporte. Le build et le déploiement dev vivent
  dans deux actions locales, `.github/actions/build-images` et `.github/actions/deploy-dev`,
  partagées avec le workflow Dependabot : les deux chemins déploient et vérifient la même chose.
- **CI/CD, PR Dependabot** (`.github/workflows/dev-dependabot.yml`) : GitHub donne un `GITHUB_TOKEN`
  en **lecture seule** aux pipelines lancés par Dependabot, quelles que soient les `permissions`
  demandées, pour qu'une mise à jour hostile ne publie rien. `main.yml` ne peut donc ni construire ni
  déployer ces PR. Ce second workflow se déclenche **à la fin** du pipeline de tests
  (`workflow_run`), s'exécute dans le contexte du dépôt et non de la PR, retrouve la PR par sa
  branche, construit son **commit de fusion**, déploie en dev et commente la PR avec le résultat,
  qui n'apparaît pas dans ses contrôles. À savoir : GitHub lit toujours ce fichier depuis `develop`,
  une modification ne s'éprouve donc qu'une fois mergée. Le montage précédent, un PAT dans le coffre
  de secrets Dependabot, a été **refusé par GHCR** le 21 septembre 2026 alors que ses droits étaient
  corrects, et chaque PR devait être reprise à la main par un commit vide, ce qui coupe le suivi
  Dependabot sur la branche.
- **Nettoyage GHCR** (`.github/workflows/cleanup-ghcr.yml`) : **une fois par jour**, à 3 h 30 UTC,
  et à la demande. Garde les 20 dernières versions de chaque image, plus celle taguée `prod`.
  Il tournait à la fin de chaque déploiement : un build a alors échoué sur `ERROR: unknown blob`,
  très probablement parce qu'il réutilisait des couches qu'un nettoyage concurrent supprimait.
- **CI/CD, production** (`.github/workflows/deploy-prod.yml`) : **uniquement à la main**, onglet
  Actions, « Deploy production », sur `develop`. Rien n'est reconstruit : le bouton **refuse un commit
  qui n'a pas réussi son déploiement dev** sur un push `develop`, tague ses images `prod`, et les
  déploie. Un SHA précédent en entrée sert de **retour en arrière**, infrastructure de l'époque
  comprise. Le déploiement passe par l'OpenSSH du runner, **sans action tierce** (les actions
  `appleboy/*` recevaient la clé SSH et téléchargeaient un binaire non épinglé), avec la **clé d'hôte
  du VPS écrite dans `.github/actions/vps-ssh`** : un serveur inconnu fait échouer le job. Il copie
  `docker-compose.yml`, `Caddyfile`, `caddy/routes.caddy`, `deploy.sh` et `init-databases.sh`, écrit
  le `.env` depuis les secrets, puis lance `deploy.sh prod` : `caddy validate`, `docker compose pull
  && up -d`, et **recréation de la gateway si le Caddyfile ou les routes ont changé**. Un dernier
  step **vérifie la production** (200, 301 du www, vraies 404, diagnostics coupés, HSTS, dev en 401
  avec `X-Robots-Tag`) et fait échouer le job au moindre écart.
- **Environnement dev** (`https://dev.citatio-geo.com`, identifiant `citatio`) : même VPS, projet
  Compose `citatio-dev` dans `/opt/citatio-dev`, `docker-compose.yml` surchargé par
  `docker-compose.dev.yml`. Cloisonné par les **données et le réseau**, pas par les privilèges
  (même compte Docker) : conteneurs `citatio-dev-*`, réseau par défaut propre, limites mémoire, et
  **base recréée à chaque déploiement** (`down -v`, mots de passe tirés au hasard) : chaque
  déploiement rejoue les migrations depuis zéro, aucune PR n'hérite du schéma d'une autre. La gateway
  de production termine le TLS, pose l'**authentification basique** et `X-Robots-Tag: noindex`,
  puis relaie vers `citatio-dev-gateway` par le réseau `citatio-edge`, où ne se trouvent que les deux
  gateways. Ces protections vivant dans le `Caddyfile` de production, une PR ne peut pas les retirer.
  Les notifications du formulaire partent vers la même boîte que la production, expéditeur
  « Formulaire Citatio (dev) ». À savoir : le workflow et `deploy.sh` exécutés pour une PR sont ceux
  de la branche, donc quiconque peut pousser une branche agit sur le VPS.
- **Secrets** : `VPS_IP`, `VPS_USER`, `SSH_PRIVATE_KEY`, `GHCR_PAT`, les `MAIL_*`, et
  `POSTGRES_PASSWORD`, `U1_DB_PASSWORD`, `U2_DB_PASSWORD`, `DEV_AUTH_HASH` (sortie de
  `caddy hash-password`), côté GitHub, dans le **coffre Actions uniquement**. Le coffre Dependabot
  ne sert plus à rien depuis `dev-dependabot.yml` : `GHCR_PAT` y a été supprimé le 22 septembre 2026,
  et ce qu'il reste (`SSH_PRIVATE_KEY`, `VPS_IP`, `VPS_USER`, les `MAIL_*`) n'est lu par aucun
  workflow. N'y remets rien : un secret ajouté là serait exposé au code des PR de dépendances sans
  rien apporter. Jamais de secret dans le dépôt. Les mots de passe Postgres de `docker-compose.yml` (`password`, `u1_dev_password`...) ne
  servent qu'en local ; le déploiement échoue si l'un des trois secrets manque, pour que la
  production ne démarre jamais avec eux. Ils ne sont lus qu'à l'**initialisation** de la base :
  changer un secret ensuite demande un `ALTER ROLE` sur le VPS, sinon u1 ou u2 ne se connecte plus.
  En local, un `./data/db` créé avant les rôles (15 septembre 2026) est à vider une fois.

---

## 5. Le design system

Tout tient dans **`frontend/src/styles.css`**. C'est la source de vérité, il est commenté ligne à
ligne, et il faut le lire avant de styler quoi que ce soit.

### 5.1 Les partis pris

- **Palette papier / encre / outremer, en tokens sémantiques.** `--color-paper`, `--color-surface`,
  `--color-ink`, `--color-ink-soft`, `--color-ink-faint`, `--color-rule`, `--color-accent`, plus
  `--color-danger` réservé aux messages d'erreur (brique en clair, corail en sombre). Une erreur
  rendue en `--color-accent` se lisait comme un lien, pas comme un échec.
  Les gabarits n'utilisent **jamais** une couleur Tailwind brute.
- **Le thème sombre est une permutation de tokens, pas un second jeu d'utilitaires.** Les valeurs
  sont redéfinies sous `html.dark` dans `@layer base`. Conséquence, et c'est **la règle qui surprend
  le plus** : on écrit `bg-paper text-ink`, et **jamais de paire `dark:` de couleur** dans un
  gabarit. Le jumeau `dark:` mécanique sur chaque utilitaire était l'un des marqueurs génériques que
  la refonte a supprimés.
- **Deux polices, auto-hébergées, 72 ko en tout.** *Instrument Serif* pour l'affichage
  (`ct-display-xl/lg/md` seulement, c'est une graisse 400 unique qui paraît frêle en petit) et
  *Geist* variable pour tout le reste. Sous-ensemble latin, `font-display: swap`, les deux faces
  du LCP sont préchargées dans `index.html`. **Aucun appel à Google Fonts**, vérifiable depuis
  l'onglet Réseau, donc affiché comme preuve sur `/ce-site`.
- **Deux rayons seulement** (`--radius-sm: 2px`, `--radius-md: 6px`). L'ancienne feuille en avait six.
- **Des filets 1px plutôt que des cartes.** `.ct-rule` et `.ct-rule-strong` structurent les pages.
  Les surfaces (`.ct-panel`) sont réservées aux offres et au bloc de contact.
- **Numérotation éditoriale** (`.ct-numeral`, 01 / 02 / 03) à la place des pastilles à icônes.
- **Mouvement minimal, deux dispositifs.** Une entrée de héros jouée une fois au premier rendu
  (`.ct-hero-stagger`), et un `ctReveal` au défilement, **trois fois par page au maximum**.
  Tout est conditionné à `html.ct-js` : sans JavaScript, ou avant hydratation, le contenu est
  **entièrement visible**. Rien ne doit jamais être caché à un crawler par une animation.
  `prefers-reduced-motion` est neutralisé globalement, animations **et délais** compris.
- **Le motif `<app-flourish>`** : rubans SVG en ligne, entrant tous par le bord droit (un geste qui
  revient se lit comme une signature, plusieurs gestes se lisent comme de la décoration). Aucune
  requête réseau, `aria-hidden`, `pointer-events: none`, aucune animation, opacité très en dessous
  du texte. La section hôte prend `.ct-flourish-host`.
- **Mesure de lecture** : `.ct-column` plafonne la prose à 68 caractères.
- **PrimeNG est réduit au strict minimum.** Il n'habille plus que les champs du formulaire de
  contact. `citatio-preset.ts` existe uniquement pour que ces champs ne sortent pas en bleu Aura.
  Avant d'ajouter un composant PrimeNG, demande-toi si trois lignes de Tailwind ne suffisent pas :
  l'accordéon PrimeNG de la FAQ ne survivait pas au prerendering et a été remplacé par un
  `<details>` natif.

### 5.2 Comment styler

- Utilitaires Tailwind dans les gabarits pour la mise en page, l'espacement, la typographie,
  le responsive. Couleurs **par tokens sémantiques**, jamais de `dark:` de couleur.
- Classes réutilisables dans `@layer components` de `styles.css`, **préfixe `ct-`**, avec `@apply`.
- En Tailwind v4, seul un bloc `@utility` peut être consommé par `@apply` : c'est pourquoi
  `ct-focus-ring` est déclaré ainsi.
- Le `.css` d'un composant reste minimal : `:host`, ou ce que Tailwind ne sait pas exprimer.
- Les tokens de design PrimeNG ne servent qu'au thème PrimeNG.

---

## 6. Doctrine : un site authentique, pas un site vibe-codé

C'est la raison d'être du projet. **Nous vendons des sites faits à la main ; notre propre site est
la seule preuve dont nous disposons.** Une page qui ressemble à une sortie de générateur détruit
l'argument commercial avant même qu'il soit lu. La refonte du 1er septembre 2026 a été menée après
avoir constaté que le site cochait **18 des 22 marqueurs du site vibe-codé**.

### 6.1 Les marqueurs interdits

Aucun de ces éléments ne doit réapparaître, quelle qu'en soit la justification :

- Dégradé bleu-indigo (ou violet-rose) sur un titre, texte en `bg-clip-text`.
- Police système par défaut, `font-black` ou `font-extrabold` partout.
- Palette Tailwind brute (`indigo-600`, `slate-900`) au lieu des tokens.
- Formes décoratives flottantes : blobs, halos, orbes, radars, grilles en fond.
- Grille de cartes identiques à icône ronde, pour dire trois choses différentes.
- `hover:scale`, effets de brillance, ombres portées empilées.
- Animation à chaque section, apparition au défilement sur tous les blocs.
- Emoji en guise d'icône, badge « Le plus demandé », faux compteurs, faux avis.
- Copie interchangeable : « solutions innovantes », « propulsé par l'IA »,
  « nous transformons votre vision », superlatifs sans objet.
- Mockups génériques, captures de tableaux de bord inventés, logos de clients fictifs.
- Sections « 500+ clients satisfaits » quand l'entreprise n'a pas encore de client.
- **Tirets cadratins** (voir §6.3).

### 6.2 La règle de preuve

**Rien ne s'affiche sur le site qui ne soit vérifiable par le visiteur.** L'agence n'a pas encore de
réalisation client : le site est donc lui-même le portfolio, ce qui ne fonctionne que si chaque
chiffre est réel.

- Les mesures vivent dans `site-metrics.config.ts`, avec pour chacune un champ **`howToVerify`**
  et une **date de mesure** (`MEASURED_ON`). Ne jamais arrondir vers le haut, ne jamais estimer, et
  toujours republier la date pour qu'un chiffre périmé se voie.
- Refaire une mesure avant de la modifier. La procédure est en tête du fichier.
- La page `/ce-site` assume explicitement **ce qu'elle ne prouve pas**. Cette section reste.
- Le formulaire de contact **est branché** sur `u1-communication` (§12 l'a soldé). Il a affiché par
  le passé « message envoyé avec succès » alors que rien ne partait, puis composé un `mailto:` en
  l'assumant ; la règle qui en est sortie tient toujours. L'accusé de réception dit « votre message
  est arrivé », pas « email envoyé » : le serveur répond 202 dès l'enregistrement en base, la
  notification part derrière et peut échouer. On n'affirme que ce que la réponse prouve.
- Aucune promesse de position sur Google, sur le site comme dans les offres.

### 6.3 Le ton éditorial

- **Copie en français (`fr_FR`)**, à la première personne du pluriel, concrète, sans jargon.
  On dit combien ça coûte, en combien de temps, et ce qu'on ne fait pas.
- **Aucun tiret cadratin, nulle part.** Règle détaillée juste en dessous, elle ne souffre aucune
  exception.
- Pas de superlatif, pas d'exclamation, pas de « n'hésitez pas ».
- Les URL sont **en français** et descriptives (`/creation-site-vitrine`, `/qui-sommes-nous`).
- Les prix affichés sortent de `pricing.config.ts`, jamais codés en dur dans un gabarit.

#### Ordre : jamais de tiret cadratin dans un fichier de ce dépôt

**Le tiret cadratin (U+2014) est interdit dans tout fichier du dépôt, sans exception.** Il est
nommé ici par son point de code et non par son glyphe, pour que ce document reste lui-même conforme
et que la commande ci-dessous ne se signale pas elle-même.

**Le périmètre est le dépôt entier**, pas seulement la copie visible par le visiteur :

- les gabarits, les composants et les fichiers de configuration du frontend ;
- le code Java et les commentaires du backend ;
- les fichiers d'infrastructure (`Caddyfile`, `nginx.conf`, `docker-compose.yml`, workflows) ;
- les fichiers publics (`llms.txt`, `robots.txt`, `sitemap.xml`) ;
- **ce document et tout fichier Markdown du dépôt** ;
- les messages de commit et les descriptions de PR.

**Pourquoi cette sévérité.** C'est le marqueur d'écriture par IA le plus reconnaissable, et ce site
est notre seule preuve de savoir-faire (§6). Un prospect qui repère la signature d'un générateur
dans notre propre vitrine n'a plus de raison de croire que nous écrivons nos sites à la main. Un
commit entier (`chore: retirer tous les tirets cadratins du frontend`) a servi à les éliminer, le
dépôt en compte **zéro** aujourd'hui, et cet état se maintient.

**Ce qu'on écrit à la place**, selon l'intention : deux points pour annoncer, une virgule pour
incidenter, un point pour trancher, des parenthèses pour mettre à distance. Un tiret court `-`
reste valide comme puce de liste, comme trait d'union, et dans un tableau Markdown.

**Le cas du tiret demi-cadratin (U+2013).** Il est **autorisé entre deux valeurs**, où il est la
typographie juste pour une plage (`400-600` en graisses, `U+0000-00FF` en plage Unicode, le dépôt
en compte cinq de cette forme). Il est **interdit comme ponctuation de phrase**, c'est à dire isolé
entre deux espaces : dans cet emploi il est un tiret cadratin déguisé et porte le même marqueur.

**La vérification**, à lancer avant de dire que c'est fini si tu as écrit du texte :

```bash
SRC=(--include="*.ts" --include="*.html" --include="*.css" --include="*.java" --include="*.md" \
     --include="*.txt" --include="*.xml" --include="*.yml" --include="*.properties" --include="*.conf")

# 1. Tiret cadratin, interdit partout.
grep -rn "$(printf '\u2014')" "${SRC[@]}" . | grep -v node_modules

# 2. Tiret demi-cadratin en ponctuation, interdit. Entre deux valeurs, il ne sort pas.
grep -rn "$(printf ' \u2013 ')" "${SRC[@]}" . | grep -v node_modules
```

Aucune sortie sur les deux commandes est le résultat attendu. Toute ligne retournée est à corriger
avant commit.

> **Hors périmètre** : le coffre Obsidian de l'entreprise (`~/Documents/Citatio`) est une
> documentation interne, jamais publiée, et le propriétaire a tranché que les tirets cadratins y
> restent. Ne les y retire pas.

### 6.4 Les commentaires expliquent le pourquoi

Le dépôt est écrit pour être relu dans six mois. Le style attendu, visible partout dans le code :
un commentaire ne paraphrase pas la ligne suivante, il **documente la décision, l'alternative
écartée et la contrainte tenue**. Voir `flourish.component.ts`, `reveal.directive.ts`, `nginx.conf`
ou `tools/serve-dist.mjs` comme références de ton.

**Langue des commentaires : français**, dans tout le dépôt. Le code existant en contient encore en
anglais côté frontend ; ils migrent au fil des modifications, sans campagne de renommage dédiée.
Les identifiants (variables, fonctions, classes, clés) restent **en anglais**.

---

## 7. Accessibilité, SEO et GEO : les invariants

Ce sont des arguments de vente affichés. Les casser en silence est la pire régression possible.

**Accessibilité, minimum WCAG AA :**

- Contraste AA en thème clair **et sombre**. `npm run check:contrast` balaie chaque nœud de texte de
  chaque route en thème sombre, ce que Lighthouse ne fait jamais. Le pire rapport actuel est 5,1:1.
- Hiérarchie de titres correcte, un seul `h1` par page.
- Focus visible partout (`ct-focus-ring`), navigation clavier complète.
- Décoratif signifie `aria-hidden` et `pointer-events: none`.
- Aucun débordement horizontal, de 320 px à 2560 px.

**SEO et GEO :**

- `SeoService` met à jour titre, description, Open Graph, Twitter Card et **canonique** à chaque
  navigation, depuis les `data.seo` des routes. Toute nouvelle route porte son bloc `seo`.
- `JsonLdService` injecte les schémas par clé, compatible prerendering. `Organization` et `WebSite`
  sont posés dans `app.ts` ; les pages ajoutent leurs propres schémas (`FAQPage`, fil d'Ariane).
- `company.config.ts` est la **source unique** de l'identité : adresse, SIRET, TVA, fondateurs avec
  leurs `sameAs`, zone desservie, fiche Google Business Profile. Un `sameAs` doit être un profil que
  la personne contrôle réellement et qui la nomme : une URL fausse est une affirmation fausse sur
  une personne réelle.
- `public/llms.txt` résume l'offre pour les moteurs génératifs, `robots.txt` autorise explicitement
  GPTBot, Google-Extended, anthropic-ai, PerplexityBot et Bytespider.
- Les canoniques pointent vers l'apex **sans slash final**, ce que nginx et Caddy respectent.

**Ajouter une route, la liste complète** (en oublier un élément est la régression classique) :

1. `app.routes.ts` : chemin, `loadComponent`, bloc `data.seo` (titre et description rédigés).
2. `app.routes.server.ts` : `RenderMode.Prerender`.
3. `frontend/public/sitemap.xml` : nouvelle `<url>`.
4. `frontend/public/llms.txt` : la page dans la liste, avec sa phrase de résumé.
5. Liens depuis la navigation, le pied de page ou les pages parentes.
6. Le JSON-LD spécifique s'il y en a un.
7. Un test e2e minimal (titre, canonique, contenu présent dans le HTML pré-rendu).

---

## 8. Outillage de test

### 8.1 Commandes

```bash
# Frontend, depuis frontend/
npm start                       # serveur de développement
npm test                        # Vitest (npm test -- --configuration=ci en CI)
npm run build                   # build de production + prerendering
npm run e2e                     # build puis Playwright contre le dist pré-rendu
npm run check:contrast          # balayage de contraste en thème sombre, après un build
npm run build:og                # régénère public/og-citatio.png depuis tools/og-image.html

# Backend, depuis backend/
./mvnw -B test                  # les 40 tests des trois modules (ce que lance la CI)
./mvnw clean package            # les trois modules
./mvnw -pl u2-blog -am package  # un module et ses dépendances

# Pile complète
docker compose up --build
```

Pour Lighthouse, servir le dist et mesurer, comme documenté en tête de `site-metrics.config.ts` :

```bash
npm run build
node tools/serve-dist.mjs dist/citatio-front/browser 4173
npx lighthouse http://localhost:4173 --preset=desktop --view
```

### 8.2 Ce qu'il faut savoir sur cette suite

- Les tests e2e tournent contre le **dist statique**, servi par `tools/serve-dist.mjs`, qui rejoue
  les règles de `nginx.conf`. Ne les fais jamais tourner derrière `serve --single` : cette commande
  renvoie l'accueil pour toutes les routes, et la suite entière testerait dix fois la même page.
- Plusieurs tests e2e sont des **garde-fous de doctrine** et non des tests fonctionnels : présence
  des prix, absence de fausse preuve sociale, polices auto-hébergées, contenu présent dans le HTML
  pré-rendu, bascule de thème. S'ils tombent, la bonne réaction est presque toujours de corriger le
  code, pas le test.
- Côté backend, 40 tests tournent sur H2 en mémoire, **sans aucune base externe**, et la CI les
  lance sur tout push et toute PR (job `backend-test`). Trois familles sont des garde-fous et non des
  tests fonctionnels : `UpstreamClientTest` (aucune exception ne remonte d'un voisin coupé, le motif
  ne fuit pas, le circuit s'ouvre), `ApiExceptionHandlerTest` (une URL inconnue rend 404 et non
  500) et `ContactRequestServiceTest` (la demande est en base avant toute tentative d'envoi, un SMTP
  coupé ne fait pas perdre le lead, le leurre n'écrit rien). S'ils tombent, corrige le code.
  `SmtpMailSender` n'est couvert par aucun test : il faudrait un serveur SMTP factice, donc une
  dépendance de plus, pour vérifier ce que la configuration exprime déjà.

---

## 9. Conventions de travail

- **Commits conventionnels, en français** : `feat:`, `fix:`, `chore:`, `docs:`, `perf:`, avec portée
  optionnelle (`feat(seo):`). Le corps du message explique **le problème, la décision et les
  vérifications faites** ; voir `9cb9acb` et `d4401ed` comme modèles. Sans tiret cadratin.
- **Branches** : `develop` est la seule branche longue (`master` a été supprimée). Travail sur des
  branches thématiques, PR vers `develop` : **chaque commit de la PR se déploie en dev**, le merge
  redéploie la dev depuis `develop`. **La production ne part que par le bouton « Deploy
  production »**, sur un commit passé en dev. Ne pousse jamais directement sur `develop` et ne lance
  jamais ce bouton sans demande explicite.
- **Ne commit et ne push que si le propriétaire le demande.**
- `data/` (volumes Postgres et Caddy) est ignoré par git et ne doit jamais y entrer.
- Interface en français, identifiants de code en anglais, commentaires en français.

---

## 10. Pièges connus, déjà payés une fois

Chacun de ces points a coûté un correctif. Ne les réintroduis pas.

- **`[class]` sur un hôte fusionne les classes** et casse l'hydratation (les icônes `pi-moon` et
  `pi-sun` s'additionnaient). Utiliser `[class.x]`.
- **L'accordéon PrimeNG ne s'ouvrait pas en production** après prerendering. Remplacé par
  `<details>` natif.
- **`try_files $uri/` provoquait un 301 vers l'URL avec slash final**, en contradiction avec les
  canoniques. Résolu par `try_files $uri $uri/index.html`.
- **Servir l'accueil en 200 sur une URL inconnue** est un soft 404 que Google désindexe.
  `error_page 404 /index.html` rend la page d'erreur avec le bon statut.
- **`serve --single` faussait toute la suite e2e** (voir §8.2).
- **Publier 8081 et 8082 sur l'hôte** exposait les microservices à Internet. `expose` seulement.
- **Le déploiement ne synchronisait pas la configuration d'infra** : modifier `Caddyfile` ou
  `docker-compose.yml` n'avait aucun effet sur le VPS. L'étape `scp` du workflow le règle,
  ne la retire pas.
- **Copier le Caddyfile ne suffisait pas non plus** : Compose ne recrée pas la gateway quand seul
  le contenu du fichier monté change, et Caddy ne le relit pas. La production a tourné du 2 au
  14 septembre 2026 sans redirection www ni en-têtes de sécurité, pipeline au vert. `deploy.sh`
  recrée la gateway, le step « Verify production » l'aurait vu dès le premier déploiement.
- **`--color-ink-faint` échouait au contraste** à 3,59:1 en thème sombre. Toute nouvelle valeur de
  couleur passe par `npm run check:contrast`.
- **Le `.ct-reveal` caché sans garde `html.ct-js`** cachait le contenu aux crawlers et sans
  JavaScript.
- **Un `@ExceptionHandler(Exception.class)` seul rendait 500 sur toute URL inconnue** : il attrapait
  aussi `NoResourceFoundException` et `HttpRequestMethodNotSupportedException`, qui portaient déjà
  404 et 405, et écrivait une stack trace en ERROR à chaque passage de robot. Le handler partagé
  hérite désormais de `ResponseEntityExceptionHandler` ; deux tests le verrouillent.
- **Renvoyer `e.getMessage()` d'un appel inter-modules** publiait la topologie interne
  (`http://u2-blog:8082/api/u2/health`) sur un endpoint public. Le motif d'échec est maintenant une
  enum fermée, le message reste dans les logs.
- **`backend/mvnw` était versionné sans `.mvn/wrapper/maven-wrapper.properties`** : la commande
  documentée `./mvnw` échouait. Le fichier est là, ne le supprime pas.
- **Un réseau créé par `docker network create` sans étiquettes est refusé par Compose** pour un
  réseau qu'il déclare (« incorrect label com.docker.compose.network »). `deploy.sh` crée
  `citatio-edge` avec les étiquettes du projet `citatio`, et `docker-compose.yml` fixe ce nom de
  projet : ne retire ni l'un ni l'autre, le déploiement de production échouerait après une première
  dev. Trouvé en test le 15 septembre 2026, avant la mise en place.
- **`wget` sort en échec sur un 404, et `pipefail` arrête alors le script sans message.** Le
  contrôle de la dev l'absorbe (`|| true`) : un contrôle qui attend un 404 doit le faire aussi.

---

## 11. Sources de vérité, un sujet un fichier

Ne duplique jamais ces informations ailleurs, ne les code jamais en dur dans un gabarit.

| Sujet | Fichier |
|-------|---------|
| Identité, mentions légales, fondateurs, zone desservie | `frontend/src/app/config/company.config.ts` |
| Formules, options, prix | `frontend/src/app/config/pricing.config.ts` |
| Chiffres mesurés et leur date | `frontend/src/app/config/site-metrics.config.ts` |
| Design system complet | `frontend/src/styles.css` |
| Thème PrimeNG | `frontend/src/app/theme/citatio-preset.ts` |
| Routes, titres et descriptions SEO | `frontend/src/app/app.routes.ts` |
| Domaines, TLS, porte de la dev | `Caddyfile` |
| Routage API, en-têtes, diagnostics (prod et dev) | `caddy/routes.caddy` |
| Différences de l'environnement dev | `docker-compose.dev.yml` |
| Cache, redirections, 404 | `frontend/nginx.conf` |

---

## 12. Chantiers ouverts

Non priorisés ici : la priorisation appartient au propriétaire.

- Renseigner les secrets SMTP (`MAIL_*`) côté GitHub Actions : sans eux, une demande de contact est
  bien enregistrée en base mais aucune notification ne part (statut `FAILED`).
- Passer à **Flyway** : `ContactRequest` est la première entité réelle, sa table est aujourd'hui
  créée par `ddl-auto: update`. La migration doit être posée avant qu'une deuxième entité arrive.
- Rejouer les notifications en échec (`mail_status = FAILED`), aujourd'hui repérables seulement en
  lisant la table ou les logs.
- Premières entités métier de `u2-blog` et pages blog côté Angular.
- Figer les tarifs de `pricing.config.ts` (aujourd'hui provisoires, marqués comme tels) une fois
  validés par le propriétaire.
- Migrer progressivement les commentaires anglais du frontend vers le français.

---

**En cas de doute sur le périmètre ou la priorité, demande au propriétaire. En cas de doute sur la
cible, applique §1.1 : notre site ou celui d'un client, la question se pose avant d'écrire du code,
jamais après.**
