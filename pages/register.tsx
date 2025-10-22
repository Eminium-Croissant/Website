import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { getServerSideTranslations as serverSideTranslations, useTranslation } from '../components/utils/CloudflareI18n';
import useAuth from '../hooks/useAuth';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  credits: number;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

interface RegisterResponse {
  token: string;
  user: User;
}

interface ApiErrorResponse {
  message: string;
  error?: string;
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
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

const titleStyle: React.CSSProperties = {
  marginBottom: 32,
};

const discordBtnStyle: React.CSSProperties = {
  width: '260px',
  height: '48px',
  background: 'linear-gradient(90deg, #5865F2 60%, #404EED 100%)',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  marginBottom: '18px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
};

const discordIconStyle: React.CSSProperties = {
  fontSize: '22px',
};

const googleBtnStyle: React.CSSProperties = {
  width: '260px',
  height: '48px',
  background: '#fff',
  color: '#222',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  marginBottom: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
};

const googleIconSpanStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
};

const infoTextStyle: React.CSSProperties = {
  marginTop: 24,
  color: '#aaa',
  fontSize: 14,
};

export default function Register() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [registerLoading, setRegisterLoading] = React.useState(false);
  const [registerError, setRegisterError] = React.useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleDiscord = () => {
    router.push('/auth/discord');
  };

  const handleGoogle = () => {
    router.push('/auth/google');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError(null);
    setRegisterSuccess(null);
    if (!email || !username || !password || !confirmPassword) {
      setRegisterError('All fields are required.');
      setRegisterLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setRegisterError('Passwords do not match.');
      setRegisterLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          username,
          password,
          userId: crypto.randomUUID(),
        }),
      });
      const data = await res.json() as RegisterResponse | ApiErrorResponse;
      if (!res.ok) throw new Error((data as ApiErrorResponse).message || 'Registration failed');

      document.cookie = `token=${(data as RegisterResponse).token}; path=/; max-age=31536000`;
      location.href = '/';
    } catch (e: any) {
      setRegisterError(e.message);
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className='container' style={containerStyle}>
      <h2 style={titleStyle}>{t('register.title')}</h2>
      <form style={{ width: '260px', maxWidth: 340 }} onSubmit={handleRegister}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600, marginBottom: 6, display: 'block' }}>{t('register.email')}</label>
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
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600, marginBottom: 6, display: 'block' }}>{t('register.username')}</label>
          <input
            type='text'
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{
              width: '240px',
              padding: '10px 12px',
              borderRadius: 6,
              border: '1px solid #444',
              background: '#18181c',
              color: '#fff',
              fontSize: 16,
            }}
            autoComplete='username'
            required
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontWeight: 600, marginBottom: 6, display: 'block' }}>{t('register.password')}</label>
          <input
            type='password'
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              width: '240px',
              padding: '10px 12px',
              borderRadius: 6,
              border: '1px solid #444',
              background: '#18181c',
              color: '#fff',
              fontSize: 16,
            }}
            autoComplete='new-password'
            required
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontWeight: 600, marginBottom: 6, display: 'block' }}>{t('register.confirmPassword')}</label>
          <input
            type='password'
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            style={{
              width: '240px',
              padding: '10px 12px',
              borderRadius: 6,
              border: '1px solid #444',
              background: '#18181c',
              color: '#fff',
              fontSize: 16,
            }}
            autoComplete='new-password'
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
          disabled={registerLoading}>
          {registerLoading ? t('register.registering') : t('register.register')}
        </button>
        {registerError && <div style={{ color: '#ff5252', marginTop: 12 }}>{registerError === 'All fields are required.' ? t('register.error.allFields') : registerError === 'Passwords do not match.' ? t('register.error.passwords') : registerError === 'Registration failed' ? t('register.error.failed') : registerError}</div>}
        {registerSuccess && <div style={{ color: '#4caf50', marginTop: 12 }}>{t('register.success')}</div>}
      </form>

      <div
        style={{
          width: '260px',
          maxWidth: 340,
          marginTop: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}>
        <span style={{ color: '#aaa', fontSize: 14, alignSelf: 'flex-end' }}>
          <Link href='/login' style={{ color: '#8ab4f8', textDecoration: 'none' }}>
            {t('register.haveAccount')}
          </Link>
        </span>
      </div>

      <div
        style={{
          width: '260px',
          textAlign: 'center',
          margin: '24px 0 16px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
        <div style={{ flex: 1, height: 1, background: '#444' }} />
        <span style={{ color: '#888', fontSize: 14 }}>{t('register.or')}</span>
        <div style={{ flex: 1, height: 1, background: '#444' }} />
      </div>

      <button style={discordBtnStyle} onClick={handleDiscord}>
        <span className='fab fa-discord' style={discordIconStyle} aria-hidden='true' />
        {t('register.signUpWithDiscord')}
      </button>
      <button style={googleBtnStyle} onClick={handleGoogle}>
        <span style={googleIconSpanStyle}>
          <svg width='22' height='22' viewBox='0 0 48 48'>
            <g>
              <path fill='#4285F4' d='M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.86-6.86C36.64 2.69 30.74 0 24 0 14.82 0 6.73 5.8 2.69 14.09l7.98 6.2C12.41 13.41 17.74 9.5 24 9.5z' />
              <path fill='#34A853' d='M46.1 24.55c0-1.64-.15-3.22-.43-4.74H24v9.01h12.41c-.54 2.91-2.16 5.38-4.61 7.04l7.1 5.53C43.96 37.47 46.1 31.61 46.1 24.55z' />
              <path fill='#FBBC05' d='M10.67 28.29a14.5 14.5 0 0 1 0-8.58l-7.98-6.2A23.97 23.97 0 0 0 0 24c0 3.77.9 7.34 2.69 10.49l7.98-6.2z' />
              <path fill='#EA4335' d='M24 48c6.48 0 11.92-2.15 15.89-5.85l-7.1-5.53c-2 1.34-4.56 2.13-8.79 2.13-6.26 0-11.59-3.91-13.33-9.29l-7.98 6.2C6.73 42.2 14.82 48 24 48z' />
            </g>
          </svg>
        </span>
        {t('register.signUpWithGoogle')}
      </button>
      <div style={infoTextStyle}>{t('register.redirectInfo')}</div>
    </div>
  );
}
