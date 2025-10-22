import { faEnvelope, faEye, faEyeSlash, faKey, faLock, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { getServerSideTranslations as serverSideTranslations, useTranslation } from '../components/utils/CloudflareI18n';
import useAuth from '../hooks/useAuth';
import useIsMobile from '../hooks/useIsMobile';

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  };
}

const GoogleIcon = () => (
  <svg width='22' height='22' viewBox='0 0 48 48'>
    <g>
      <path fill='#4285F4' d='M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.86-6.86C36.64 2.69 30.74 0 24 0 14.82 0 6.73 5.8 2.69 14.09l7.98 6.2C12.41 13.41 17.74 9.5 24 9.5z' />
      <path fill='#34A853' d='M46.1 24.55c0-1.64-.15-3.22-.43-4.74H24v9.01h12.41c-.54 2.91-2.16 5.38-4.61 7.04l7.1 5.53C43.96 37.47 46.1 31.61 46.1 24.55z' />
      <path fill='#FBBC05' d='M10.67 28.29a14.5 14.5 0 0 1 0-8.58l-7.98-6.2A23.97 23.97 0 0 0 0 24c0 3.77.9 7.34 2.69 10.49l7.98-6.2z' />
      <path fill='#EA4335' d='M24 48c6.48 0 11.92-2.15 15.89-5.85l-7.1-5.53c-2 1.34-4.56 2.13-8.79 2.13-6.26 0-11.59-3.91-13.33-9.29l-7.98 6.2C6.73 42.2 14.82 48 24 48z' />
    </g>
  </svg>
);

const DiscordIcon = () => (
  <svg width='22' height='22' viewBox='0 0 24 24' fill='currentColor'>
    <path d='M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z' />
  </svg>
);

