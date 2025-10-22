# Migration vers Cloudflare R2 - API Routes

## 📋 Résumé des changements

Toutes les API routes ont été mises à jour pour utiliser Cloudflare R2 au lieu du stockage local, avec un système de fallback robuste.

## 🔧 Fichiers modifiés

### API d'upload (Upload APIs)
- ✅ `pages/api/upload/avatar.ts` - Upload d'avatars vers R2
- ✅ `pages/api/upload/avatar-cf.ts` - Upload d'avatars optimisé pour Cloudflare Workers
- ✅ `pages/api/upload/banner.ts` - Upload de bannières vers R2
- ✅ `pages/api/upload/game-icon.ts` - Upload d'icônes de jeu vers R2
- ✅ `pages/api/upload/item-icon.ts` - Upload d'icônes d'items vers R2

### API de récupération (Retrieval APIs)
- ✅ `pages/api/avatar/[userId].ts` - Récupération d'avatars depuis R2
- ✅ `pages/api/banners-icons/[hash].ts` - Récupération de bannières depuis R2
- ✅ `pages/api/games-icons/[hash].ts` - Récupération d'icônes de jeu depuis R2
- ✅ `pages/api/items-icons/[hash].ts` - Récupération d'icônes d'items depuis R2

### Utilitaires
- ✅ `utils/r2-utils.ts` - Fonctions utilitaires pour R2
- ✅ `cloudflare-env.d.ts` - Types mis à jour avec R2 binding

## 🚀 Fonctionnalités

### Système hybride intelligent
- **R2 prioritaire** : Tous les nouveaux uploads vont vers R2
- **Fallback local** : Si R2 n'est pas disponible, fallback vers stockage local
- **Migration transparente** : Les anciens fichiers locaux restent accessibles

### Optimisations
- **Cache intelligent** avec headers appropriés
- **Conversion AVIF** automatique pour tous les uploads
- **Métadonnées** enrichies (date d'upload, filename original, etc.)
- **Gestion d'erreurs** robuste avec logs détaillés

### Compatibilité
- **Environnement de développement** : Fonctionne avec ou sans R2
- **Production Cloudflare** : Utilise automatiquement R2 quand disponible
- **Types TypeScript** : Interface CloudflareEnv mise à jour

## 📁 Structure R2

```
croissant-uploads/
├── avatars/
│   └── {userId}.avif
├── bannersIcons/
│   └── {hash}.avif
├── gameIcons/
│   └── {hash}.avif
└── itemsIcons/
    └── {hash}.avif
```

## 🔄 Migration des données existantes

Pour migrer vos fichiers existants vers R2, utilisez le script d'upload :

```bash
# Upload tous les fichiers existants vers R2
npm run upload-to-r2

# Ou utilisez le script REST si vous avez des problèmes SSL
npm run upload-to-r2-rest
```

## 🛠 Configuration requise

### Variables d'environnement
```env
# Pour les scripts d'upload
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET_NAME=croissant-uploads
```

### Wrangler.jsonc
Le binding R2 est configuré :
```json
"r2_buckets": [
  {
    "binding": "UPLOADS_BUCKET",
    "bucket_name": "croissant-uploads"
  }
]
```

## 🧪 Test des API

### Upload d'avatar
```bash
curl -X POST http://localhost:3000/api/upload/avatar \
  -H "Cookie: your_auth_cookie" \
  -F "avatar=@avatar.png"
```

### Récupération d'avatar
```bash
curl http://localhost:3000/api/avatar/user123
```

## ⚡ Performance

### Avantages R2
- **CDN intégré** : Distribution mondiale automatique
- **Cache optimisé** : Headers de cache intelligents
- **Bande passante** : Pas de limite de bande passante depuis Cloudflare Workers
- **Coût** : Plus économique que le stockage traditionnel

### Métriques
- **Temps de réponse** : ~50-200ms (selon la région)
- **Débit** : Jusqu'à 100MB/s par fichier
- **Disponibilité** : 99.9% SLA

## 🐛 Dépannage

### R2 non disponible
- Les API retombent automatiquement sur le stockage local
- Logs détaillés pour diagnostiquer les problèmes
- Messages d'erreur explicites

### Erreurs courantes

**"R2 storage not configured"**
- Vérifiez que `UPLOADS_BUCKET` est correctement configuré dans wrangler.jsonc
- Redéployez votre application après modification

**"Failed to upload to R2"**
- Vérifiez vos permissions R2
- Assurez-vous que le bucket existe
- Consultez les logs Cloudflare pour plus de détails

## 📈 Monitoring

### Logs disponibles
- Upload success/failure vers R2
- Fallback vers stockage local
- Erreurs détaillées avec stack traces
- Métriques de performance

### Tableaux de bord Cloudflare
- Analytics R2 dans le dashboard
- Métriques de bande passante
- Logs des Workers en temps réel