import { faDesktop, faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Trans, useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import CachedImage from '../components/utils/CachedImage';
import useIsMobile from '../hooks/useIsMobile';

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

function DownloadLauncherDesktop() {
  const { t } = useTranslation('common');

  const downloadLinks = [
    {
      platform: 'Windows',
      icon: faDesktop,
      url: 'https://github.com/Croissant-API/Launcher/releases/download/v1.2.8/croissant-launcher-win32-x64.zip',
      color: 'text-neon-blue',
    },
    // {
    //   platform: "macOS",
    //   icon: faLaptop,
    //   url: "https://github.com/croissant-API/croissant-Launcher/releases/latest/download/CroissantLauncher.dmg",
    //   color: "text-neon-purple"
    // },
    // {
    //   platform: "Linux",
    //   icon: faServer,
    //   url: "https://github.com/croissant-API/croissant-Launcher/releases/latest/download/CroissantLauncher.AppImage",
    //   color: "text-neon-green"
    // }
  ];

  return (
    <div className='glass-page-container'>
      <div className='glass-content-card  mx-auto'>
        <h1 className='text-4xl font-bold mb-8 text-center' style={{ color: 'var(--glass-text)' }}>
          <span className='glass-method put'>{t('downloadLauncher.title')}</span>
        </h1>

        <div className='text-center mb-8'>
          <p className='text-xl mb-6' style={{ color: 'var(--glass-text-secondary)' }}>
            {t('downloadLauncher.description.desktop')}
          </p>
          <div className='mb-6'>
            <a href='https://github.com/croissant-API/croissant-Launcher/' target='_blank' rel='noopener noreferrer' className='glass-button inline-flex items-center gap-2'>
              <FontAwesomeIcon icon={faDownload} />
              {t('downloadLauncher.githubAllReleases')}
            </a>
          </div>

          {/* Boutons de téléchargement */}
          <div className='grid grid-cols-1 md:grid-cols-1 gap-6 mb-8'>
            {downloadLinks.map(link => (
              <a key={link.platform} href={link.url} target='_blank' rel='noopener noreferrer' className='glass-card p-6 text-center hover:scale-105 transition-transform duration-300 hover:shadow-glass-glow'>
                <FontAwesomeIcon icon={link.icon} className={`text-4xl mb-4 ${link.color}`} />
                <h3 className='text-xl font-bold mb-2' style={{ color: 'var(--glass-text)' }}>
                  {link.platform}
                </h3>
                <p className='text-sm mb-4' style={{ color: 'var(--glass-text-secondary)' }}>
                  {t('downloadLauncher.note') ? t('downloadLauncher.note') : `Télécharger pour ${link.platform}`}
                </p>
                <div className='glass-button-neon w-full'>
                  <FontAwesomeIcon icon={faDownload} className='mr-2' />
                  {t('downloadLauncher.downloadButton')}
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className='glass-card p-6 mb-8'>
          <h2 className='text-2xl font-bold mb-4' style={{ color: 'var(--glass-text)' }}>
            {t('downloadLauncher.instructions')}
          </h2>
          <ol className='list-decimal list-inside space-y-3' style={{ color: 'var(--glass-text-secondary)' }}>
            <li>
              <Trans i18nKey='downloadLauncher.step1'>
                <a href='https://github.com/croissant-API/croissant-Launcher/' target='_blank' rel='noopener noreferrer' />
              </Trans>
            </li>
            <li>{t('downloadLauncher.step2')}</li>
            <li>{t('downloadLauncher.step3.windows')}</li>
            <li>{t('downloadLauncher.step4')}</li>
          </ol>
        </div>

        {/* Capture d'écran */}
        <div className='glass-card p-6'>
          <h2 className='text-2xl font-bold mb-4' style={{ color: 'var(--glass-text)' }}>
            {t('downloadLauncher.previewTitleDesktop')}
          </h2>
          <CachedImage src='/assets/launcher.avif' alt={t('downloadLauncher.previewAlt')} className='w-full h-auto rounded-xl' />
        </div>
      </div>
    </div>
  );
}

function DownloadLauncherMobile() {
  const { t } = useTranslation('common');

  const downloadLinks = [
    {
      platform: 'Windows',
      icon: faDesktop,
      url: 'https://github.com/croissant-API/croissant-Launcher/releases/latest/download/CroissantLauncher-Setup.exe',
      color: 'text-neon-blue',
    },
    // {
    //   platform: "macOS",
    //   icon: faLaptop,
    //   url: "https://github.com/croissant-API/croissant-Launcher/releases/latest/download/CroissantLauncher.dmg",
    //   color: "text-neon-purple"
    // },
    // {
    //   platform: "Linux",
    //   icon: faServer,
    //   url: "https://github.com/croissant-API/croissant-Launcher/releases/latest/download/CroissantLauncher.AppImage",
    //   color: "text-neon-green"
    // }
  ];

  return (
    <div className='glass-page-container !max-w-[1000px]'>
      <div className='glass-content-card !mt-0 !mx-0 mb-6'>
        <h1 className='text-2xl font-bold mb-6 text-center' style={{ color: 'var(--glass-text)' }}>
          <span className='glass-method put'>{t('downloadLauncher.title')}</span>
        </h1>

        <div className='text-center mb-6'>
          <p className='text-base mb-6' style={{ color: 'var(--glass-text-secondary)' }}>
            {t('downloadLauncher.description.mobile')}
          </p>
          <div className='mb-6'>
            <a href='https://github.com/croissant-API/croissant-Launcher/' target='_blank' rel='noopener noreferrer' className='glass-button w-full inline-flex items-center justify-center gap-2'>
              <FontAwesomeIcon icon={faDownload} />
              {t('downloadLauncher.githubView')}
            </a>
          </div>

          {/* Boutons de téléchargement mobile */}
          <div className='space-y-4 mb-6'>
            {downloadLinks.map(link => (
              <a key={link.platform} href={link.url} target='_blank' rel='noopener noreferrer' className='glass-card p-4 flex items-center gap-4 hover:scale-105 transition-transform duration-300'>
                <FontAwesomeIcon icon={link.icon} className={`text-2xl ${link.color}`} />
                <div className='flex-1 text-left'>
                  <h3 className='text-lg font-bold mb-1' style={{ color: 'var(--glass-text)' }}>
                    {link.platform}
                  </h3>
                  <p className='text-sm' style={{ color: 'var(--glass-text-secondary)' }}>
                    {t('downloadLauncher.note') ? t('downloadLauncher.note') : `Télécharger pour ${link.platform}`}
                  </p>
                </div>
                <FontAwesomeIcon icon={faDownload} className='text-neon-blue' />
              </a>
            ))}
          </div>
        </div>

        {/* Instructions mobile */}
        <div className='glass-card !p-4 mb-6'>
          <h2 className='text-lg font-bold mb-3' style={{ color: 'var(--glass-text)' }}>
            {t('downloadLauncher.instructions')}
          </h2>
          <ol className='list-decimal list-inside space-y-2 text-sm' style={{ color: 'var(--glass-text-secondary)' }}>
            <li>
              <Trans i18nKey='downloadLauncher.step1'>
                <a href='https://github.com/croissant-API/croissant-Launcher/' target='_blank' rel='noopener noreferrer' />
              </Trans>
            </li>
            <li>{t('downloadLauncher.step2')}</li>
            <li>{t('downloadLauncher.step3.windows')}</li>
            <li>{t('downloadLauncher.step4')}</li>
          </ol>
        </div>

        {/* Capture d'écran mobile */}
        <div className='glass-card !p-4'>
          <h2 className='text-lg font-bold mb-3' style={{ color: 'var(--glass-text)' }}>
            {t('downloadLauncher.previewTitleMobile')}
          </h2>
          <CachedImage src='/assets/launcher.avif' alt={t('downloadLauncher.previewAlt')} className='w-full h-auto rounded-lg' />
        </div>
      </div>
    </div>
  );
}

export default function DownloadLauncher() {
  const isMobile = useIsMobile();
  return isMobile ? <DownloadLauncherMobile /> : <DownloadLauncherDesktop />;
}