function LoginDesktop(props: any) {
  const { email, setEmail, password, setPassword, loginLoading, loginError, handleLogin, handleDiscord, handleGoogle, handlePasskeyLogin, passkeyLoading, passkeyError, showAuthenticatorModal, authenticatorCode, setAuthenticatorCode, authenticatorError, handleAuthenticatorSubmit, setShowAuthenticatorModal, setAuthenticatorError, setPendingUserId } = props;

  const { t } = useTranslation();
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className='glass-page-container'>
      <div className='glass-content-card max-w-md mx-auto'>
        <h1 className='text-4xl font-bold mb-8 text-center' style={{ color: 'var(--glass-text)' }}>
          <span className='glass-method get'>
            <FontAwesomeIcon icon={faSignInAlt} className='mr-3' />
            {t('login.title')}
          </span>
        </h1>

        <form className='space-y-6' onSubmit={handleLogin}>
          <div>
            <label className='block text-sm font-semibold mb-2' style={{ color: 'var(--glass-text)' }}>
              <FontAwesomeIcon icon={faEnvelope} className='mr-2 text-neon-blue' />
              {t('login.email')}
            </label>
            <input type='email' value={email} onChange={e => setEmail(e.target.value)} className='glass-input w-full p-3 rounded-xl' autoComplete='email' required />
          </div>

          <div>
            <label className='block text-sm font-semibold mb-2' style={{ color: 'var(--glass-text)' }}>
              <FontAwesomeIcon icon={faLock} className='mr-2 text-neon-purple' />
              {t('login.password')}
            </label>
            <div className='relative'>
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className='glass-input w-full p-3 rounded-xl pr-12' autoComplete='current-password' required />
              <button type='button' onClick={() => setShowPassword(!showPassword)} className='absolute right-3 top-1/2 transform -translate-y-1/2 text-glass-text-secondary hover:text-neon-blue transition-colors'>
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          <button type='submit' className='glass-button-neon w-full p-3 rounded-xl text-lg font-semibold' disabled={loginLoading}>
            {loginLoading ? (
              <div className='flex items-center justify-center'>
                <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></div>
                {t('login.loggingIn')}
              </div>
            ) : (
              <div className='flex items-center justify-center'>
                <FontAwesomeIcon icon={faSignInAlt} className='mr-2' />
                {t('login.login')}
              </div>
            )}
          </button>

          {loginError && (
            <div className='glass-card p-4 text-center' style={{ color: 'var(--neon-pink)' }}>
              {loginError}
            </div>
          )}
        </form>

        <div className='flex justify-between mt-6'>
          <Link href='/forgot-password' className='text-neon-blue hover:text-neon-purple transition-colors text-sm'>
            {t('login.forgotPassword')}
          </Link>
          <Link href='/register' className='text-neon-blue hover:text-neon-purple transition-colors text-sm'>
            {t('login.register')}
          </Link>
        </div>

        <div className='flex items-center my-8'>
          <div className='flex-1 h-px bg-glass-border'></div>
          <span className='px-4 text-sm' style={{ color: 'var(--glass-text-secondary)' }}>
            {t('login.or')}
          </span>
          <div className='flex-1 h-px bg-glass-border'></div>
        </div>

        <div className='space-y-4'>
          <button className='glass-button-neon w-full p-3 rounded-xl flex items-center justify-center gap-3 text-white' onClick={handleDiscord}>
            <DiscordIcon />
            {t('login.signInWithDiscord')}
          </button>

          <button className='glass-button w-full p-3 rounded-xl flex items-center justify-center gap-3 text-white border-2 border-glass-border hover:border-neon-blue transition-colors' onClick={handleGoogle}>
            <GoogleIcon />
            {t('login.signInWithGoogle')}
          </button>

          <button type='button' className='glass-card w-full p-3 rounded-xl flex items-center justify-center gap-3 text-white hover:bg-glass-accent transition-colors' onClick={handlePasskeyLogin} disabled={passkeyLoading}>
            {passkeyLoading ? (
              <div className='flex items-center justify-center'>
                <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></div>
                {t('login.authenticating')}
              </div>
            ) : (
              <div className='flex items-center justify-center'>
                <FontAwesomeIcon icon={faKey} className='mr-2' />
                {t('login.passkey')}
              </div>
            )}
          </button>

          {passkeyError && (
            <div className='glass-card p-3 text-center' style={{ color: 'var(--neon-pink)' }}>
              {passkeyError}
            </div>
          )}
        </div>

        {showAuthenticatorModal && (
          <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-50'>
            <div className='glass-card p-8 rounded-xl max-w-md w-full mx-4'>
              <h3 className='text-2xl font-bold mb-6 text-center' style={{ color: 'var(--glass-text)' }}>
                <FontAwesomeIcon icon={faKey} className='mr-3 text-neon-blue' />
                {t('login.enterAuthenticator')}
              </h3>
              <form onSubmit={handleAuthenticatorSubmit} className='space-y-4'>
                <div>
                  <label className='block text-sm font-semibold mb-2' style={{ color: 'var(--glass-text)' }}>
                    Code d'authentification
                  </label>
                  <input type='text' value={authenticatorCode} onChange={e => setAuthenticatorCode(e.target.value)} className='glass-input w-full p-3 rounded-xl' placeholder={t('login.codePlaceholder')} autoFocus required />
                </div>
                <button type='submit' className='glass-button-neon w-full p-3 rounded-xl text-lg font-semibold'>
                  <FontAwesomeIcon icon={faKey} className='mr-2' />
                  {t('login.verify')}
                </button>
                {authenticatorError && (
                  <div className='glass-card p-3 text-center' style={{ color: 'var(--neon-pink)' }}>
                    {t('login.authenticatorError')}
                  </div>
                )}
              </form>
              <button
                type='button'
                className='glass-button w-full p-3 rounded-xl mt-4'
                onClick={() => {
                  setShowAuthenticatorModal(false);
                  setAuthenticatorCode('');
                  setAuthenticatorError(null);
                  setPendingUserId(null);
                }}>
                {t('login.cancel')}
              </button>
            </div>
          </div>
        )}

        <div className='text-center mt-6 text-sm' style={{ color: 'var(--glass-text-secondary)' }}>
          {t('login.redirectInfo')}
        </div>
      </div>
    </div>
  );
}

