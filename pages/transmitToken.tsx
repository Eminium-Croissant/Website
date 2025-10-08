import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

const TransmitTokenPage = () => {
  const [statusMessage, setStatusMessage] = useState('Checking token...');
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (token) {
      window.location.href = `croissant-launcher://set-token?token=${encodeURIComponent(token)}`;

      router.replace('/close');
    } else {
      router.push('/login');
      return;
    }
  }, [token]);

  return <div>{statusMessage}</div>;
};

export default TransmitTokenPage;
