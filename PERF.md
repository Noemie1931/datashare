# Performance — DataShare

## 1. Backend sous charge (k6)

Deux scénarios k6, chacun **10 utilisateurs en parallèle pendant 30 s**, contre la stack
conteneurisée (`docker-compose up`). Budget que je me suis fixé : **p95 < 500 ms**.

### 1.1 Authentification — `POST /auth/login`

Endpoint le plus coûteux en CPU (appel base + `bcrypt.compare`). Test : `k6 run k6_test.js`.

| Métrique | Valeur |
|---|---|
| Requêtes | 274 (~8,9 req/s) |
| Succès | 100 % (548/548 checks) |
| Temps moyen | 107 ms |
| Médiane | 101 ms |
| p90 | 111 ms |
| p95 | 157 ms |
| Max | 490 ms |

Tout reste sous la barre des 500 ms et aucune requête n'échoue. Le max à 490 ms correspond
aux toutes premières requêtes (chauffe de bcrypt) ; la médiane à 101 ms est représentative.

### 1.2 Transfert de fichiers — `upload` + `download` (chemin critique du produit)

Le cœur fonctionnel de DataShare est le transfert de fichiers, pas seulement l'auth. Ce
second scénario (`k6 run k6_upload_test.js`) crée un compte dans `setup()`, puis chaque
itération **téléverse un fichier de ~100 Ko** (chemin d'écriture : Multer → validation
anti-exécutable → écriture disque → insert BDD) **puis le télécharge** (lecture : lookup
BDD → stream disque). Métriques séparées par endpoint (`Trend` k6).

| Endpoint | Médiane | p90 | p95 | Max |
|---|---|---|---|---|
| `POST /files/upload` | 32 ms | 39 ms | 41 ms | 57 ms |
| `POST /d/:token/download` | 14 ms | 19 ms | 22 ms | 25 ms |

- **290 itérations, 580 requêtes, 100 % de succès** (1 764 checks au vert).
- L'upload (~32 ms) est plus lent que le download (~14 ms) : normal, il valide le contenu
  (magic number), écrit sur disque et insère en base, là où le download ne fait qu'un
  lookup indexé (`download_token` unique) et un `fs.createReadStream`.
- Les deux endpoints critiques sont **très en dessous** du budget de 500 ms (p95 ≤ 41 ms).

**Analyse :** sous charge modérée (10 VUs), le facteur limitant n'est ni l'upload ni le
download mais bcrypt à la connexion (~100 ms, volontaire pour la sécurité). Le transfert
de fichiers lui-même est rapide. Le test porte sur des fichiers de 100 Ko ; pour de très
gros fichiers (jusqu'à 1 Go), la latence devient dominée par l'I/O disque et la bande
passante réseau, pas par le code applicatif (lecture/écriture en streaming, jamais tout
en mémoire).

## 2. Frontend — budget de performance

### 2.1 Poids du bundle (build Vite)

Sortie de `npm run build` :

| Fichier | Brut | Gzippé |
|---|---|---|
| index.js | 300 Ko | 96 Ko |
| index.css | 0,86 Ko | 0,48 Ko |
| index.html | 0,46 Ko | 0,30 Ko |

Build en ~130 ms. Vite applique le tree-shaking automatiquement.

### 2.2 Mesures navigateur (Lighthouse)

Audit Lighthouse 12.8 (catégorie Performance, Chrome headless) sur `http://localhost:5173` :

| Métrique | Valeur | Seuil « bon » |
|---|---|---|
| **Score Performance** | **94 / 100** | ≥ 90 |
| First Contentful Paint (FCP) | 2,4 s | < 1,8 s |
| Largest Contentful Paint (LCP) | 2,6 s | < 2,5 s |
| Total Blocking Time (TBT) | **0 ms** | < 200 ms |
| Cumulative Layout Shift (CLS) | **0** | < 0,1 |
| Time to Interactive (TTI) | 2,6 s | < 3,8 s |

### 2.3 Budget front retenu et lecture des résultats

| Indicateur | Budget | Mesuré | Statut |
|---|---|---|---|
| JS gzippé | < 150 Ko | 96 Ko | OK |
| Score Lighthouse Perf | ≥ 90 | 94 | OK |
| TBT | < 200 ms | 0 ms | OK |
| CLS | < 0,1 | 0 | OK |
| LCP | < 2,5 s | 2,6 s | À surveiller |

**Analyse :** le bundle est léger (96 Ko gzip, sous le budget de 150 Ko) et l'interactivité
est excellente (TBT nul, aucun décalage de mise en page : CLS = 0). Le seul point juste à
la limite est le **LCP à 2,6 s** (cible 2,5 s) : il s'explique par les conditions de mesure
(conteneur nginx local sans cache CDN, pas de pré-rendu). Pistes d'optimisation si besoin :
pré-chargement de la police/CSS critique, mise en cache HTTP des assets côté nginx, et code
splitting par route (lazy-loading des pages) pour réduire le JS initial. À ce stade (MVP),
le score de 94 est largement au-dessus de l'attendu.

## 3. Journalisation (logs structurés)

Un intercepteur NestJS journalise chaque requête HTTP au format **JSON structuré**, avec
les métriques clés par appel :

```
[HTTP] {"method":"POST","url":"/auth/register","statusCode":201,"durationMs":92}
```

Chaque ligne contient la **méthode**, la **route**, le **code de statut** et le **temps de
réponse** (`durationMs`). Ce format est directement exploitable par un agrégateur de logs
(ex. ELK, Grafana Loki) pour suivre la latence par endpoint et repérer les requêtes lentes
ou en erreur.

**Métriques clés suivies :** temps de réponse par route (logs + k6), taille des fichiers
transférés (`sizeBytes` en base, limite 1 Go), taux de succès sous charge (100 % aux deux
tests k6). Les routes de lecture (`GET /files`, `GET /d/:token`) répondent en quelques
millisecondes ; la route la plus coûteuse reste `POST /auth/login` (~100 ms, bcrypt).

## 4. Pistes si le projet grossit

- Activer la compression gzip/brotli côté NestJS et cache HTTP nginx sur les assets et les téléchargements
- Pagination sur `GET /files` quand un compte a beaucoup de fichiers
- Code splitting par route côté front (lazy-loading) pour abaisser le LCP
- CDN pour les assets statiques et stockage objet (S3) pour décharger le disque applicatif

## 5. Comment reproduire

```bash
# Backend (la stack doit tourner : docker-compose up -d)
k6 run k6_test.js          # charge sur /auth/login
k6 run k6_upload_test.js   # charge sur upload + download

# Frontend (front servi sur :5173)
npx lighthouse http://localhost:5173 --only-categories=performance --view
npm run build              # poids du bundle
```
