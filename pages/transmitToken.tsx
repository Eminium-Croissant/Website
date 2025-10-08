import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import useAuth from '../hooks/useAuth';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
/**
 * Page to transmit the authentication token to the Croissant Launcher via a custom protocol.
 * Redirects to the launcher if token is present, otherwise displays an error message.
 */
const TransmitTokenPage = () => {
  const [statusMessage, setStatusMessage] = useState('Checking token...');
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If token exists, transmit it to the launcher and redirect to close page
    if (token) {
      window.location.href = `croissant-launcher://set-token?token=${encodeURIComponent(token)}`;
      // Use replace to avoid adding to browser history
      router.replace('/close');
    } else {
      router.push('/login');
      return;
    }
    // Only run when token changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return <div>{statusMessage}</div>;
};

export default TransmitTokenPage;
