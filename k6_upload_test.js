import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

// Test de charge sur le chemin critique du produit : televersement puis
// telechargement d'un fichier. Contrairement a k6_test.js (qui mesure /auth/login),
// ce scenario exerce les deux endpoints de transfert de fichiers, avec authentification.

const BASE = 'http://localhost:3000';

// Fichier de ~100 Ko construit en memoire (pas d'artefact binaire dans le repo).
// L'en-tete "PERF" (0x50 45 52 46) n'est pas une signature d'executable, donc le
// controle anti-executable (magic number) du backend le laisse passer.
const CONTENT = 'PERF'.repeat(25600);

const uploadDur = new Trend('upload_duration', true);
const downloadDur = new Trend('download_duration', true);

export const options = {
  vus: 10,
  duration: '30s',
};

// setup() s'execute une fois : on cree un compte et on recupere son JWT,
// reutilise par tous les VUs pour televerser.
export function setup() {
  const email = `perf_upload_${Date.now()}@datashare.com`;
  const res = http.post(
    `${BASE}/auth/register`,
    JSON.stringify({ email, password: 'password123' }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  return { token: res.json('access_token') };
}

export default function (data) {
  // 1) Upload (chemin d'ecriture : Multer + validation + ecriture disque + insert BDD)
  const up = http.post(
    `${BASE}/files/upload`,
    { file: http.file(CONTENT, 'sample.txt', 'text/plain') },
    { headers: { Authorization: `Bearer ${data.token}` }, tags: { name: 'upload' } },
  );
  uploadDur.add(up.timings.duration);
  check(up, {
    'upload 201': (r) => r.status === 201,
    'upload renvoie un download_token': (r) => !!r.json('download_token'),
    'upload < 500ms': (r) => r.timings.duration < 500,
  });

  // 2) Download (chemin de lecture : lookup BDD + stream disque)
  const token = up.json('download_token');
  if (token) {
    const dl = http.post(
      `${BASE}/d/${token}/download`,
      '{}',
      { headers: { 'Content-Type': 'application/json' }, tags: { name: 'download' } },
    );
    downloadDur.add(dl.timings.duration);
    check(dl, {
      'download 200/201': (r) => r.status === 200 || r.status === 201,
      'download rend le contenu': (r) => r.body && r.body.length > 0,
      'download < 500ms': (r) => r.timings.duration < 500,
    });
  }

  sleep(1);
}