function LoginMobile(props: any) {
  const { email, setEmail, password, setPassword, loginLoading, loginError, handleLogin, handleDiscord, handleGoogle, handlePasskeyLogin, passkeyLoading, passkeyError, showAuthenticatorModal, authenticatorCode, setAuthenticatorCode, authenticatorError, handleAuthenticatorSubmit, setShowAuthenticatorModal, setAuthenticatorError, setPendingUserId } = props;

  const { t } = useTranslation();
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className='glass-page-container px-4'>
      <div className='glass-content-card max-w-sm mx-auto'>
        <h1 className='text-3xl font-bold mb-6 text-center' style={{ color: 'var(--glass-text)' }}>
          <span className='glass-method get'>
            <FontAwesomeIcon icon={faSignInAlt} className='mr-2' />
            {t('login.title')}
          </span>
        </h1>

        <form className='space-y-4' onSubmit={handleLogin}>
          <div>
            <label className='block text-sm font-semibold mb-2' style={{ color: 'var(--glass-text)' }}>
              <FontAwesomeIcon icon={faEnvelope} className='mr-2 text-neon-blue' />
              {t('login.email')}
            </label>
            <input type='email' value={email} onChange={e => setEmail(e.target.value)} className='glass-input w-full p-3 rounded-xl' autoComplete='email' required />
          </div>

          <div>
            <label className='block text-sm font-semibold mb-2' style={{ color: 'var(--glass-text)' }}>
              <FontAwesomeIcon icon={faLock} className='mr-2 text-neon-purple' />
              {t('login.password')}
            </label>
            <div className='relative'>
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className='glass-input w-full p-3 rounded-xl pr-12' autoComplete='current-password' required />
              <button type='button' onClick={() => setShowPassword(!showPassword)} className='absolute right-3 top-1/2 transform -translate-y-1/2 text-glass-text-secondary hover:text-neon-blue transition-colors'>
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          <button type='submit' className='glass-button-neon w-full p-3 rounded-xl text-lg font-semibold' disabled={loginLoading}>
            {loginLoading ? (
              <div className='flex items-center justify-center'>
                <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></div>
                {t('login.loggingIn')}
              </div>
            ) : (
              <div className='flex items-center justify-center'>
                <FontAwesomeIcon icon={faSignInAlt} className='mr-2' />
                {t('login.login')}
              </div>
            )}
          </button>

          {loginError && (
            <div className='glass-card p-3 text-center' style={{ color: 'var(--neon-pink)' }}>
              {loginError}
            </div>
          )}
        </form>

        <div className='flex justify-between mt-4'>
          <Link href='/forgot-password' className='text-neon-blue hover:text-neon-purple transition-colors text-sm'>
            {t('login.forgotPassword')}
          </Link>
          <Link href='/register' className='text-neon-blue hover:text-neon-purple transition-colors text-sm'>
            {t('login.register')}
          </Link>
        </div>

        <div className='flex items-center my-6'>
          <div className='flex-1 h-px bg-glass-border'></div>
          <span className='px-4 text-sm' style={{ color: 'var(--glass-text-secondary)' }}>
            {t('login.or')}
          </span>
          <div className='flex-1 h-px bg-glass-border'></div>
        </div>

        <div className='space-y-3'>
          <button className='glass-button-neon w-full p-3 rounded-xl flex items-center justify-center gap-3 text-white' onClick={handleDiscord}>
            <DiscordIcon />
            {t('login.signInWithDiscord')}
          </button>

          <button className='glass-button w-full p-3 rounded-xl flex items-center justify-center gap-3 text-white border-2 border-glass-border hover:border-neon-blue transition-colors' onClick={handleGoogle}>
            <GoogleIcon />
            {t('login.signInWithGoogle')}
          </button>

          <button type='button' className='glass-card w-full p-3 rounded-xl flex items-center justify-center gap-3 text-white hover:bg-glass-accent transition-colors' onClick={handlePasskeyLogin} disabled={passkeyLoading}>
            {passkeyLoading ? (
              <div className='flex items-center justify-center'>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></div>
                {t('login.authenticating')}
              </div>
            ) : (
              <div className='flex items-center justify-center'>
                <FontAwesomeIcon icon={faKey} className='mr-2' />
                {t('login.passkey')}
              </div>
            )}
          </button>

          {passkeyError && (
            <div className='glass-card p-3 text-center' style={{ color: 'var(--neon-pink)' }}>
              {passkeyError}
            </div>
          )}
        </div>

        {showAuthenticatorModal && (
          <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-50'>
            <div className='glass-card p-6 rounded-xl max-w-sm w-full mx-4'>
              <h3 className='text-xl font-bold mb-4 text-center' style={{ color: 'var(--glass-text)' }}>
                <FontAwesomeIcon icon={faKey} className='mr-2 text-neon-blue' />
                {t('login.enterAuthenticator')}
              </h3>
              <form onSubmit={handleAuthenticatorSubmit} className='space-y-4'>
                <div>
                  <label className='block text-sm font-semibold mb-2' style={{ color: 'var(--glass-text)' }}>
                    Code d'authentification
                  </label>
                  <input type='text' value={authenticatorCode} onChange={e => setAuthenticatorCode(e.target.value)} className='glass-input w-full p-3 rounded-xl' placeholder={t('login.codePlaceholder')} autoFocus required />
                </div>
                <button type='submit' className='glass-button-neon w-full p-3 rounded-xl text-lg font-semibold'>
                  <FontAwesomeIcon icon={faKey} className='mr-2' />
                  {t('login.verify')}
                </button>
                {authenticatorError && (
                  <div className='glass-card p-3 text-center' style={{ color: 'var(--neon-pink)' }}>
                    {t('login.authenticatorError')}
                  </div>
                )}
              </form>
              <button
                type='button'
                className='glass-button w-full p-3 rounded-xl mt-4'
                onClick={() => {
                  setShowAuthenticatorModal(false);
                  setAuthenticatorCode('');
                  setAuthenticatorError(null);
                  setPendingUserId(null);
                }}>
                {t('login.cancel')}
              </button>
            </div>
          </div>
        )}

        <div className='text-center mt-4 text-sm' style={{ color: 'var(--glass-text-secondary)' }}>
          {t('login.redirectInfo')}
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const isMobile = useIsMobile();
  const { user, loading, token } = useAuth();
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loginLoading, setLoginLoading] = React.useState(false);
  const [loginError, setLoginError] = React.useState<string | null>(null);

  const [passkeyLoading, setPasskeyLoading] = React.useState(false);
  const [passkeyError, setPasskeyError] = React.useState<string | null>(null);
  const [showAuthenticatorModal, setShowAuthenticatorModal] = React.useState(false);
  const [authenticatorCode, setAuthenticatorCode] = React.useState('');
  const [authenticatorError, setAuthenticatorError] = React.useState<string | null>(null);
  const [pendingUserId, setPendingUserId] = React.useState<string | null>(null);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      if (data.token) {
        document.cookie = `token=${data.token}; path=/; max-age=31536000`;
        location.href = '/';
      } else if (data.user) {
        setPendingUserId(data.user.userId || data.user.user_id);
        setShowAuthenticatorModal(true);
      }
    } catch (e: any) {
      setLoginError(e.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handlePasskeyLogin = async () => {
    setPasskeyLoading(true);
    setPasskeyError(null);
    try {
      const res = await fetch('/api/webauthn/authenticate/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error('Failed to get authentication options');
      const options = await res.json();

      const challengeBuffer = Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0));
      options.challenge = challengeBuffer;

      if (options.allowCredentials) {
        options.allowCredentials = options.allowCredentials.map((cred: any) => ({
          ...cred,
          id: Uint8Array.from(atob(cred.id), c => c.charCodeAt(0)),
        }));
      }

      const assertion = await navigator.credentials.get({ publicKey: options });
      if (!assertion) throw new Error('Passkey authentication failed');

      const parsedCredential = {
        id: assertion.id,
      };
      console.log('Parsed credential:', assertion);

      const verifyRes = await fetch('/api/webauthn/authenticate/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: parsedCredential }),
      });
      const data = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(data.message || 'Passkey login failed');
      document.cookie = `token=${data.token}; path=/; max-age=31536000`;
      location.href = '/';
    } catch (e: any) {
      setPasskeyError(e.message);
      console.error('Passkey login error:', e);
    } finally {
      setPasskeyLoading(false);
    }
  };

  const handleAuthenticatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthenticatorError(null);
    if (!pendingUserId) return;
    try {
      const res = await fetch('/api/authenticator/verifyKey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: pendingUserId,
          code: authenticatorCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid code');
      if (data.token) {
        document.cookie = `token=${data.token}; path=/; max-age=31536000`;
        location.href = '/';
      } else {
        throw new Error('Unexpected response');
      }
    } catch (err: any) {
      setAuthenticatorError(err.message);
    }
  };

  const props = {
    email,
    setEmail,
    password,
    setPassword,
    loginLoading,
    loginError,
    handleLogin,
    handleDiscord,
    handleGoogle,
    handlePasskeyLogin,
    passkeyLoading,
    passkeyError,
    showAuthenticatorModal,
    authenticatorCode,
    setAuthenticatorCode,
    authenticatorError,
    handleAuthenticatorSubmit,
    setShowAuthenticatorModal,
    setAuthenticatorError,
    setPendingUserId,
  };

  return isMobile ? <LoginMobile {...props} /> : <LoginDesktop {...props} />;
}
