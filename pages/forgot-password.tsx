import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import useIsMobile from '../hooks/useIsMobile';

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

const containerStyle: React.CSSProperties = {
  maxWidth: 400,
  margin: '60px auto',
  background: '#23232a',
  borderRadius: 12,
  boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
  padding: '32px 24px',
  color: '#fff',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const containerMobileStyle: React.CSSProperties = {
  ...containerStyle,
  maxWidth: 340,
  margin: '32px auto',
  padding: '18px 8px',
  borderRadius: 10,
  fontSize: '0.98em',
};

const titleStyle: React.CSSProperties = {
  marginBottom: 32,
};

const titleMobileStyle: React.CSSProperties = {
  ...titleStyle,
  fontSize: '1.15em',
  marginBottom: 18,
};

const infoTextStyle: React.CSSProperties = {
  marginTop: 24,
  color: '#aaa',
  fontSize: 14,
};

const infoTextMobileStyle: React.CSSProperties = {
  ...infoTextStyle,
  marginTop: 14,
  fontSize: 13,
};

function ForgotPasswordDesktop(props: any) {
  const { t } = useTranslation('common');
  const { email, setEmail, loading, error, success, handleSubmit } = props;
  return (
    <div className='container' style={containerStyle}>
      <h2 style={titleStyle}>{t('forgotPassword.title')}</h2>
      <form style={{ width: '260px', maxWidth: 340 }} onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600, marginBottom: 6, display: 'block' }}>{t('forgotPassword.emailLabel')}</label>
          <input
            type='email'
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: '240px',
              padding: '10px 12px',
              borderRadius: 6,
              border: '1px solid #444',
              background: '#18181c',
              color: '#fff',
              fontSize: 16,
            }}
            autoComplete='email'
            required
          />
        </div>
        <button
          type='submit'
          style={{
            width: '260px',
            padding: '12px',
            background: '#5865F2',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: 8,
          }}
          disabled={loading}>
          {loading ? t('forgotPassword.sending') : t('forgotPassword.send')}
        </button>
        {error && <div style={{ color: '#ff5252', marginTop: 12 }}>{t('forgotPassword.error')}</div>}
        {success && <div style={{ color: '#4caf50', marginTop: 12 }}>{t('forgotPassword.success')}</div>}
      </form>
      <div
        style={{
          ...infoTextStyle,
          width: '260px',
          maxWidth: 340,
          textAlign: 'center',
        }}>
        {t('forgotPassword.info')}
      </div>
      <div
        style={{
          width: '260px',
          maxWidth: 340,
          marginTop: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}>
        <span style={{ color: '#aaa', fontSize: 14, alignSelf: 'center' }}>
          <Link href='/login' style={{ color: '#8ab4f8', textDecoration: 'none' }}>
            {t('forgotPassword.remembered')}
          </Link>
        </span>
      </div>
    </div>
  );
}

function ForgotPasswordMobile(props: any) {
  const { t } = useTranslation('common');
  const { email, setEmail, loading, error, success, handleSubmit } = props;
  return (
    <div className='container' style={containerMobileStyle}>
      <h2 style={titleMobileStyle}>{t('forgotPassword.title')}</h2>
      <form style={{ width: '100%', maxWidth: 300 }} onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontWeight: 600, marginBottom: 4, display: 'block' }}>{t('forgotPassword.emailLabel')}</label>
          <input
            type='email'
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: '280px',
              padding: '9px 10px',
              borderRadius: 6,
              border: '1px solid #444',
              background: '#18181c',
              color: '#fff',
              fontSize: 15,
            }}
            autoComplete='email'
            required
          />
        </div>
        <button
          type='submit'
          style={{
            width: '100%',
            padding: '10px',
            background: '#5865F2',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: 6,
          }}
          disabled={loading}>
          {loading ? t('forgotPassword.sending') : t('forgotPassword.send')}
        </button>
        {error && <div style={{ color: '#ff5252', marginTop: 10 }}>{t('forgotPassword.error')}</div>}
        {success && <div style={{ color: '#4caf50', marginTop: 10 }}>{t('forgotPassword.success')}</div>}
      </form>
      <div
        style={{
          ...infoTextMobileStyle,
          width: '100%',
          maxWidth: 300,
          textAlign: 'center',
        }}>
        {t('forgotPassword.info')}
      </div>
      <div
        style={{
          width: '100%',
          maxWidth: 300,
          marginTop: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
        <span style={{ color: '#aaa', fontSize: 13 }}>
          <Link href='/login' style={{ color: '#8ab4f8', textDecoration: 'none' }}>
            {t('forgotPassword.remembered')}
          </Link>
        </span>
      </div>
    </div>
  );
}

export default function ForgotPassword() {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send reset email');
      setSuccess('Password reset email sent.');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const props = { email, setEmail, loading, error, success, handleSubmit };

  return isMobile ? <ForgotPasswordMobile {...props} /> : <ForgotPasswordDesktop {...props} />;
}


