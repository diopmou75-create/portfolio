# Portfolio Cyberpunk — Moustapha DIOP

Site portfolio personnel avec espace admin pour gérer les projets.

## Stack
- **Frontend** : HTML/CSS/JS vanilla (design cyberpunk)
- **Backend** : Node.js + Express
- **Base de données** : SQLite (better-sqlite3)
- **Upload** : Multer (photos & vidéos)

## Lancer en local

```bash
npm install
node server.js
```

- Portfolio → http://localhost:3000
- Admin → http://localhost:3000/admin

## Variables d'environnement

| Variable | Description | Défaut |
|---|---|---|
| `ADMIN_PASSWORD` | Mot de passe admin | `admin2025` |
| `PORT` | Port du serveur | `3000` |
| `DATA_DIR` | Dossier pour DB + uploads | Dossier du projet |

## Déploiement Railway

1. Push ce repo sur GitHub
2. Créer un projet sur [railway.app](https://railway.app)
3. Connecter le repo GitHub
4. Ajouter un **Volume** monté sur `/data`
5. Définir `ADMIN_PASSWORD` et `DATA_DIR=/data` dans les variables
6. Deploy !
