import { faArrowLeft, faCopy } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useState } from 'react';
import InstagramPost from '../components/InstagramPost';

type DemoConfig = {
  name: string;
  props: {
    title: string;
    subtitle: string;
    description: string;
    theme: 'default' | 'gaming' | 'community' | 'developer';
    size: 'small' | 'medium' | 'large';
    features?: string[];
  };
};

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default function InstagramPostDemo() {
  const { t } = useTranslation('common');
  const [selectedConfig, setSelectedConfig] = useState<DemoConfig | null>(null);
  const [copiedConfig, setCopiedConfig] = useState<string | false>(false);

  const demoConfigs: DemoConfig[] = [
    {
      name: 'Default',
      props: {
        title: 'Croissant',
        subtitle: 'Gaming Platform',
        description: "Un système d'inventaire créatif et réutilisable, open source, évolutif, API à gogo et technologie réseau au top",
        theme: 'default' as const,
        size: 'medium' as const,
      },
    },
    {
      name: 'Gaming Theme',
      props: {
        title: 'Croissant',
        subtitle: 'Game Launcher',
        description: 'Découvre, joue et échange des objets avec la communauté gaming. Ton launcher gaming ultime.',
        theme: 'gaming' as const,
        features: ['Gaming', 'Trading', 'Community', 'Launcher'],
        size: 'medium' as const,
      },
    },
    {
      name: 'Community',
      props: {
        title: 'Croissant',
        subtitle: 'Community Hub',
        description: 'Rejoins une communauté de gamers passionnés. Échange, partage et découvre de nouveaux jeux.',
        theme: 'community' as const,
        features: ['Community', 'Social', 'Gaming', 'Friends'],
        size: 'medium' as const,
      },
    },
    {
      name: 'Developer',
      props: {
        title: 'Croissant',
        subtitle: 'Developer API',
        description: "API puissante pour les développeurs. Intègre facilement l'inventaire gaming dans tes projets.",
        theme: 'developer' as const,
        features: ['API', 'SDK', 'Open Source', 'Dev Tools'],
        size: 'medium' as const,
      },
    },
    {
      name: 'Small Size',
      props: {
        title: 'Croissant',
        subtitle: 'Gaming',
        description: 'Inventaire gaming révolutionnaire',
        theme: 'default' as const,
        size: 'small' as const,
      },
    },
    {
      name: 'Large Size',
      props: {
        title: 'Croissant',
        subtitle: 'Gaming Platform',
        description: "Un système d'inventaire créatif et réutilisable, open source, évolutif, API à gogo et technologie réseau au top. Rejoins la révolution gaming !",
        theme: 'gaming' as const,
        features: ['Gaming', 'Trading', 'API', 'Open Source', 'Community'],
        size: 'large' as const,
      },
    },
  ];

  const copyToClipboard = (config: DemoConfig) => {
    const code = `<InstagramPost
  title="${config.props.title}"
  subtitle="${config.props.subtitle}"
  description="${config.props.description}"
  theme="${config.props.theme}"
  size="${config.props.size}"
  ${config.props.features ? `features={${JSON.stringify(config.props.features)}}` : ''}
/>`;

    navigator.clipboard.writeText(code);
    setCopiedConfig(config.name);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-[#0A0A0F] via-[#1A1A23] to-[#2A2A35]'>
      <div className='glass-page-container'>
        <div className='flex items-center justify-between mb-12'>
          <div>
            <h1 className='text-6xl font-bold mb-6 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent'>Instagram Post Template</h1>
            <p className='text-glass-text-secondary text-xl'>Templates Instagram carrés avec style glassmorphism pour Croissant</p>
          </div>
          <Link href='/' className='glass-button'>
            <FontAwesomeIcon icon={faArrowLeft} className='mr-2' />
            Retour
          </Link>
        </div>

        <div className='glass-content-card mb-12'>
          <h2 className='glass-title mb-6'>Comment utiliser</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='glass-card text-center'>
              <div className='text-3xl mb-3'>📱</div>
              <h3 className='font-semibold mb-2 text-glass-text'>Choisis un style</h3>
              <p className='text-sm text-glass-text-secondary'>Sélectionne le template qui correspond à ton message</p>
            </div>
            <div className='glass-card text-center'>
              <div className='text-3xl mb-3'>🎨</div>
              <h3 className='font-semibold mb-2 text-glass-text'>Personnalise</h3>
              <p className='text-sm text-glass-text-secondary'>Adapte le contenu, thème et taille selon tes besoins</p>
            </div>
            <div className='glass-card text-center'>
              <div className='text-3xl mb-3'>📲</div>
              <h3 className='font-semibold mb-2 text-glass-text'>Exporte</h3>
              <p className='text-sm text-glass-text-secondary'>Utilise le code ou capture d'écran pour Instagram</p>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12'>
          {demoConfigs.map((config, index) => (
            <div key={index} className='glass-content-card text-center'>
              <h3 className='text-xl font-semibold mb-4 text-glass-text'>{config.name}</h3>

              <div className='flex justify-center mb-6'>
                <InstagramPost {...config.props} />
              </div>

              <div className='flex gap-3 justify-center'>
                <button onClick={() => copyToClipboard(config)} className='glass-button-neon flex items-center gap-2'>
                  <FontAwesomeIcon icon={faCopy} />
                  {copiedConfig === config.name ? 'Copié !' : 'Code'}
                </button>
                <button onClick={() => setSelectedConfig(config)} className='glass-button'>
                  Détails
                </button>
              </div>
            </div>
          ))}
        </div>

        {selectedConfig && (
          <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
            <div className='glass-card  w-full max-h-[90vh] overflow-y-auto'>
              <div className='flex justify-between items-start mb-6'>
                <h3 className='text-2xl font-bold text-glass-text'>{selectedConfig.name} - Configuration</h3>
                <button onClick={() => setSelectedConfig(null)} className='glass-button text-glass-text-secondary hover:text-glass-text'>
                  ✕
                </button>
              </div>

              <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                <div className='flex justify-center'>
                  <InstagramPost {...selectedConfig.props} />
                </div>

                <div>
                  <h4 className='text-lg font-semibold mb-4 text-glass-text'>Code React</h4>
                  <pre className='glass-card bg-black/20 p-4 rounded-lg overflow-x-auto text-sm text-glass-text-secondary'>
                    {`<InstagramPost
  title="${selectedConfig.props.title}"
  subtitle="${selectedConfig.props.subtitle}"
  description="${selectedConfig.props.description}"
  theme="${selectedConfig.props.theme}"
  size="${selectedConfig.props.size}"${
    selectedConfig.props.features
      ? `
  features={${JSON.stringify(selectedConfig.props.features, null, 2).replace(/\n/g, '\n  ')}}`
      : ''
  }
/>`}
                  </pre>

                  <h4 className='text-lg font-semibold mb-4 mt-6 text-glass-text'>Props disponibles</h4>
                  <div className='space-y-3'>
                    <div className='glass-card p-3'>
                      <strong className='text-glass-text'>theme:</strong>
                      <span className='text-glass-text-secondary ml-2'>"default" | "gaming" | "community" | "developer"</span>
                    </div>
                    <div className='glass-card p-3'>
                      <strong className='text-glass-text'>size:</strong>
                      <span className='text-glass-text-secondary ml-2'>"small" | "medium" | "large"</span>
                    </div>
                    <div className='glass-card p-3'>
                      <strong className='text-glass-text'>features:</strong>
                      <span className='text-glass-text-secondary ml-2'>string[] - Badges à afficher</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className='glass-content-card'>
          <h2 className='glass-title mb-6'>Conseils d'utilisation</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <div>
              <h3 className='text-xl font-semibold mb-4 text-glass-text'>📐 Format Instagram</h3>
              <ul className='space-y-2 text-glass-text-secondary'>
                <li>• Format carré (1:1) optimisé pour Instagram</li>
                <li>• Taille medium recommandée pour posts</li>
                <li>• Taille large pour story highlights</li>
                <li>• Taille small pour stories multiples</li>
              </ul>
            </div>
            <div>
              <h3 className='text-xl font-semibold mb-4 text-glass-text'>🎨 Personnalisation</h3>
              <ul className='space-y-2 text-glass-text-secondary'>
                <li>• 4 thèmes prédéfinis disponibles</li>
                <li>• Badges features personnalisables</li>
                <li>• Logo emoji ou image supported</li>
                <li>• Texte adaptatif selon la taille</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
