# Citatio — Offres & Produit

> Document produit canonique. Propriétaire : agent `product-owner`, décisions finales : le propriétaire.
> Statuts utilisés : **Proposé** (à valider) · **Validé** · **À DÉFINIR** (info manquante).
> Tous les prix ci-dessous sont des **placeholders `À DÉFINIR`** — aucun chiffre n'est contractuel.

---

## 1. Positionnement (rappel)

Citatio passe d'une offre **100 % GEO** à un **studio web qui crée des sites vitrines**, avec le
**SEO et le GEO en options**, plus des add-ons opérationnels (hébergement, nom de domaine,
maintenance). À terme, le produit dépasse le site vitrine : **blog** (publication d'articles, module
backend `u2-blog`) et **envoi de mails** (contact / transactionnel / marketing, module `u1-communication`).

**Cibles pressenties (à affiner avec le propriétaire) :** TPE/PME locales, artisans, professions
libérales et indépendants qui ont besoin d'une présence web crédible et, en option, d'être visibles
sur Google (SEO) et sur les IA (GEO).

> ### ⚠️ Distinction essentielle — site Citatio vs. service vendu
>
> Toujours préciser de qui on parle pour éviter la confusion :
> - **🏠 Propriétaire (site Citatio)** = notre propre site vitrine (ce repo). C'est l'outil qui vend nos offres.
> - **👥 Clients (les offres)** = les sites + options GEO/SEO/hébergement/etc. que l'on construit **pour
>   d'autres entreprises**. Ce sont des prestations commerciales, **pas** des fonctionnalités de ce repo.
>
> Dans ce document, chaque offre/option concerne par défaut les **👥 clients**. Le **🏠 site Citatio**
> est concerné quand c'est explicitement indiqué.

---

## 2. Marque & nom de domaine — **Validé**

> **Statut : Validé.** Concerne le **🏠 site Citatio**.

