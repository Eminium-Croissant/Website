import { Trans, useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
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
// Style constants (reuse from your register page for consistency)
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

export default function ResetPassword() {
  const { t } = useTranslation('common');
  const isMobile = useIsMobile();
  const router = useRouter();
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<{ username: string } | null>(null);
  const [tokenChecked, setTokenChecked] = React.useState(false);

  // Read token from query params
  const resetToken = typeof router.query.token === 'string' ? router.query.token : '';

  // Validate token on mount
  React.useEffect(() => {
    if (!resetToken) {
      setError('Invalid reset token, please try again.');
      setTokenChecked(true);
      return;
    }
    // Validate token with backend
    fetch(`/api/users/validate-reset-token?reset_token=${encodeURIComponent(resetToken)}`)
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Invalid reset token, please try again.');
        setUser(data.user);
        setError(null);
      })
      .catch(() => {
        setError('Invalid reset token, please try again.');
        setUser(null);
      })
      .finally(() => setTokenChecked(true));
  }, [resetToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!resetToken) {
      setError('Invalid or missing reset token.');
      return;
    }
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reset_token: resetToken,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reset password');
      // setSuccess("Password has been reset. You can now log in.");
      const token = data.token;
      document.cookie = `token=${token}; path=/; max-age=31536000`;
      location.href = '/';
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (isMobile) {
    return (
      <div className='container' style={containerMobileStyle}>
        <h2 style={titleMobileStyle}>{t('resetPassword.title')}</h2>
        {tokenChecked && error && <div style={{ color: '#ff5252', marginBottom: 12 }}>{error === 'Invalid reset token, please try again.' ? t('resetPassword.error.invalidToken') : error === 'Invalid or missing reset token.' ? t('resetPassword.error.missingToken') : error === 'Please fill in all fields.' ? t('resetPassword.error.allFields') : error === 'Passwords do not match.' ? t('resetPassword.error.passwords') : error}</div>}
        {tokenChecked && !error && user && (
          <div style={{ color: '#4caf50', marginBottom: 12 }}>
            <Trans i18nKey='resetPassword.welcome' values={{ username: user.username }} />
            <form style={{ width: '280px', maxWidth: 280 }} onSubmit={handleSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontWeight: 600, marginBottom: 4, display: 'block' }}>{t('resetPassword.newPassword')}</label>
                <input
                  type='password'
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  style={{
                    width: '260px',
                    padding: '9px 10px',
                    borderRadius: 6,
                    border: '1px solid #444',
                    background: '#18181c',
                    color: '#fff',
                    fontSize: 15,
                  }}
                  autoComplete='new-password'
                  required
                  disabled={!!error}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontWeight: 600, marginBottom: 4, display: 'block' }}>{t('resetPassword.confirmPassword')}</label>
                <input
                  type='password'
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  style={{
                    width: '260px',
                    padding: '9px 10px',
                    borderRadius: 6,
                    border: '1px solid #444',
                    background: '#18181c',
                    color: '#fff',
                    fontSize: 15,
                  }}
                  autoComplete='new-password'
                  required
                  disabled={!!error}
                />
              </div>
              <button
                type='submit'
                style={{
                  width: '280px',
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
                disabled={loading || !!error}
              >
                {loading ? t('resetPassword.resetting') : t('resetPassword.reset')}
              </button>
              {success && <div style={{ color: '#4caf50', marginTop: 10 }}>{t('resetPassword.success')}</div>}
            </form>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className='container' style={containerStyle}>
      <h2 style={titleStyle}>{t('resetPassword.title')}</h2>
      {tokenChecked && error && <div style={{ color: '#ff5252', marginBottom: 16 }}>{error === 'Invalid reset token, please try again.' ? t('resetPassword.error.invalidToken') : error === 'Invalid or missing reset token.' ? t('resetPassword.error.missingToken') : error === 'Please fill in all fields.' ? t('resetPassword.error.allFields') : error === 'Passwords do not match.' ? t('resetPassword.error.passwords') : error}</div>}
      {tokenChecked && !error && user && (
        <div style={{ color: '#4caf50', marginBottom: 16 }}>
          <Trans i18nKey='resetPassword.welcome' values={{ username: user.username }} />
          <form style={{ width: '300px', maxWidth: 340 }} onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600, marginBottom: 6, display: 'block' }}>{t('resetPassword.newPassword')}</label>
              <input
                type='password'
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                style={{
                  width: '280px',
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: '1px solid #444',
                  background: '#18181c',
                  color: '#fff',
                  fontSize: 16,
                }}
                autoComplete='new-password'
                required
                disabled={!!error}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600, marginBottom: 6, display: 'block' }}>{t('resetPassword.confirmPassword')}</label>
              <input
                type='password'
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                style={{
                  width: '280px',
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: '1px solid #444',
                  background: '#18181c',
                  color: '#fff',
                  fontSize: 16,
                }}
                autoComplete='new-password'
                required
                disabled={!!error}
              />
            </div>
            <button
              type='submit'
              style={{
                width: '300px',
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
              disabled={loading || !!error}
            >
              {loading ? t('resetPassword.resetting') : t('resetPassword.reset')}
            </button>
            {success && <div style={{ color: '#4caf50', marginTop: 12 }}>{t('resetPassword.success')}</div>}
          </form>
        </div>
      )}
    </div>
  );
}
