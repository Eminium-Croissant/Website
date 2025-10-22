import { useRouter } from 'next/dist/client/components/navigation';
import React, { useEffect } from 'react';
import { getServerSideTranslations as serverSideTranslations } from '../../components/utils/CloudflareI18n';

const endpoint = '/api';

declare global {
  interface Window {
    electron?: {
      window?: {
        minimize?: () => void;
        maximize?: () => void;
        close?: () => void;
        onSetToken?: (token: string) => void;
        openDiscordLogin?: () => void;
        openGoogleLogin?: () => void;
        openEmailLogin?: () => void;
      };
    };
    me: {
      userId: string;
      balance: number;
      verificationKey: string;
      username: string;
    };
  }
}

const LauncherPage: React.FC = () => {
  const router = useRouter();
  useEffect(() => {
    console.log('Croissant Launcher v0.1.0');
    console.log('Croissant Launcher is running in ' + process.env.NODE_ENV + ' mode.');
    router.push('/launcher/home');
  }, []);
  return <></>;
};


export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
      isLauncher: true,
    },
  };
}

export default LauncherPage;