- **Nom : `Citatio`** (on abandonne le suffixe « GEO », trop restrictif au vu de l'élargissement).
  `legalName` est déjà `Citatio`.
- **Domaine : on garde `citatio-geo.com`.** `citatio.fr` / `citatio.com` appartiennent déjà à des tiers
  et ne sont pas disponibles. Ce n'est pas bloquant : les visiteurs prêtent peu attention au domaine,
  c'est la qualité visuelle et le contenu qui priment.

**À faire (tâche P0, par l'agent `frontend-angular`) :** rebrand `Citatio GEO` → `Citatio` + repositionnement
du copy (orienté studio web, GEO/SEO en options) dans `frontend/src/app/config/company.config.ts`,
`frontend/src/app/app.routes.ts` (titres SEO), le footer et les pages. À faire de façon délibérée, pas en
renommages éparpillés. Le **domaine reste inchangé** (`citatio-geo.com`, `Caddyfile`).

---

## 3. Matrice d'offres — **Validé**

> Structure des offres/options/tarification **validée** par le propriétaire (les montants restent
> `À DÉFINIR`). Tout le §3 concerne les **👥 clients** (prestations vendues à d'autres entreprises).

### 3.1 Formules principales (site vitrine)

| Formule | Pour qui | Inclus | Prix |
|---------|----------|--------|------|
| **Vitrine Essentiel** | Présence web simple | Site vitrine responsive (≈ 3–5 pages), design sur base du design system, formulaire de contact, base SEO technique (balises, sitemap, perfs) | `À DÉFINIR` |
| **Vitrine + SEO** | Être trouvé sur Google | Tout Essentiel + optimisation SEO on-page, mots-clés, structured data (schema.org), recommandations de contenu | `À DÉFINIR` |
| **Vitrine + GEO/SEO** | Être trouvé sur Google **et** les IA | Tout SEO + optimisation GEO (visibilité ChatGPT/Gemini/Google AI Overview), contenu pensé pour citation IA | `À DÉFINIR` |

### 3.2 Options à la carte

| Option | Description | Modèle de prix | Prix |
|--------|-------------|----------------|------|
| **Hébergement inclus** | Hébergement géré (stack Docker/Caddy actuelle) | Abonnement mensuel/annuel | `À DÉFINIR` |
| **Nom de domaine** | Achat + configuration DNS + renouvellement | Setup + récurrent annuel | `À DÉFINIR` |
| **Maintenance** | MAJ, sécurité, sauvegardes, petites évolutions | Abonnement mensuel | `À DÉFINIR` |
| **Pack contenu** | Rédaction de pages / articles de blog | À l'article ou forfait | `À DÉFINIR` |
| **Emailing** | Mise en place envoi de mails (transactionnel / newsletter) | Setup + récurrent | `À DÉFINIR` |

### 3.3 Modèle de tarification — à trancher (Proposé)

Deux axes à valider avec le propriétaire :
1. **Création** : forfait one-shot (setup) vs. paiement échelonné.
2. **Récurrent** : abonnement (hébergement + maintenance + nom de domaine) → revenu récurrent (MRR),
   piste la plus saine pour la trésorerie.

> Recommandation PO (à valider) : **setup one-shot + abonnement mensuel** regroupant
> hébergement/maintenance/domaine, avec SEO et GEO en lignes optionnelles.

---

## 4. Roadmap produit (Proposé)

> Sauf mention contraire, ces phases concernent le **🏠 site Citatio** (notre propre produit).

| Phase | Objectif | Surface technique |
|-------|----------|-------------------|
| **P0 — Repositionnement + rebrand** | Rebrand `Citatio GEO` → `Citatio`, site vitrine présentant les nouvelles offres + page Offres/Tarifs + contact qui convertit | Frontend Angular, `u1-communication` (mails de contact) |
| **P1 — Contenu / SEO-GEO** | Pages optimisées, structured data, premiers contenus | Frontend + `SeoService`/`JsonLdService` |
| **P2 — Blog** | Publication d'articles, listing, lecture | `u2-blog` (API) + pages Angular blog |
| **P3 — Emailing** | Newsletter / transactionnel | `u1-communication` étendu |
| **P4 — Espace client** *(gardé, non prioritaire)* | Espace pour que les **👥 clients** suivent leur projet / facturation. Gros morceau → planifié plus tard, pas en priorité | nouveau module backend (`u3-*`) — à cadrer |

---

## 5. Pistes de diversification business

Toutes ces pistes concernent des prestations pour les **👥 clients**.

### 5.1 Validées (à transformer en user stories par le PO)

1. **Abonnement « site vivant » (MRR)** — au-delà de l'hébergement : forfait mensuel incluant X
   modifications/mois + mises à jour de contenu. → revenu récurrent prévisible.
2. **Audit GEO/SEO payant en produit d'appel** — un audit de visibilité IA + Google à prix d'entrée,
   qui qualifie le prospect et amène vers une formule.
3. **Templates sectoriels** — sites vitrines pré-packagés par métier (restaurant, artisan BTP,
   coach…) pour réduire le coût de production et accélérer la livraison.
4. **Blog managé pour le client** — production récurrente d'articles optimisés GEO/SEO publiés sur le
   blog du client (s'appuie sur `u2-blog`). → récurrent + démontre l'expertise GEO.
5. **Newsletter / emailing managé** — capitalise sur `u1-communication` ; service récurrent.

### 5.2 Pistes futures — non prioritaires

> Gardées en réserve, jugées trop complexes pour l'instant. À ne pas prioriser.

6. **Réservation / prise de RDV** — add-on pour les sites de nos clients (métiers à rendez-vous).
7. **Maintenance & monitoring premium** — uptime, sauvegardes, suivi/rapport de visibilité (perfs,
   positions SEO/GEO).

> Pour chaque piste validée, le PO créera des user stories avec critères d'acceptation.

---

## 6. Backlog (à remplir)

Format des stories : `En tant que <rôle>, je veux <objectif>, afin de <valeur>` + **critères
d'acceptation** explicites et testables. À démarrer une fois les offres et la marque validées.
