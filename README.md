# Emy.gourmandises - Site de restauration

Site web complet pour Emy.gourmandises avec authentification utilisateur et gestion des plats/commandes.

## Fonctionnalités

- ✅ **Authentification** : Inscription/connexion des utilisateurs
- ✅ **Gestion des plats** : Catalogue de plats marocains et pâtisseries
- ✅ **Commandes** : Système de commandes en ligne
- ✅ **Avis clients** : Système de notation et commentaires
- ✅ **Base de données SQLite** : Stockage persistant des données

## Technologies utilisées

- **Frontend** : HTML, CSS, JavaScript vanilla
- **Backend** : Node.js + Express
- **Base de données** : SQLite3
- **Authentification** : Sessions avec localStorage + API

## Installation et démarrage

```bash
# Installer les dépendances
npm install

# Ajouter des plats de démonstration
npm run seed

# Démarrer le serveur
npm start
```

Ouvre ensuite `http://localhost:3000/index.html` dans ton navigateur.

## API Endpoints

### Utilisateurs
- `POST /api/signup` - Créer un compte
- `POST /api/login` - Se connecter

### Plats
- `GET /api/dishes` - Lister tous les plats
- `GET /api/dishes/:id` - Détails d'un plat
- `POST /api/dishes` - Ajouter un plat (auth requis)

### Commandes
- `POST /api/orders` - Créer une commande (auth requis)
- `GET /api/orders` - Lister ses commandes (auth requis)
- `GET /api/orders/:id` - Détails d'une commande (auth requis)

### Zones de livraison
- `GET /api/delivery-zones` - Lister toutes les zones de livraison
- `GET /api/delivery-zones/:id` - Détails d'une zone de livraison
- `POST /api/delivery-zones` - Ajouter une zone de livraison (auth requis)
- `PUT /api/delivery-zones/:id` - Modifier une zone de livraison (auth requis)
- `DELETE /api/delivery-zones/:id` - Supprimer une zone de livraison (auth requis)

### Avis
- `POST /api/reviews` - Ajouter un avis (auth requis)
- `GET /api/dishes/:id/reviews` - Avis d'un plat

## Structure de la base de données

- `users` : Utilisateurs inscrits
- `dishes` : Catalogue des plats
- `orders` : Commandes clients
- `order_items` : Détails des commandes
- `reviews` : Avis et commentaires

## Plats de démonstration

Le script `seed.js` ajoute automatiquement :
- **Plats marocains** : Tagine, Couscous, Pastilla
- **Pâtisseries** : Cornes de gazelle, Chebakia, Tartes, Gâteaux

## Sécurité

- Mots de passe hachés avec SHA-256 + sel
- Validation des emails et mots de passe
- Authentification requise pour les commandes

## Développement

Pour ajouter de nouvelles fonctionnalités :
1. Étendre `db.js` avec de nouvelles fonctions
2. Ajouter les routes dans `server.js`
3. Mettre à jour le frontend si nécessaire

---

*Développé pour Emy.gourmandises - Cuisine marocaine et pâtisseries artisanales*

