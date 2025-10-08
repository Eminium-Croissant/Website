import 'github-markdown-css/github-markdown.css';
import '../styles/atom-one-dark.min.css';
import '../styles/globals.css';
import '../styles/main.css';
import '../styles/rarity.css';

import { appWithTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import Footer from '../components/common/Footer';
import MetaLinks from '../components/common/MetaLinks';
import { getMetaLinksProps } from '../components/common/metaLinks.server';
import NavBarDesktop from '../components/common/NavBarDesktop';
import NavBarMobile from '../components/common/NavBarMobile';
import OgGameMetaLinks from '../components/common/OgGameMetaLinks';
import ImagePreloader from '../components/utils/ImagePreloader';
import { AuthProvider } from '../hooks/AuthContext';
import { ImageCacheProvider } from '../hooks/ImageCacheContext';
import { LobbyProvider } from '../hooks/LobbyContext';
import useIsMobile from '../hooks/useIsMobile';
import { UserCacheProvider } from '../hooks/UserCacheContext';
import LauncherLobby from './launcher/components/Lobby';
import LauncherNavbar from './launcher/components/Navbar';

function BackgroundImage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const img = <img src='/assets/backgrounds/raiden-crow.webp' alt='background' className='absolute top-0 left-0 w-screen h-screen object-cover opacity-5 blur-[3px] transition-opacity duration-800 max-w-full' />;
  return (
    <div className='fixed -z-10 top-0 left-0 w-screen h-screen pointer-events-none overflow-hidden object-cover bg-dark-gradient' aria-hidden='true'>
      {img}
      <div className='absolute inset-0 bg-gradient-to-b from-transparent via-dark-primary/20 to-dark-secondary/40' />
    </div>
  );
}

function LauncherLayout({ Component, pageProps }: { Component: any; pageProps: any }) {
  return (
    <>
      <BackgroundImage />
      <MetaLinks metaLinksTitle={'Croissant Launcher'} />
      <ImagePreloader images={['/assets/backgrounds/raiden-crow.webp']} priority={true} />
      <nav className='flex px-4 py-0 border-b border-[#ddd] justify-start fixed w-full bg-[#222]'>
        <img src='/assets/icons/favicon-32x32.avif' alt='Icon' className='w-6 h-6' />
        <span className='relative top-0.5 -right-2.5'>Croissant Launcher</span>
      </nav>
      <LauncherNavbar />
      <main className='fixed inset-x-0 top-28 bottom-0 overflow-x-hidden overflow-y-auto launcher'>
        <Component {...pageProps} />
      </main>
      <LauncherLobby />
    </>
  );
}

function WebsiteLayout({ Component, pageProps, mainStyle }: { Component: any; pageProps: any; mainStyle?: string }) {
  const isMobile = useIsMobile();
  return (
    <div>
      <BackgroundImage />
      {pageProps?.ogMeta ? <OgGameMetaLinks {...pageProps.ogMeta} /> : <MetaLinks metaLinksTitle={pageProps?.title} />}
      {!pageProps?.isOauth2Auth && !pageProps?.isLauncher && (isMobile ? <NavBarMobile /> : <NavBarDesktop />)}
      <main className={`${mainStyle ?? ''}`}>
        <Component {...pageProps} />
      </main>
      {!pageProps?.isOauth2Auth && !pageProps?.isLauncher && <Footer />}
    </div>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
      ...(await getMetaLinksProps(locale)),
    },
  };
}

function AppContent({ Component, pageProps }: AppProps) {
  const [isLauncher, setIsLauncher] = useState(false);
  const [mainStyle, setMainStyle] = useState('');

  useEffect(() => {
    setMainStyle(window.location.href.includes('/oauth2/auth') ? 'flex justify-center items-center p-0 m-auto h-[calc(100vh-30px)] top-0 left-0 right-0 bottom-0 fixed' : '');
    const setAppHeight = () => document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    setAppHeight();
    window.addEventListener('resize', setAppHeight);
    const isLauncherPath = window.location.pathname.startsWith('/launcher');
    const isFromLauncher = document.cookie.includes('from=app');
    setIsLauncher(isLauncherPath || isFromLauncher);
    return () => window.removeEventListener('resize', setAppHeight);
  }, []);

  if (isLauncher) return <LauncherLayout Component={Component} pageProps={pageProps} />;
  return <WebsiteLayout Component={Component} pageProps={pageProps} mainStyle={mainStyle} />;
}

export function App(props: AppProps) {
  return (
    <ImageCacheProvider>
      <UserCacheProvider>
        <AuthProvider>
          <LobbyProvider>
            <AppContent {...props} />
          </LobbyProvider>
        </AuthProvider>
      </UserCacheProvider>
    </ImageCacheProvider>
  );
}

export default appWithTranslation(App);


