# Script d'upload vers Cloudflare R2

Ce script permet d'uploader tous les fichiers du dossier `uploads` vers un bucket Cloudflare R2.

## Configuration

### 1. Créer un bucket R2

Dans le dashboard Cloudflare :
1. Allez dans **R2 Object Storage**
2. Créez un nouveau bucket nommé `croissant-uploads` (ou un nom de votre choix)

### 2. Créer des clés API R2

1. Dans **R2 Object Storage**, cliquez sur **Manage R2 API tokens**
2. Créez un token avec les permissions :
   - **Object Read & Write** pour votre bucket
3. Notez l'**Access Key ID** et la **Secret Access Key**

### 3. Configurer les variables d'environnement

1. Copiez le fichier `.env.example` vers `.env`
2. Remplissez les valeurs selon le script que vous voulez utiliser :

**Pour le script AWS SDK (upload-to-r2.mjs) :**
```
CLOUDFLARE_ACCOUNT_ID=votre_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=votre_access_key_id  
CLOUDFLARE_R2_SECRET_ACCESS_KEY=votre_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=croissant-uploads
```

**Pour le script REST API (upload-to-r2-rest.mjs) :**
```
CLOUDFLARE_ACCOUNT_ID=votre_account_id
CLOUDFLARE_API_TOKEN=votre_api_token
CLOUDFLARE_R2_BUCKET_NAME=croissant-uploads
```

### 4. Créer le bucket avec Wrangler (optionnel)

Si le bucket n'existe pas encore, vous pouvez le créer avec Wrangler :

```bash
npx wrangler r2 bucket create croissant-uploads
```

## Utilisation

### 🚀 Script Ultra-Rapide (recommandé pour gros volumes)

Upload jusqu'à 30 fichiers en parallèle pour une vitesse maximale :

```bash
npm run upload-to-r2-fast
```

### 🛡️ Script Standard (AWS SDK)

Upload séquentiel avec retry robuste :

```bash
npm run upload-to-r2
```

### 🔧 Script Wrangler CLI (si problèmes SSL)

Utilise Wrangler CLI avec parallélisme modéré (5 fichiers simultanés) :

```bash
npm run upload-to-r2-wrangler
```

### 🔒 Script Robuste (pour environnements difficiles)

Configuration SSL optimisée, upload par petits batches (3 fichiers simultanés) :

```bash
npm run upload-to-r2-robust
```

### Comparaison des scripts

| Script | Vitesse | Parallélisme | Robustesse | Utilisation recommandée |
|--------|---------|--------------|------------|------------------------|
| **fast** | ⚡⚡⚡ | 30 simultanés | ⭐⭐ | Gros volumes, connexion stable |
| **wrangler** | ⚡⚡ | 5 simultanés | ⭐⭐⭐ | Problèmes SSL, environnement Windows |
| **robust** | ⚡ | 3 simultanés | ⭐⭐⭐⭐ | Connexion instable, retry important |
| **standard** | ⚡ | Séquentiel | ⭐⭐⭐ | Usage général, premiers tests |

## Fonctionnalités

- ✅ Upload récursif de tous les fichiers et sous-dossiers
- ✅ Détection automatique du Content-Type
- ✅ Préservation de la structure des dossiers
- ✅ Métadonnées ajoutées (date d'upload, chemin original)
- ✅ Gestion des erreurs avec rapport détaillé
- ✅ Support des formats : AVIF, WebP, PNG, JPEG, SVG, PDF, JSON, etc.
- ✅ **Retry automatique** avec backoff exponentiel
- ✅ **Quatre scripts optimisés** pour différents cas d'usage
- ✅ **Upload en parallèle** jusqu'à 30 fichiers simultanément
- ✅ **Pool de clients S3** pour maximiser les performances
- ✅ **Statistiques de performance** (vitesse, temps total)

## Structure dans R2

Les fichiers seront uploadés en préservant la structure :
```
uploads/avatars/example.avif → avatars/example.avif
uploads/bannersIcons/icon.png → bannersIcons/icon.png
```

## Accès aux fichiers

Une fois uploadés, les fichiers seront accessibles via :
```
https://pub-[bucket-id].r2.dev/avatars/example.avif
```

Ou via un domaine personnalisé si configuré.

## Intégration avec l'application

Le binding R2 `UPLOADS_BUCKET` est configuré dans `wrangler.jsonc` et sera disponible dans vos Workers/Pages Functions :

```javascript
// Dans une API route Next.js déployée sur Cloudflare
export async function GET(request, { env }) {
  const object = await env.UPLOADS_BUCKET.get('avatars/example.avif');
  return new Response(object.body);
}
```

## Dépannage

### Erreurs SSL (EPROTO, handshake failure)

Ces erreurs sont courantes avec certaines configurations réseau. Solutions :

1. **Utilisez le script alternatif :**
   ```bash
   npm run upload-to-r2-rest
   ```

2. **Vérifiez votre connexion réseau** et proxy/firewall

3. **Mettez à jour Node.js** vers une version récente

### Erreurs d'authentification

- Vérifiez vos clés API dans le fichier `.env`
- Assurez-vous que les clés ont les bonnes permissions R2
- Pour le script REST, utilisez un token API avec permissions R2:Edit

### Fichiers qui échouent de manière répétée

- Le script fait automatiquement 3 tentatives avec délai croissant
- Vérifiez que les fichiers ne sont pas corrompus
- Certains fichiers très volumineux peuvent nécessiter une approche différente

### Variables d'environnement manquantes

Erreur : `Missing required environment variables`

- Copiez `.env.example` vers `.env`
- Remplissez toutes les valeurs requises
- Redémarrez votre terminal après modification du `.env`