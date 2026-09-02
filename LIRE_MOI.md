# Portfolio — Guide de démarrage

## Prérequis
- **Node.js** installé sur ton PC → https://nodejs.org (prends la version LTS)

## Première installation (une seule fois)

1. Ouvre un terminal dans ce dossier (clic droit → "Ouvrir dans le terminal")
2. Lance :
   ```
   npm install
   ```

## Démarrer le site

**Option A — Double-clique sur `demarrer.bat`**

**Option B — Terminal :**
```
node server.js
```

Le terminal affiche :
```
✅  Portfolio en ligne sur : http://localhost:3000
🔐  Admin accessible sur   : http://localhost:3000/admin
```

Ouvre ton navigateur sur **http://localhost:3000**

## Accès Admin

→ **http://localhost:3000/admin**  
→ Mot de passe : `admin2025`

Pour changer le mot de passe, ouvre `server.js` et modifie la ligne :
```js
const ADMIN_PASSWORD = 'admin2025';
```

## Structure des fichiers

```
portfolio-server/
├── server.js          ← serveur (ne pas modifier)
├── projets.db         ← base de données (créée automatiquement)
├── uploads/           ← photos & vidéos uploadées
├── public/
│   ├── portfolio1.html  ← ton site
│   ├── admin.html       ← espace admin
│   └── images/          ← images statiques (photo de profil, etc.)
└── demarrer.bat       ← démarrage Windows
```

## Ajouter un projet

1. Va sur http://localhost:3000/admin
2. Connecte-toi avec le mot de passe
3. Clique "+ AJOUTER"
4. Remplis le titre, la description, les tags, ajoute tes photos/vidéos
5. Clique "ENREGISTRER"
6. Le projet apparaît immédiatement sur http://localhost:3000
