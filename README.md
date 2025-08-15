# Application de Gestion de Matériel Médical

Cette application permet la gestion de matériel médical en location et la soumission de demandes par le personnel de maisons de retraite.

## 🚀 Fonctionnalités

### Pour les Utilisateurs (Personnel : Infirmières, Ergothérapeutes)
- ✅ Gestion de leur propre matériel médical (CRUD)
- ✅ Création et gestion de leurs propres localisations
- ✅ Soumission de demandes via un système de panier (livraison, reprise, dépannage)
- ✅ Suivi du statut de leurs demandes
- ✅ Accès restreint à leurs propres données

### Pour les Administrateurs (Prestataire)
- ✅ Gestion complète du matériel de tous les utilisateurs
- ✅ Création et gestion des utilisateurs
- ✅ Gestion des types de matériel
- ✅ Visualisation de toutes les demandes
- ✅ Modification du statut des demandes
- ✅ Suppression de toute demande

## 🛠️ Technologies Utilisées

- **Frontend**: Next.js 15 avec TypeScript
- **Authentification**: NextAuth.js
- **Base de données**: SQLite avec Prisma ORM
- **UI**: Tailwind CSS
- **Email**: Nodemailer (prêt pour intégration)

## 📦 Installation et Démarrage

### Prérequis
- Node.js 18+
- SQLite (intégré, aucune installation requise)

### Installation

1. **Installer les dépendances**
   ```bash
   npm install
   ```

2. **Configurer la base de données**
   
   Modifiez le fichier `.env` si nécessaire (la configuration par défaut fonctionne) :
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   
   # Configuration email (optionnel pour le moment)
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASSWORD="your-app-password"
   NOTIFICATION_EMAILS="admin@example.com,manager@example.com"
   ```

3. **Initialiser la base de données**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Lancer l'application**
   ```bash
   npm run dev
   ```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🔐 Comptes par Défaut

Après avoir exécuté le seed :

- **Administrateur** : `admin@example.com` / `admin123`
- **Utilisateur test** : `user@example.com` / `user123`

## 🗄️ Structure de la Base de Données

### Tables Principales
- **users** : Utilisateurs avec rôles (USER/ADMIN)
- **equipment_types** : Types de matériel médical
- **equipments** : Équipements avec localisation
- **requests** : Demandes des utilisateurs
- **request_items** : Éléments de demande (livraison/reprise/dépannage)

### Statuts des Demandes
- `PENDING` : En attente
- `ACKNOWLEDGED` : Prise en compte
- `IN_PREPARATION` : En cours de préparation
- `COMPLETED` : Terminée

## 🚀 Déploiement sur Render.com

### Préparation
1. Créer un compte sur render.com
2. Connecter votre repository GitHub

### Configuration
1. **Service Web** :
   - Build Command: `npm run build`
   - Start Command: `npm start`
   
2. **Base de données PostgreSQL** :
   - Créer une instance PostgreSQL sur Render
   - Récupérer l'URL de connexion

3. **Variables d'environnement** :
   ```env
   DATABASE_URL=<url-postgresql-render>
   NEXTAUTH_URL=https://your-app.onrender.com
   NEXTAUTH_SECRET=<strong-secret-key>
   ```

### Migration
```bash
npm run db:migrate
npm run db:seed
```

## 🔧 Développement

### Scripts Disponibles
- `npm run dev` : Développement avec hot-reload
- `npm run build` : Build de production
- `npm run start` : Serveur de production
- `npm run lint` : Vérification du code
- `npm run db:migrate` : Migrations de base de données
- `npm run db:seed` : Initialisation des données
- `npm run db:reset` : Reset complet de la DB

### Structure du Projet
```
src/
├── app/                # Pages Next.js App Router
├── components/         # Composants React
├── lib/               # Utilitaires (Prisma, Auth, etc.)
├── types/             # Types TypeScript
└── scripts/           # Scripts utilitaires
```

## 🐛 Dépannage

### Problèmes Courants
1. **Erreur de connexion DB** : Vérifiez `DATABASE_URL` dans `.env`
2. **Erreur d'authentification** : Régénérez `NEXTAUTH_SECRET`
3. **Permissions** : Vérifiez que l'utilisateur a le bon rôle

### Logs
Les logs sont visibles dans la console du navigateur et dans le terminal du serveur.
