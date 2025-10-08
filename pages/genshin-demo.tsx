import Link from 'next/link';

export default function GenshinDemo() {
  return (
    <div className='min-h-screen bg-genshin-gradient'>
      <div className='page-container'>
        <div className='text-center mb-12'>
          <h1 className='text-5xl font-bold mb-4 bg-gradient-to-r from-genshin-gold via-genshin-blue to-genshin-purple bg-clip-text text-transparent'>Démonstration du Thème Genshin Impact</h1>
          <p className='text-dark-textSecondary text-xl'>Découvrez tous les nouveaux composants et styles harmonieux inspirés de Genshin Impact</p>
        </div>

        {/* Boutons */}
        <div className='genshin-card mb-8'>
          <h2 className='section-title mb-6'>Boutons</h2>
          <div className='flex flex-wrap gap-4'>
            <button className='genshin-button'>Bouton Standard</button>
            <button className='genshin-button-gold'>Bouton Premium</button>
            <button className='genshin-button genshin-glow-effect'>Bouton avec Glow</button>
            <button className='genshin-button-gold genshin-shimmer'>Bouton Shimmer</button>
          </div>
        </div>

        {/* Cartes */}
        <div className='genshin-card mb-8'>
          <h2 className='section-title mb-6'>Cartes</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            <div className='genshin-card'>
              <h3 className='text-xl font-semibold mb-3 text-genshin-gold'>Carte Standard</h3>
              <p className='text-dark-textSecondary'>Une carte avec le style Genshin Impact standard, incluant des effets de hover et des animations.</p>
            </div>
            <div className='genshin-card genshin-glow-effect'>
              <h3 className='text-xl font-semibold mb-3 text-genshin-blue'>Carte avec Glow</h3>
              <p className='text-dark-textSecondary'>Cette carte a un effet de glow au survol, parfait pour les éléments importants.</p>
            </div>
            <div className='genshin-card genshin-shimmer'>
              <h3 className='text-xl font-semibold mb-3 text-genshin-purple'>Carte Shimmer</h3>
              <p className='text-dark-textSecondary'>Cette carte a un effet de shimmer continu, idéal pour les éléments premium.</p>
            </div>
          </div>
        </div>

        {/* Éléments d'interface */}
        <div className='genshin-card mb-8'>
          <h2 className='section-title mb-6'>Éléments d'Interface</h2>
          <div className='space-y-6'>
            <div>
              <label className='block text-sm font-medium text-dark-textSecondary mb-2'>Champ de recherche</label>
              <input type='text' placeholder='Rechercher...' className='w-full px-4 py-2 bg-dark-surfaceLight border border-dark-surfaceLight rounded-xl text-dark-text placeholder-dark-textMuted focus:outline-none focus:border-genshin-blue focus:ring-2 focus:ring-genshin-blue/20 transition-all duration-300' />
            </div>

            <div>
              <label className='block text-sm font-medium text-dark-textSecondary mb-2'>Sélecteur</label>
              <select className='w-full px-4 py-2 bg-dark-surfaceLight border border-dark-surfaceLight rounded-xl text-dark-text focus:outline-none focus:border-genshin-blue focus:ring-2 focus:ring-genshin-blue/20 transition-all duration-300'>
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>
          </div>
        </div>

        {/* Couleurs des éléments */}
        <div className='genshin-card mb-8'>
          <h2 className='section-title mb-6'>Couleurs des Éléments</h2>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='text-center'>
              <div className='w-16 h-16 bg-element-pyro rounded-xl mx-auto mb-2'></div>
              <span className='text-sm text-dark-textSecondary'>Pyro</span>
            </div>
            <div className='text-center'>
              <div className='w-16 h-16 bg-element-hydro rounded-xl mx-auto mb-2'></div>
              <span className='text-sm text-dark-textSecondary'>Hydro</span>
            </div>
            <div className='text-center'>
              <div className='w-16 h-16 bg-element-electro rounded-xl mx-auto mb-2'></div>
              <span className='text-sm text-dark-textSecondary'>Electro</span>
            </div>
            <div className='text-center'>
              <div className='w-16 h-16 bg-element-dendro rounded-xl mx-auto mb-2'></div>
              <span className='text-sm text-dark-textSecondary'>Dendro</span>
            </div>
            <div className='text-center'>
              <div className='w-16 h-16 bg-element-cryo rounded-xl mx-auto mb-2'></div>
              <span className='text-sm text-dark-textSecondary'>Cryo</span>
            </div>
            <div className='text-center'>
              <div className='w-16 h-16 bg-element-geo rounded-xl mx-auto mb-2'></div>
              <span className='text-sm text-dark-textSecondary'>Geo</span>
            </div>
            <div className='text-center'>
              <div className='w-16 h-16 bg-element-anemo rounded-xl mx-auto mb-2'></div>
              <span className='text-sm text-dark-textSecondary'>Anemo</span>
            </div>
            <div className='text-center'>
              <div className='w-16 h-16 bg-genshin-gold rounded-xl mx-auto mb-2'></div>
              <span className='text-sm text-dark-textSecondary'>Or</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className='genshin-card mb-8'>
          <h2 className='section-title mb-6'>Navigation</h2>
          <div className='flex flex-wrap gap-4'>
            <Link href='/' className='nav-link'>
              Accueil
            </Link>
            <Link href='/marketplace' className='nav-link'>
              Marketplace
            </Link>
            <Link href='/game-shop' className='nav-link'>
              Boutique
            </Link>
            <Link href='/api-docs' className='nav-link'>
              Documentation
            </Link>
          </div>
        </div>

        {/* Retour à l'accueil */}
        <div className='text-center'>
          <Link href='/' className='genshin-button-gold'>
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
