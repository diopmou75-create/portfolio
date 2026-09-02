const express = require('express');
const Database = require('better-sqlite3');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ── DOSSIERS ─────────────────────────────────────────────────
// Sur Railway : volume persistant monté sur /data
// En local    : dossier du projet
const DATA_DIR = process.env.DATA_DIR || __dirname;
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_PATH = path.join(DATA_DIR, 'projets.db');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// ── BASE DE DONNÉES ──────────────────────────────────────────
const db = new Database(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS projets (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    nom     TEXT NOT NULL,
    desc    TEXT,
    tag     TEXT,
    couleur TEXT DEFAULT 'var(--cyan)',
    cree_le TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS medias (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    projet_id INTEGER NOT NULL,
    fichier   TEXT NOT NULL,
    type      TEXT NOT NULL,
    FOREIGN KEY(projet_id) REFERENCES projets(id) ON DELETE CASCADE
  );
`);

// ── UPLOAD ───────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '_' + Math.random().toString(36).slice(2) + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /image\/(jpeg|png|gif|webp)|video\/(mp4|webm)/.test(file.mimetype);
    cb(null, ok);
  }
});

// ── MIDDLEWARE ───────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(UPLOADS_DIR));

// ── MOT DE PASSE ADMIN (variable d'environnement) ────────────
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin2025';

function checkAdmin(req, res, next) {
  if (req.headers['x-admin-password'] === ADMIN_PASSWORD) return next();
  res.status(401).json({ error: 'Non autorisé' });
}

// ── API LOGIN ────────────────────────────────────────────────
app.post('/api/login', (req, res) => {
  res.json({ ok: req.body.password === ADMIN_PASSWORD });
});

// ── API PROJETS ──────────────────────────────────────────────
app.get('/api/projets', (req, res) => {
  const projets = db.prepare('SELECT * FROM projets ORDER BY id DESC').all();
  res.json(projets.map(p => ({
    ...p,
    medias: db.prepare('SELECT * FROM medias WHERE projet_id = ?').all(p.id)
  })));
});

app.post('/api/projets', checkAdmin, upload.array('medias', 20), (req, res) => {
  const { nom, desc, tag, couleur } = req.body;
  if (!nom) return res.status(400).json({ error: 'Le nom est requis' });
  const info = db.prepare('INSERT INTO projets (nom, desc, tag, couleur) VALUES (?, ?, ?, ?)')
    .run(nom, desc || '', tag || '', couleur || 'var(--cyan)');
  const id = info.lastInsertRowid;
  if (req.files?.length) {
    const ins = db.prepare('INSERT INTO medias (projet_id, fichier, type) VALUES (?, ?, ?)');
    req.files.forEach(f => ins.run(id, f.filename, f.mimetype));
  }
  const projet = db.prepare('SELECT * FROM projets WHERE id = ?').get(id);
  projet.medias = db.prepare('SELECT * FROM medias WHERE projet_id = ?').all(id);
  res.json(projet);
});

app.put('/api/projets/:id', checkAdmin, upload.array('medias', 20), (req, res) => {
  const id = parseInt(req.params.id);
  const { nom, desc, tag, couleur, supprimer_medias } = req.body;
  if (!nom) return res.status(400).json({ error: 'Le nom est requis' });
  db.prepare('UPDATE projets SET nom=?, desc=?, tag=?, couleur=? WHERE id=?')
    .run(nom, desc || '', tag || '', couleur || 'var(--cyan)', id);
  if (supprimer_medias) {
    JSON.parse(supprimer_medias).forEach(mid => {
      const m = db.prepare('SELECT * FROM medias WHERE id = ?').get(mid);
      if (m) {
        const fp = path.join(UPLOADS_DIR, m.fichier);
        if (fs.existsSync(fp)) fs.unlinkSync(fp);
        db.prepare('DELETE FROM medias WHERE id = ?').run(mid);
      }
    });
  }
  if (req.files?.length) {
    const ins = db.prepare('INSERT INTO medias (projet_id, fichier, type) VALUES (?, ?, ?)');
    req.files.forEach(f => ins.run(id, f.filename, f.mimetype));
  }
  const projet = db.prepare('SELECT * FROM projets WHERE id = ?').get(id);
  projet.medias = db.prepare('SELECT * FROM medias WHERE projet_id = ?').all(id);
  res.json(projet);
});

app.delete('/api/projets/:id', checkAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  db.prepare('SELECT * FROM medias WHERE projet_id = ?').all(id).forEach(m => {
    const fp = path.join(UPLOADS_DIR, m.fichier);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  });
  db.prepare('DELETE FROM projets WHERE id = ?').run(id);
  res.json({ ok: true });
});

// ── ROUTES HTML ──────────────────────────────────────────────
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'portfolio1.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

// ── DÉMARRAGE ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅  Portfolio : http://localhost:${PORT}`);
  console.log(`🔐  Admin     : http://localhost:${PORT}/admin\n`);
});
