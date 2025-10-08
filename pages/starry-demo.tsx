import Link from 'next/link';

export default function StarryDemo() {
  return (
    <div className='min-h-screen bg-dark-gradient'>
      <div className='glass-page-container'>
        <div className='text-center mb-12'>
          <h1 className='text-6xl font-bold mb-6 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent'>Démonstration Étoilée</h1>
          <p className='text-xl' style={{ color: 'var(--glass-text-secondary)' }}>
            Découvrez un design sombre avec des étoiles filantes et des effets glassmorphism subtils
          </p>
        </div>

        <div className='glass-content-card mb-12'>
          <h2 className='glass-title mb-8'>Boutons Glassmorphism Sombre</h2>
          <div className='flex flex-wrap gap-6'>
            <button className='glass-button'>Bouton Standard</button>
            <button className='glass-button-neon glass-glow'>Bouton Neon</button>
            <button className='glass-button glass-shimmer'>Bouton Shimmer</button>
            <button className='glass-button-neon glass-glow glass-shimmer'>Bouton Premium</button>
          </div>
        </div>

        <div className='glass-content-card mb-12'>
          <h2 className='glass-title mb-8'>Cartes Glassmorphism Sombre</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            <div className='glass-card'>
              <h3 className='text-xl font-semibold mb-4' style={{ color: 'var(--glass-text)' }}>
                Carte Standard
              </h3>
              <p style={{ color: 'var(--glass-text-secondary)' }}>Une carte avec le style glassmorphism sombre, incluant des effets de transparence et blur subtils.</p>
            </div>
            <div className='glass-card glass-glow'>
              <h3 className='text-xl font-semibold mb-4' style={{ color: 'var(--glass-text)' }}>
                Carte avec Glow
              </h3>
              <p style={{ color: 'var(--glass-text-secondary)' }}>Cette carte a un effet de glow au survol, parfait pour les éléments importants.</p>
            </div>
            <div className='glass-card glass-shimmer'>
              <h3 className='text-xl font-semibold mb-4' style={{ color: 'var(--glass-text)' }}>
                Carte Shimmer
              </h3>
              <p style={{ color: 'var(--glass-text-secondary)' }}>Cette carte a un effet de shimmer continu, idéal pour les éléments premium.</p>
            </div>
          </div>
        </div>

        <div className='glass-content-card mb-12'>
          <h2 className='glass-title mb-8'>Éléments d'Interface Sombre</h2>
          <div className='space-y-8'>
            <div>
              <label className='block text-sm font-medium mb-3' style={{ color: 'var(--glass-text-secondary)' }}>
                Champ de recherche glassmorphism sombre
              </label>
              <input type='text' placeholder='Rechercher dans les étoiles...' className='glass-input w-full' />
            </div>

            <div>
              <label className='block text-sm font-medium mb-3' style={{ color: 'var(--glass-text-secondary)' }}>
                Sélecteur glassmorphism sombre
              </label>
              <select className='glass-input w-full'>
                <option>Étoiles blanches</option>
                <option>Étoiles bleues</option>
                <option>Étoiles dorées</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium mb-3' style={{ color: 'var(--glass-text-secondary)' }}>
                Zone de texte glassmorphism sombre
              </label>
              <textarea placeholder='Écrivez votre message sous les étoiles...' className='glass-input w-full h-24 resize-none' />
            </div>
          </div>
        </div>

        <div className='glass-content-card mb-12'>
          <h2 className='glass-title mb-8'>Palette de Couleurs Neon Subtiles</h2>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6'>
            <div className='text-center'>
              <div className='w-20 h-20 bg-neon-blue rounded-xl mx-auto mb-3 shadow-glass-glow'></div>
              <span className='text-sm' style={{ color: 'var(--glass-text-secondary)' }}>
                Neon Blue
              </span>
            </div>
            <div className='text-center'>
              <div className='w-20 h-20 bg-neon-purple rounded-xl mx-auto mb-3 shadow-glass-glow'></div>
              <span className='text-sm' style={{ color: 'var(--glass-text-secondary)' }}>
                Neon Purple
              </span>
            </div>
            <div className='text-center'>
              <div className='w-20 h-20 bg-neon-pink rounded-xl mx-auto mb-3 shadow-glass-glow'></div>
              <span className='text-sm' style={{ color: 'var(--glass-text-secondary)' }}>
                Neon Pink
              </span>
            </div>
            <div className='text-center'>
              <div className='w-20 h-20 bg-neon-green rounded-xl mx-auto mb-3 shadow-glass-glow'></div>
              <span className='text-sm' style={{ color: 'var(--glass-text-secondary)' }}>
                Neon Green
              </span>
            </div>
            <div className='text-center'>
              <div className='w-20 h-20 bg-neon-orange rounded-xl mx-auto mb-3 shadow-glass-glow'></div>
              <span className='text-sm' style={{ color: 'var(--glass-text-secondary)' }}>
                Neon Orange
              </span>
            </div>
            <div className='text-center'>
              <div className='w-20 h-20 bg-neon-yellow rounded-xl mx-auto mb-3 shadow-glass-glow'></div>
              <span className='text-sm' style={{ color: 'var(--glass-text-secondary)' }}>
                Neon Yellow
              </span>
            </div>
          </div>
        </div>

        <div className='glass-content-card mb-12'>
          <h2 className='glass-title mb-8'>Navigation Glassmorphism Sombre</h2>
          <div className='flex flex-wrap gap-4'>
            <Link href='/' className='glass-nav'>
              Accueil
            </Link>
            <Link href='/marketplace' className='glass-nav'>
              Marketplace
            </Link>
            <Link href='/game-shop' className='glass-nav'>
              Boutique
            </Link>
            <Link href='/api-docs' className='glass-nav'>
              Documentation
            </Link>
            <Link href='/settings' className='glass-nav'>
              Paramètres
            </Link>
          </div>
        </div>

        <div className='glass-content-card mb-12'>
          <h2 className='glass-title mb-8'>Méthodes API Glassmorphism Sombre</h2>
          <div className='flex flex-wrap gap-4'>
            <span className='glass-method get'>GET</span>
            <span className='glass-method post'>POST</span>
            <span className='glass-method put'>PUT</span>
            <span className='glass-method patch'>PATCH</span>
            <span className='glass-method delete'>DELETE</span>
          </div>
        </div>

        <div className='glass-content-card mb-12'>
          <h2 className='glass-title mb-8'>Effets d'Animation Étoilés</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <div className='glass-card text-center animate-star-float'>
              <div className='text-3xl mb-3'>⭐</div>
              <h3 className='font-semibold mb-2'>Twinkle</h3>
              <p className='text-sm' style={{ color: 'var(--glass-text-secondary)' }}>
                Animation scintillante
              </p>
            </div>
            <div className='glass-card text-center '>
              <div className='text-3xl mb-3'>💫</div>
              <h3 className='font-semibold mb-2'>Glow</h3>
              <p className='text-sm' style={{ color: 'var(--glass-text-secondary)' }}>
                Effet de lueur
              </p>
            </div>
            <div className='glass-card text-center animate-glass-pulse'>
              <div className='text-3xl mb-3'>🌟</div>
              <h3 className='font-semibold mb-2'>Pulse</h3>
              <p className='text-sm' style={{ color: 'var(--glass-text-secondary)' }}>
                Animation pulsante
              </p>
            </div>
            <div className='glass-card text-center animate-star-twinkle'>
              <div className='text-3xl mb-3'>✨</div>
              <h3 className='font-semibold mb-2'>Shimmer</h3>
              <p className='text-sm' style={{ color: 'var(--glass-text-secondary)' }}>
                Animation brillante
              </p>
            </div>
          </div>
        </div>

        <div className='glass-content-card mb-12'>
          <h2 className='glass-title mb-8'>Étoiles Filantes</h2>
          <div className='relative h-32 overflow-hidden rounded-xl bg-dark-primary'>
            <div className='shooting-star' style={{ top: '20%', left: '0%', animationDelay: '0s' }}></div>
            <div className='shooting-star' style={{ top: '40%', left: '0%', animationDelay: '2s' }}></div>
            <div className='shooting-star' style={{ top: '60%', left: '0%', animationDelay: '4s' }}></div>
            <div className='shooting-star' style={{ top: '80%', left: '0%', animationDelay: '6s' }}></div>
            <div className='absolute inset-0 flex items-center justify-center'>
              <p style={{ color: 'var(--glass-text-secondary)' }}>Regardez les étoiles filantes !</p>
            </div>
          </div>
        </div>

        <div className='text-center'>
          <Link href='/' className='glass-button-neon glass-glow'>
            <span className='flex items-center gap-2'>🌟 Retour à l'accueil</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
