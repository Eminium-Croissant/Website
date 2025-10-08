import { useTranslation } from 'next-i18next';
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
const JoinLobbyPage = () => {
  const router = useRouter();
  const { lobbyId } = router.query;
  const [status, setStatus] = useState('pending');
  const { token } = useAuth();
  const { t } = useTranslation('common');

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    if (typeof lobbyId === 'string' && lobbyId) {
      fetch(`/api/lobbies/${lobbyId}/join`, {
        method: 'POST',
      })
        .then(async res => {
          setStatus(res.ok ? 'success' : 'error');
        })
        .catch(() => setStatus('error'));
    }
  }, [lobbyId, token, router]);

  if (!lobbyId) {
    return <div>{t('joinLobby.noLobbyId')}</div>;
  }

  if (status === 'pending') return <div>{t('joinLobby.joining')}</div>;
  if (status === 'success') return <div>{t('joinLobby.success')}</div>;
  return <div>{t('joinLobby.failed')}</div>;
};

export default JoinLobbyPage;
