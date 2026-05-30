import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import CachedImage from '../components/utils/CachedImage';
import { getServerSideTranslations as serverSideTranslations, useTranslation } from '../components/utils/CloudflareI18n';
import useAuth from '../hooks/useAuth';
import useIsMobile from '../hooks/useIsMobile';

interface User {
  id: string;
  username: string;
  email?: string;
  verified: boolean;
  steam_id?: string;
  discord_id?: string;
  google_id?: string;
  isStudio?: boolean;
  haveAuthenticator?: boolean;
}

interface AuthenticatorKeyResponse {
  key: string;
  qrCode: string;
}

interface ApiErrorResponse {
  message: string;
}

interface ApiSuccessResponse {
  message: string;
}

interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface WebAuthnCredential {
  id: string;
  rawId: string;
  type: string;
  response: {
    attestationObject: string;
    clientDataJSON: string;
  };
  clientExtensionResults: any;
}

interface WebAuthnOptions {
  challenge: Uint8Array | string;
  rp: { name: string; id?: string };
  user: {
    id: Uint8Array | string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: Array<{ type: string; alg: number }>;
  authenticatorSelection?: {
    residentKey?: string;
    userVerification?: string;
  };
  requireResidentKey?: boolean;
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  };
}

const modalLabelStyle: React.CSSProperties = {
  fontWeight: 600,
  marginBottom: 6,
  color: 'var(--glass-text)',
  fontSize: '14px',
};

const modalInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 6,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.05)',
  color: '#fff',
  marginBottom: 12,
  fontSize: 14,
};

const modalButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  background: 'linear-gradient(135deg, rgba(74, 158, 255, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
  color: '#fff',
  border: '1px solid rgba(74, 158, 255, 0.3)',
  borderRadius: 8,
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: 8,
};

const steamBtnStyleDef: React.CSSProperties = {
  height: '48px',
  background: 'linear-gradient(90deg, #1b2838 60%, #171a21 100%)',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  padding: '0 24px',
};

function ChangePasswordModal({ 
  open, 
  onClose, 
  onSubmit, 
  loading, 
  error, 
  success 
}: { 
  open: boolean; 
  onClose: () => void; 
  onSubmit: (data: ChangePasswordData) => void; 
  loading: boolean; 
  error: string | null; 
  success: string | null 
}) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  useEffect(() => {
    if (open) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [open]);
  if (!open) return null;
  return (
    <div className='shop-prompt-overlay'>
      <div className='shop-prompt'>
        <div className='shop-prompt-message'>Change password</div>
        <form
          onSubmit={e => {
            e.preventDefault();
            onSubmit({ oldPassword, newPassword, confirmPassword });
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            alignItems: 'stretch',
            marginBottom: 8,
          }}>
          <label style={modalLabelStyle}>Current password</label>
          <input type='password' style={{ ...modalInputStyle, marginBottom: 0, width: '256px' }} placeholder='Enter current password' value={oldPassword} onChange={e => setOldPassword(e.target.value)} autoComplete='current-password' required />
          <label style={modalLabelStyle}>New password</label>
          <input type='password' style={{ ...modalInputStyle, marginBottom: 0, width: '256px' }} placeholder='Enter new password' value={newPassword} onChange={e => setNewPassword(e.target.value)} autoComplete='new-password' required />
          <label style={modalLabelStyle}>Confirm new password</label>
          <input type='password' style={{ ...modalInputStyle, marginBottom: 0, width: '256px' }} placeholder='Confirm new password' value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete='new-password' required />
          <button className='shop-prompt-buy-btn' type='submit' disabled={loading} style={{ width: '280px', padding: '8px 18px' }}>
            {loading ? 'Saving...' : 'Change'}
          </button>
          <button className='shop-prompt-cancel-btn' type='button' onClick={onClose} style={{ width: '280px', padding: '8px 18px' }}>
            Cancel
          </button>
          {success && <div style={{ color: '#4caf50', marginTop: 8 }}>{success}</div>}
          {error && <div style={{ color: '#ff5252', marginTop: 8 }}>{error}</div>}
        </form>
      </div>
    </div>
  );
}

function GoogleAuthenticatorSetupModal({ 
  open, 
  onClose, 
  user 
}: { 
  open: boolean; 
  onClose: (success: boolean) => void; 
  user: User | null 
}) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'generate' | 'validate'>('generate');
  const [key, setKey] = useState<any>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setStep('generate');
      setKey(null);
      setQrCode(null);
      setPasscode('');
      setError(null);
      setSuccess(null);
    }
  }, [open]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/authenticator/generateKey', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data as ApiErrorResponse).message || 'Failed to generate key');
      const keyResponse = data as AuthenticatorKeyResponse;
      setKey(keyResponse.key);
      setQrCode(keyResponse.qrCode);
      setStep('validate');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/authenticator/registerKey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, passcode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data as ApiErrorResponse).message || 'Failed to validate key');
      setSuccess('Google Authenticator setup complete!');
      setStep('generate');
      user.haveAuthenticator = true;
      onClose(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className='shop-prompt-overlay'>
      <div className='shop-prompt'>
        <div className='shop-prompt-message'>Setup Google Authenticator</div>
        {step === 'generate' ? (
          <button style={{ ...modalButtonStyle, width: '100%' }} onClick={handleGenerate} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Key & QR Code'}
          </button>
        ) : (
          <>
            {qrCode && (
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <CachedImage src={qrCode} alt='QR Code' style={{ width: 180, height: 180 }} />
                <div style={{ fontSize: 14, marginTop: 8 }}>Scan with Google Authenticator</div>
              </div>
            )}
            <form
              onSubmit={handleValidate}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}>
              <label style={modalLabelStyle}>Enter passcode from app</label>
              <input type='text' style={modalInputStyle} value={passcode} onChange={e => setPasscode(e.target.value)} placeholder='123456' required maxLength={6} pattern='\d{6}' />
              <button type='submit' style={{ ...modalButtonStyle, width: '100%' }} disabled={loading}>
                {loading ? 'Validating...' : 'Validate'}
              </button>
              <button
                type='button'
                style={{
                  ...modalButtonStyle,
                  width: '100%',
                  background: '#444',
                }}
                onClick={() => {
                  onClose(false);
                }}>
                Cancel
              </button>
            </form>
          </>
        )}
        {error && <div style={{ color: '#ff5252', marginTop: 8 }}>{error}</div>}
        {success && <div style={{ color: '#4caf50', marginTop: 8 }}>{success}</div>}
      </div>
    </div>
  );
}

function SecurityModal({ open, onClose, user, setUser, passkeyLoading, passkeySuccess, passkeyError, handleRegisterPasskey, setShowGoogleAuthModal, success, error, setError, router, linkText }: any) {
  const { t } = useTranslation();
  if (!open) return null;
  return (
    <div className='shop-prompt-overlay'>
      <div className='shop-prompt'>
        <div className='shop-prompt-message'>{t('title')}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!user?.steam_id ? (
            <button style={steamBtnStyleDef} onClick={() => router.push('/api/auth/steam')} disabled={user?.isStudio}>
              <span className='fab fa-steam' style={{ fontSize: '22px' }} />
              {linkText}
            </button>
          ) : (
            <button
              style={steamBtnStyleDef}
              onClick={async () => {
                if (confirm('Are you sure you want to unlink your Steam account?')) {
                  try {
                    const res = await fetch('/api/users/unlink-steam', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                    });
                    if (!res.ok) throw new Error('Failed to unlink Steam account');
                    setUser({
                      ...user,
                      steam_id: null,
                      steam_username: null,
                      steam_avatar_url: null,
                    });
                  } catch (err: any) {
                    setError(err.message);
                  }
                }
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <CachedImage src={user?.steam_avatar_url} alt='Steam Avatar' style={{ width: 32, height: 32, borderRadius: '20%' }} />
                <span>
                  Linked as <b>{user?.steam_username}</b>
                </span>
              </div>
            </button>
          )}

          {!user?.discord_id ? (
            <button
              onClick={() => router.push('/auth/discord')}
              className='glass-button-neon w-full flex items-center justify-center gap-3'
              style={{
                background: 'linear-gradient(90deg, #5865F2 60%, #404EED 100%)',
              }}>
              <i className='fab fa-discord text-xl' />
              {t('settings.linkDiscord')}
            </button>
          ) : (
            <button
              disabled
              className='glass-button-neon w-full flex items-center justify-center gap-3 opacity-70'
              style={{
                background: 'linear-gradient(90deg, #5865F2 60%, #404EED 100%)',
              }}>
              <i className='fab fa-discord text-xl' />
              {t('settings.discordLinked')}
            </button>
          )}

          {!user?.google_id ? (
            <button
              onClick={() => router.push('/auth/google')}
              className='glass-button w-full flex items-center justify-center gap-3'
              style={{
                background: '#fff',
                color: '#222',
                border: '1px solid #e0e0e0',
              }}>
              <svg width='20' height='20' viewBox='0 0 48 48'>
                <g>
                  <path fill='#4285F4' d='M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.86-6.86C36.64 2.69 30.74 0 24 0 14.82 0 6.73 5.8 2.69 14.09l7.98 6.2C12.41 13.41 17.74 9.5 24 9.5z' />
                  <path fill='#34A853' d='M46.1 24.55c0-1.64-.15-3.22-.43-4.74H24v9.01h12.41c-.54 2.91-2.16 5.38-4.61 7.04l7.1 5.53C43.96 37.47 46.1 31.61 46.1 24.55z' />
                  <path fill='#FBBC05' d='M10.67 28.29a14.5 14.5 0 0 1 0-8.58l-7.98-6.2A23.97 23.97 0 0 0 0 24c0 3.77.9 7.34 2.69 10.49l7.98-6.2z' />
                  <path fill='#EA4335' d='M24 48c6.48 0 11.92-2.15 15.89-5.85l-7.1-5.53c-2 1.34-4.56 2.13-8.79 2.13-6.26 0-11.59-3.91-13.33-9.29l-7.98 6.2C6.73 42.2 14.82 48 24 48z' />
                </g>
              </svg>
              {t('settings.googleLinked')}
            </button>
          ) : (
            <button
              disabled
              className='glass-button w-full flex items-center justify-center gap-3 opacity-70'
              style={{
                background: '#fff',
                color: '#222',
                border: '1px solid #e0e0e0',
              }}>
              <svg width='20' height='20' viewBox='0 0 48 48'>
                <g>
                  <path fill='#4285F4' d='M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.86-6.86C36.64 2.69 30.74 0 24 0 14.82 0 6.73 5.8 2.69 14.09l7.98 6.2C12.41 13.41 17.74 9.5 24 9.5z' />
                  <path fill='#34A853' d='M46.1 24.55c0-1.64-.15-3.22-.43-4.74H24v9.01h12.41c-.54 2.91-2.16 5.38-4.61 7.04l7.1 5.53C43.96 37.47 46.1 31.61 46.1 24.55z' />
                  <path fill='#FBBC05' d='M10.67 28.29a14.5 14.5 0 0 1 0-8.58l-7.98-6.2A23.97 23.97 0 0 0 0 24c0 3.77.9 7.34 2.69 10.49l7.98-6.2z' />
                  <path fill='#EA4335' d='M24 48c6.48 0 11.92-2.15 15.89-5.85l-7.1-5.53c-2 1.34-4.56 2.13-8.79 2.13-6.26 0-11.59-3.91-13.33-9.29l-7.98 6.2C6.73 42.2 14.82 48 24 48z' />
                </g>
              </svg>
              {t('settings.linkGoogle')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function useSettingsLogic() {
  const { user, token, setUser } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState(user?.email || '');
  const [username, setUsername] = useState(user?.username || '');
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameSuccess, setUsernameSuccess] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const [showApiKey, setShowApiKey] = useState(false);
  const [avatar, setAvatar] = useState(user?.id ? `/avatar/${user.id}` : '/avatar/default.avif');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [linkText, setLinkText] = useState(t('settings.linkSteam'));
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeySuccess, setPasskeySuccess] = useState<string | null>(null);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [showGoogleAuthModal, setShowGoogleAuthModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  useEffect(() => {
    if (typeof document !== 'undefined' && document.cookie.includes('from=app')) setLinkText('Go on website to link');
    else setLinkText(!user?.isStudio ? t('settings.linkSteam') : "Studio can't link Steam");
  }, [user, linkText]);

  useEffect(() => {
    if (typeof document == 'undefined') return;
    setTimeout(() => {
      if (document.querySelector("img[alt='Profile']")?.getAttribute('src')?.includes('default.avif')) {
        router.push('/login');
      }
    }, 2000);
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setAvatarFile(file);
    setAvatar(URL.createObjectURL(file));
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      const res = await fetch('/upload/avatar', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to upload avatar');
      setSuccess('Profile picture updated!');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setUsernameError(null);
    setUsernameSuccess(null);
  };

  const handleUsernameSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameLoading(true);
    setUsernameError(null);
    setUsernameSuccess(null);
    try {
      const res = await fetch('/api/users/change-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data as ApiErrorResponse).message || 'Failed to update username');
      setUsernameSuccess('Username updated!');
      if (setUser) setUser({ ...user, username });
    } catch (e: any) {
      setUsernameError(e.message);
    } finally {
      setUsernameLoading(false);
    }
  };

  const handlePasswordChange = async ({ oldPassword, newPassword, confirmPassword }: ChangePasswordData) => {
    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(null);
    try {
      if (!newPassword || !confirmPassword) {
        throw new Error('Please fill all password fields.');
      }
      if (newPassword !== confirmPassword) {
        throw new Error('New password and confirmation do not match.');
      }
      const res = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data as ApiErrorResponse).message || 'Error changing password');
      setPasswordSuccess('Password updated!');
      setShowPasswordModal(false);
    } catch (e: any) {
      setPasswordError(e.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleRegisterPasskey = async () => {
    setPasskeyLoading(true);
    setPasskeyError(null);
    setPasskeySuccess(null);
    try {
      const res = await fetch('/api/webauthn/register/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          username: user?.username,
          email: user?.email,
        }),
      });
      if (!res.ok) throw new Error('Failed to get registration options');
      const options: any = await res.json();

      if (!options.authenticatorSelection) {
        options.authenticatorSelection = {
          residentKey: 'required',
          userVerification: 'required',
        };
      }

      options.requireResidentKey = true;

      if (typeof options.challenge === 'string') {
        options.challenge = Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0));
      }
      if (typeof options.user.id === 'string') {
        options.user.id = Uint8Array.from(atob(options.user.id), c => c.charCodeAt(0));
      }
      if (!options.user.name) {
        options.user.name = user?.email || user?.username || 'user';
      }
      if (!options.user.displayName) {
        options.user.displayName = user?.username || user?.email || 'User';
      }
      try {
        const cred = await navigator.credentials.create({ publicKey: options });
        if (!cred) throw new Error('Passkey creation failed');

        const bufferToBase64url = (buf: ArrayBuffer): string => {
          const str = btoa(String.fromCharCode(...new Uint8Array(buf)));
          return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        };

        const publicKeyCred = cred as PublicKeyCredential;
        const credential = {
          id: publicKeyCred.id,
          rawId: bufferToBase64url(publicKeyCred.rawId),
          type: publicKeyCred.type,
          response: {
            attestationObject: bufferToBase64url((publicKeyCred.response as AuthenticatorAttestationResponse).attestationObject),
            clientDataJSON: bufferToBase64url((publicKeyCred.response as AuthenticatorAttestationResponse).clientDataJSON),
          },
          clientExtensionResults: publicKeyCred.getClientExtensionResults(),
        };

        const verifyRes = await fetch('/api/webauthn/register/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential, userId: user?.id }),
        });
        if (!verifyRes.ok) throw new Error('Failed to register passkey');
        setPasskeySuccess('Passkey registered!');
      } catch (err) {
        console.error('Passkey registration error:', err);
        throw new Error('Passkey registration failed');
      }
    } catch (e: any) {
      setPasskeyError(e.message);
    } finally {
      setPasskeyLoading(false);
    }
  };

  return {
    user,
    token,
    setUser,
    email,
    setEmail,
    username,
    setUsername,
    usernameLoading,
    usernameSuccess,
    usernameError,
    showApiKey,
    setShowApiKey,
    avatar,
    setAvatar,
    avatarFile,
    setAvatarFile,
    loading,
    setLoading,
    success,
    setSuccess,
    error,
    setError,
    fileInputRef,
    linkText,
    setLinkText,
    showPasswordModal,
    setShowPasswordModal,
    passwordLoading,
    passwordSuccess,
    passwordError,
    handleAvatarChange,
    handleAvatarUpload,
    handleUsernameChange,
    handleUsernameSave,
    handlePasswordChange,
    passkeyLoading,
    passkeySuccess,
    passkeyError,
    handleRegisterPasskey,
    showGoogleAuthModal,
    setShowGoogleAuthModal,
    showSecurityModal,
    setShowSecurityModal,
    router,
  };
}

function LanguageSelector() {
  const { t, locale, changeLocale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const availableLanguages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
    { code: 'ko', label: '한국어', flag: '🇰🇷' },
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  ];

  const currentLanguage = availableLanguages.find(lang => lang.code === locale) || availableLanguages[0];

  const handleToggleOpen = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
    setIsOpen(!isOpen);
  };

  const handleLanguageChange = (langCode: string) => {
    changeLocale(langCode);
    setIsOpen(false);
  };

  return (
    <>
      <div className='mb-6'>
        <button 
          ref={buttonRef}
          onClick={handleToggleOpen}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-glass-accent border border-glass-border text-glass-text hover:bg-glass-secondary transition-all duration-200 w-full justify-between"
          style={{
            minWidth: 120,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{currentLanguage.label}</span>
          </div>
          <span className="text-xs text-gray-400">{isOpen ? '▲' : '▼'}</span>
        </button>
      </div>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div 
            className="fixed rounded-lg shadow-lg max-h-64 overflow-y-auto"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
              background: '#222',
              border: '1px solid rgba(255,255,255,0.1)',
              zIndex: 9999,
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            }}
          >
            {availableLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-opacity-10 hover:bg-white transition-colors duration-200 ${
                  language.code === locale ? 'bg-opacity-10 bg-white border-l-2 border-l-blue-400' : ''
                }`}
                style={{
                  color: '#fff',
                }}
              >
                <div>
                  <div className="text-sm font-medium">{language.label}</div>
                  <div className="text-xs text-gray-400">{language.code.toUpperCase()}</div>
                </div>
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </>
  );
}

function SettingsDesktop(props: ReturnType<typeof useSettingsLogic>) {
  const { user, setUser, apiKey } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState(user?.username || '');
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameSuccess, setUsernameSuccess] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const [showApiKey, setShowApiKey] = useState(false);
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setUsernameError(null);
    setUsernameSuccess(null);
  };

  const handleUsernameSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameLoading(true);
    setUsernameError(null);
    setUsernameSuccess(null);
    try {
      const res = await fetch('/api/users/change-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
      const data = await res.json() as ApiErrorResponse;
      if (!res.ok) throw new Error(data.message || 'Failed to update username');
      setUsernameSuccess('Username updated!');
      if (setUser) setUser({ ...user, username });
    } catch (e: any) {
      setUsernameError(e.message);
    } finally {
      setUsernameLoading(false);
    }
  };
  const [avatar, setAvatar] = useState(user?.id ? `/avatar/${user.id}` : '/avatar/default.avif');
  const { t } = useTranslation();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [linkText, setLinkText] = useState(t('settings.linkSteam'));
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeySuccess, setPasskeySuccess] = useState<string | null>(null);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [showGoogleAuthModal, setShowGoogleAuthModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  useEffect(() => {
    if (typeof document == 'undefined') return;
    setTimeout(() => {
      if (document.querySelector("img[alt='Profile']")?.getAttribute('src')?.includes('default.avif')) {
        console.log('Default avatar detected, setting to user avatar');
        router.push('/login');
      }
    }, 2000);
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setAvatarFile(file);
    setAvatar(URL.createObjectURL(file));
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      const res = await fetch('/upload/avatar', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to upload avatar');
      setSuccess('Profile picture updated!');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async ({ oldPassword, newPassword, confirmPassword }: { oldPassword: string; newPassword: string; confirmPassword: string }) => {
    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(null);
    try {
      if (!newPassword || !confirmPassword) {
        throw new Error('Veuillez remplir tous les champs de mot de passe.');
      }
      if (newPassword !== confirmPassword) {
        throw new Error('Le nouveau mot de passe et la confirmation ne correspondent pas.');
      }
      const res = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
      });
      const data = await res.json() as ApiErrorResponse;
      if (!res.ok) throw new Error(data.message || 'Erreur lors du changement de mot de passe');
      setPasswordSuccess('Mot de passe mis à jour !');
      setShowPasswordModal(false);
    } catch (e: any) {
      setPasswordError(e.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleRegisterPasskey = async () => {
    setPasskeyLoading(true);
    setPasskeyError(null);
    setPasskeySuccess(null);
    try {
      const res = await fetch('/api/webauthn/register/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          username: user?.username,
          email: user?.email,
        }),
      });
      if (!res.ok) throw new Error('Failed to get registration options');
      const options: any = await res.json();

      if (!options.authenticatorSelection) {
        options.authenticatorSelection = {
          residentKey: 'required',
          userVerification: 'required',
        };
      }

      options.requireResidentKey = true;

      if (typeof options.challenge === 'string') {
        options.challenge = Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0));
      }
      if (typeof options.user.id === 'string') {
        options.user.id = Uint8Array.from(atob(options.user.id), c => c.charCodeAt(0));
      }
      if (!options.user.name) {
        options.user.name = user?.email || user?.username || 'user';
      }
      if (!options.user.displayName) {
        options.user.displayName = user?.username || user?.email || 'User';
      }
      try {
        const cred = await navigator.credentials.create({ publicKey: options });
        if (!cred) throw new Error('Passkey creation failed');

        const bufferToBase64url = (buf: ArrayBuffer): string => {
          const str = btoa(String.fromCharCode(...new Uint8Array(buf)));
          return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        };

        const publicKeyCred = cred as PublicKeyCredential;
        const credential = {
          id: publicKeyCred.id,
          rawId: bufferToBase64url(publicKeyCred.rawId),
          type: publicKeyCred.type,
          response: {
            attestationObject: bufferToBase64url((publicKeyCred.response as AuthenticatorAttestationResponse).attestationObject),
            clientDataJSON: bufferToBase64url((publicKeyCred.response as AuthenticatorAttestationResponse).clientDataJSON),
          },
          clientExtensionResults: publicKeyCred.getClientExtensionResults(),
        };

        const verifyRes = await fetch('/api/webauthn/register/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential, userId: user?.id }),
        });
        if (!verifyRes.ok) throw new Error('Failed to register passkey');
        setPasskeySuccess('Passkey registered!');
      } catch (err) {
        console.error('Passkey registration error:', err);
        throw new Error('Passkey registration failed');
      }
    } catch (e: any) {
      setPasskeyError(e.message);
    } finally {
      setPasskeyLoading(false);
    }
  };

  return (
    <div className='min-h-screen glass-bg-gradient'>
      <div className='glass-page-container py-12'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          <div className='glass-content-card'>
            <h2 className='glass-title text-2xl mb-6'>{t('settings.profile')}</h2>
            <div className='flex flex-col items-center mb-8'>
              <CachedImage
                src={avatar}
                alt='Profile'
                width={132}
                height={132}
                style={{
                  width: 132,
                  height: 132,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  marginBottom: 16,
                  border: '2px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                }}
                onClick={() => fileInputRef.current?.click()}
              />
              <input type='file' ref={fileInputRef} onChange={handleAvatarChange} accept='image/*' style={{ display: 'none' }} />
              <button onClick={() => fileInputRef.current?.click()} className='glass-button-neon w-full mb-3'>
                {t('settings.choosePicture')}
              </button>
              {avatarFile && (
                <button onClick={handleAvatarUpload} disabled={loading} className='glass-button-green w-full'>
                  {loading ? t('settings.uploading') : t('settings.uploadNewPicture')}
                </button>
              )}
              {success && <p className='text-green-400 text-sm mt-3 text-center'>{success}</p>}
              {error && <p className='text-red-400 text-sm mt-3 text-center'>{error}</p>}
            </div>

            <form onSubmit={handleUsernameSave} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-glass-text-secondary mb-2'>{t('settings.username')}</label>
                <input type='text' value={username} onChange={handleUsernameChange} className='glass-input' disabled={usernameLoading} minLength={3} maxLength={32} required />
              </div>
              <button type='submit' disabled={usernameLoading} className='glass-button-neon w-full'>
                {usernameLoading ? t('settings.saving') : t('settings.save')}
              </button>
              {usernameSuccess && <p className='text-green-400 text-sm text-center'>{usernameSuccess}</p>}
              {usernameError && <p className='text-red-400 text-sm text-center'>{usernameError}</p>}
            </form>
          </div>

          <div className='glass-content-card'>
            <h2 className='glass-title text-2xl mb-6'>{t('settings.security')}</h2>
            <div className='space-y-4'>
              {!user?.isStudio && (
                <button onClick={() => setShowPasswordModal(true)} className='glass-button-neon w-full'>
                  <i className='fas fa-key mr-2' />
                  {t('settings.changePassword')}
                </button>
              )}
            </div>

            {user && !user?.isStudio && (
              <div className='mt-8'>
                <h3 className='text-lg font-semibold mb-4 text-glass-text'>{t('settings.integrations')}</h3>
                <div className='space-y-3'>
                  {!user?.steam_id ? (
                    <button
                      onClick={() => {
                        if (linkText === 'Go on website to link') return;
                        window.location.href = '/api/auth/steam';
                      }}
                      disabled={linkText === 'Go on website to link' || user?.isStudio}
                      className='glass-button-neon w-full flex items-center justify-center gap-3'
                      style={{
                        background: 'linear-gradient(90deg, #1b2838 60%, #171a21 100%)',
                        opacity: linkText === 'Go on website to link' || user?.isStudio ? 0.5 : 1,
                      }}>
                      <i className='fab fa-steam text-xl' />
                      {linkText}
                    </button>
                  ) : (
                    <div className='glass-card flex items-center gap-3 p-3'>
                      <CachedImage src={user?.steam_avatar_url} alt='Steam Avatar' width={32} height={32} style={{ width: 32, height: 32, borderRadius: '20%' }} />
                      <span className='flex-1 text-sm'>
                        <i className='fab fa-steam mr-2' />
                        {user?.steam_username}
                      </span>
                      <button
                        onClick={async () => {
                          if (confirm('Unlink Steam?')) {
                            try {
                              const res = await fetch('/api/users/unlink-steam', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                              });
                              if (!res.ok) throw new Error('Failed');
                              setUser({
                                ...user,
                                steam_id: null,
                                steam_username: null,
                                steam_avatar_url: null,
                              });
                            } catch (e) {
                              alert('Error unlinking Steam');
                            }
                          }
                        }}
                        className='glass-button-red text-xs px-3 py-1'>
                        Unlink
                      </button>
                    </div>
                  )}

                  {!user?.discord_id ? (
                    <button
                      onClick={() => router.push('/auth/discord')}
                      className='glass-button-neon w-full flex items-center justify-center gap-3'
                      style={{
                        background: 'linear-gradient(90deg, #5865F2 60%, #404EED 100%)',
                      }}>
                      <i className='fab fa-discord text-xl' />
                      {t('settings.linkDiscord')}
                    </button>
                  ) : (
                    <button
                      disabled
                      className='glass-button-neon w-full flex items-center justify-center gap-3 opacity-70'
                      style={{
                        background: 'linear-gradient(90deg, #5865F2 60%, #404EED 100%)',
                      }}>
                      <i className='fab fa-discord text-xl' />
                      {t('settings.discordLinked')}
                    </button>
                  )}

                  {!user?.google_id ? (
                    <button
                      onClick={() => router.push('/auth/google')}
                      className='glass-button w-full flex items-center justify-center gap-3'
                      style={{
                        background: '#fff',
                        color: '#222',
                        border: '1px solid #e0e0e0',
                      }}>
                      <svg width='20' height='20' viewBox='0 0 48 48'>
                        <g>
                          <path fill='#4285F4' d='M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.86-6.86C36.64 2.69 30.74 0 24 0 14.82 0 6.73 5.8 2.69 14.09l7.98 6.2C12.41 13.41 17.74 9.5 24 9.5z' />
                          <path fill='#34A853' d='M46.1 24.55c0-1.64-.15-3.22-.43-4.74H24v9.01h12.41c-.54 2.91-2.16 5.38-4.61 7.04l7.1 5.53C43.96 37.47 46.1 31.61 46.1 24.55z' />
                          <path fill='#FBBC05' d='M10.67 28.29a14.5 14.5 0 0 1 0-8.58l-7.98-6.2A23.97 23.97 0 0 0 0 24c0 3.77.9 7.34 2.69 10.49l7.98-6.2z' />
                          <path fill='#EA4335' d='M24 48c6.48 0 11.92-2.15 15.89-5.85l-7.1-5.53c-2 1.34-4.56 2.13-8.79 2.13-6.26 0-11.59-3.91-13.33-9.29l-7.98 6.2C6.73 42.2 14.82 48 24 48z' />
                        </g>
                      </svg>
                      {t('settings.linkGoogle')}
                    </button>
                  ) : (
                    <button
                      disabled
                      className='glass-button w-full flex items-center justify-center gap-3 opacity-70'
                      style={{
                        background: '#fff',
                        color: '#222',
                        border: '1px solid #e0e0e0',
                      }}>
                      <svg width='20' height='20' viewBox='0 0 48 48'>
                        <g>
                          <path fill='#4285F4' d='M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.86-6.86C36.64 2.69 30.74 0 24 0 14.82 0 6.73 5.8 2.69 14.09l7.98 6.2C12.41 13.41 17.74 9.5 24 9.5z' />
                          <path fill='#34A853' d='M46.1 24.55c0-1.64-.15-3.22-.43-4.74H24v9.01h12.41c-.54 2.91-2.16 5.38-4.61 7.04l7.1 5.53C43.96 37.47 46.1 31.61 46.1 24.55z' />
                          <path fill='#FBBC05' d='M10.67 28.29a14.5 14.5 0 0 1 0-8.58l-7.98-6.2A23.97 23.97 0 0 0 0 24c0 3.77.9 7.34 2.69 10.49l7.98-6.2z' />
                          <path fill='#EA4335' d='M24 48c6.48 0 11.92-2.15 15.89-5.85l-7.1-5.53c-2 1.34-4.56 2.13-8.79 2.13-6.26 0-11.59-3.91-13.33-9.29l-7.98 6.2C6.73 42.2 14.82 48 24 48z' />
                        </g>
                      </svg>
                      {t('settings.googleLinked')}
                    </button>
                  )}

                  <LanguageSelector />
                </div>
              </div>
            )}
          </div>

          <div className='glass-content-card'>
            <h2 className='glass-title text-2xl mb-6'>{t('settings.apiKey')}</h2>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-glass-text-secondary mb-2'>{t('settings.yourApiKey')}</label>
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey || ''}
                  readOnly
                  className='glass-input cursor-pointer'
                  onClick={() => {
                    if (showApiKey) navigator.clipboard.writeText(apiKey || '');
                  }}
                  title={showApiKey ? 'Click to copy' : ''}
                />
              </div>
              <div className='flex gap-3'>
                <button onClick={() => setShowApiKey(!showApiKey)} className='glass-button flex-1'>
                  {showApiKey ? t('settings.hide') : t('settings.show')}
                </button>
                <button onClick={() => navigator.clipboard.writeText(apiKey || '')} disabled={!showApiKey} className='glass-button flex-1' style={{ opacity: !showApiKey ? 0.5 : 1 }}>
                  {t('settings.copy')}
                </button>
              </div>
              <p className='text-xs text-glass-text-muted text-center'>{t('settings.thisKeyAllows')}</p>
            </div>

            {user && (
              <div className='mt-8'>
                <h3 className='text-lg font-semibold mb-4 text-glass-text'>{t('settings.userId')}</h3>
                <div className='flex items-center gap-3'>
                  <code className='glass-input flex-1 cursor-pointer text-sm' onClick={() => navigator.clipboard.writeText(user.id || '')} title='Click to copy'>
                    {user.id}
                  </code>
                  <button onClick={() => navigator.clipboard.writeText(user.id || '')} className='glass-button'>
                    {t('settings.copy')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <ChangePasswordModal open={showPasswordModal} onClose={() => setShowPasswordModal(false)} onSubmit={handlePasswordChange} loading={passwordLoading} error={passwordError} success={passwordSuccess} />
        <GoogleAuthenticatorSetupModal
          open={showGoogleAuthModal}
          onClose={success => {
            setShowGoogleAuthModal(false);
            if (success && user) {
              user.haveAuthenticator = true;
              setUser({ ...user });
            }
          }}
          user={user}
        />
        <SecurityModal open={showSecurityModal} onClose={() => setShowSecurityModal(false)} user={user} setUser={setUser} passkeyLoading={passkeyLoading} passkeySuccess={passkeySuccess} passkeyError={passkeyError} handleRegisterPasskey={handleRegisterPasskey} showGoogleAuthModal={showGoogleAuthModal} setShowGoogleAuthModal={setShowGoogleAuthModal} success={success} error={error} setError={setError} setSuccess={setSuccess} router={router} linkText={linkText} />
      </div>
    </div>
  );
}

function SettingsMobile(props: ReturnType<typeof useSettingsLogic>) {
  const { apiKey } = useAuth();

  const {
    user,
    setUser,
    username,
    usernameLoading,
    usernameSuccess,
    usernameError,
    showApiKey,
    setShowApiKey,
    avatar,
    avatarFile,
    loading,
    success,
    error,
    fileInputRef,
    linkText,
    showPasswordModal,
    setShowPasswordModal,
    passwordLoading,
    passwordSuccess,
    passwordError,
    handleAvatarChange,
    handleAvatarUpload,
    handleUsernameChange,
    handleUsernameSave,
    handlePasswordChange,
    passkeyLoading,
    passkeySuccess,
    passkeyError,
    handleRegisterPasskey,
    showGoogleAuthModal,
    setShowGoogleAuthModal,
    showSecurityModal,
    setShowSecurityModal,
    router,
  } = props;
  const { t } = useTranslation();

  return (
    <div className='min-h-screen glass-bg-gradient'>
      <div className='glass-page-container py-8'>
        <div className='space-y-6'>
          <div className='glass-content-card'>
            <h2 className='glass-title text-xl mb-4'>{t('settings.profile')}</h2>
            <div className='flex flex-col items-center mb-6'>
              <CachedImage
                src={avatar}
                alt='Profile'
                width={100}
                height={100}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  marginBottom: 12,
                  border: '2px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                }}
                onClick={() => fileInputRef.current?.click()}
              />
              <input type='file' ref={fileInputRef} onChange={handleAvatarChange} accept='image/*' style={{ display: 'none' }} />
              <button onClick={() => fileInputRef.current?.click()} className='glass-button-neon w-full mb-2 text-sm'>
                {t('settings.choosePicture')}
              </button>
              {avatarFile && (
                <button onClick={handleAvatarUpload} disabled={loading} className='glass-button-green w-full text-sm'>
                  {loading ? t('settings.uploading') : t('settings.uploadNewPicture')}
                </button>
              )}
              {success && <p className='text-green-400 text-xs mt-2 text-center'>{success}</p>}
              {error && <p className='text-red-400 text-xs mt-2 text-center'>{error}</p>}
            </div>

            {!user?.isStudio && (
              <form onSubmit={handleUsernameSave} className='space-y-3'>
                <div>
                  <label className='block text-xs font-medium text-glass-text-secondary mb-2'>{t('settings.username')}</label>
                  <input type='text' value={username} onChange={handleUsernameChange} className='glass-input text-sm' disabled={usernameLoading} minLength={3} maxLength={32} required />
                </div>
                <button type='submit' disabled={usernameLoading} className='glass-button-neon w-full text-sm'>
                  {usernameLoading ? t('settings.saving') : t('settings.save')}
                </button>
                {usernameSuccess && <p className='text-green-400 text-xs text-center'>{usernameSuccess}</p>}
                {usernameError && <p className='text-red-400 text-xs text-center'>{usernameError}</p>}
              </form>
            )}
          </div>

          <div className='glass-content-card'>
            <h2 className='glass-title text-xl mb-4'>{t('settings.security')}</h2>
            <div className='space-y-3'>
              {!user?.isStudio && (
                <button onClick={() => setShowPasswordModal(true)} className='glass-button-neon w-full text-sm'>
                  <i className='fas fa-key mr-2' />
                  {t('settings.changePassword')}
                </button>
              )}
            </div>
          </div>

          <div className='glass-content-card'>
            <h2 className='glass-title text-xl mb-4'>{t('settings.apiKey')}</h2>
            <div className='space-y-3'>
              <div>
                <label className='block text-xs font-medium text-glass-text-secondary mb-2'>{t('settings.yourApiKey')}</label>
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey || ''}
                  readOnly
                  className='glass-input text-sm cursor-pointer'
                  onClick={() => {
                    if (showApiKey) navigator.clipboard.writeText(apiKey || '');
                  }}
                  title={showApiKey ? 'Click to copy' : ''}
                />
              </div>
              <div className='flex gap-2'>
                <button onClick={() => setShowApiKey(!showApiKey)} className='glass-button flex-1 text-xs'>
                  {showApiKey ? t('settings.hide') : t('settings.show')}
                </button>
                <button onClick={() => navigator.clipboard.writeText(apiKey || '')} disabled={!showApiKey} className='glass-button flex-1 text-xs' style={{ opacity: !showApiKey ? 0.5 : 1 }}>
                  {t('settings.copy')}
                </button>
              </div>
              <p className='text-[10px] text-glass-text-muted text-center'>{t('settings.thisKeyAllows')}</p>
            </div>

            {user && (
              <div className='mt-8'>
                <h3 className='text-lg font-semibold mb-4 text-glass-text'>{t('settings.userId')}</h3>
                <div className='flex items-center gap-2'>
                  <code className='glass-input flex-1 cursor-pointer text-xs' onClick={() => navigator.clipboard.writeText(user.id || '')} title='Click to copy'>
                    {user.id}
                  </code>
                  <button onClick={() => navigator.clipboard.writeText(user.id || '')} className='glass-button text-xs'>
                    {t('settings.copy')}
                  </button>
                </div>
              </div>
            )}

            {user && !user?.isStudio && (
              <div className='mt-8'>
                <h3 className='text-lg font-semibold mb-4 text-glass-text'>{t('settings.integrations')}</h3>
                <div className='space-y-3'>
                  {!user?.steam_id ? (
                    <button
                      onClick={() => {
                        if (linkText === 'Go on website to link') return;
                        window.location.href = '/api/auth/steam';
                      }}
                      disabled={linkText === 'Go on website to link' || user?.isStudio}
                      className='glass-button-neon w-full text-sm flex items-center justify-center gap-2'
                      style={{
                        background: 'linear-gradient(90deg, #1b2838 60%, #171a21 100%)',
                        opacity: linkText === 'Go on website to link' || user?.isStudio ? 0.5 : 1,
                      }}>
                      <i className='fab fa-steam text-lg' />
                      {linkText}
                    </button>
                  ) : (
                    <div className='glass-card flex items-center gap-2 p-2 text-xs'>
                      <CachedImage src={user?.steam_avatar_url} alt='Steam' width={24} height={24} style={{ width: 24, height: 24, borderRadius: '20%' }} />
                      <span className='flex-1'>
                        <i className='fab fa-steam mr-1' />
                        {user?.steam_username}
                      </span>
                      <button
                        onClick={async () => {
                          if (confirm('Unlink Steam?')) {
                            try {
                              const res = await fetch('/api/users/unlink-steam', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                              });
                              if (!res.ok) throw new Error('Failed');
                              setUser({
                                ...user,
                                steam_id: null,
                                steam_username: null,
                                steam_avatar_url: null,
                              });
                            } catch (e) {
                              alert('Error');
                            }
                          }
                        }}
                        className='glass-button-red text-[10px] px-2 py-1'>
                        Unlink
                      </button>
                    </div>
                  )}

                  {!user?.discord_id ? (
                    <button
                      onClick={() => router.push('/auth/discord')}
                      className='glass-button-neon w-full text-sm flex items-center justify-center gap-2'
                      style={{
                        background: 'linear-gradient(90deg, #5865F2 60%, #404EED 100%)',
                      }}>
                      <i className='fab fa-discord text-lg' />
                      {t('settings.linkDiscord')}
                    </button>
                  ) : (
                    <button
                      disabled
                      className='glass-button-neon w-full text-sm flex items-center justify-center gap-2 opacity-70'
                      style={{
                        background: 'linear-gradient(90deg, #5865F2 60%, #404EED 100%)',
                      }}>
                      <i className='fab fa-discord text-lg' />
                      {t('settings.discordLinked')}
                    </button>
                  )}

                  {!user?.google_id ? (
                    <button
                      onClick={() => router.push('/auth/google')}
                      className='glass-button w-full text-sm flex items-center justify-center gap-2'
                      style={{
                        background: '#fff',
                        color: '#222',
                        border: '1px solid #e0e0e0',
                      }}>
                      <svg width='16' height='16' viewBox='0 0 48 48'>
                        <path fill='#4285F4' d='M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.86-6.86C36.64 2.69 30.74 0 24 0 14.82 0 6.73 5.8 2.69 14.09l7.98 6.2C12.41 13.41 17.74 9.5 24 9.5z' />
                        <path fill='#34A853' d='M46.1 24.55c0-1.64-.15-3.22-.43-4.74H24v9.01h12.41c-.54 2.91-2.16 5.38-4.61 7.04l7.1 5.53C43.96 37.47 46.1 31.61 46.1 24.55z' />
                        <path fill='#FBBC05' d='M10.67 28.29a14.5 14.5 0 0 1 0-8.58l-7.98-6.2A23.97 23.97 0 0 0 0 24c0 3.77.9 7.34 2.69 10.49l7.98-6.2z' />
                        <path fill='#EA4335' d='M24 48c6.48 0 11.92-2.15 15.89-5.85l-7.1-5.53c-2 1.34-4.56 2.13-8.79 2.13-6.26 0-11.59-3.91-13.33-9.29l-7.98 6.2C6.73 42.2 14.82 48 24 48z' />
                      </svg>
                      {t('settings.linkGoogle')}
                    </button>
                  ) : (
                    <button
                      disabled
                      className='glass-button w-full text-sm flex items-center justify-center gap-2 opacity-70'
                      style={{
                        background: '#fff',
                        color: '#222',
                        border: '1px solid #e0e0e0',
                      }}>
                      <svg width='16' height='16' viewBox='0 0 48 48'>
                        <path fill='#4285F4' d='M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.86-6.86C36.64 2.69 30.74 0 24 0 14.82 0 6.73 5.8 2.69 14.09l7.98 6.2C12.41 13.41 17.74 9.5 24 9.5z' />
                        <path fill='#34A853' d='M46.1 24.55c0-1.64-.15-3.22-.43-4.74H24v9.01h12.41c-.54 2.91-2.16 5.38-4.61 7.04l7.1 5.53C43.96 37.47 46.1 31.61 46.1 24.55z' />
                        <path fill='#FBBC05' d='M10.67 28.29a14.5 14.5 0 0 1 0-8.58l-7.98-6.2A23.97 23.97 0 0 0 0 24c0 3.77.9 7.34 2.69 10.49l7.98-6.2z' />
                        <path fill='#EA4335' d='M24 48c6.48 0 11.92-2.15 15.89-5.85l-7.1-5.53c-2 1.34-4.56 2.13-8.79 2.13-6.26 0-11.59-3.91-13.33-9.29l-7.98 6.2C6.73 42.2 14.82 48 24 48z' />
                      </svg>
                      {t('settings.googleLinked')}
                    </button>
                  )}
                  <LanguageSelector />
                </div>
              </div>
            )}
          </div>
        </div>

        <ChangePasswordModal open={showPasswordModal} onClose={() => setShowPasswordModal(false)} onSubmit={handlePasswordChange} loading={passwordLoading} error={passwordError} success={passwordSuccess} />
        <GoogleAuthenticatorSetupModal
          open={showGoogleAuthModal}
          onClose={success => {
            setShowGoogleAuthModal(false);
            if (success && user) {
              user.haveAuthenticator = true;
              setUser({ ...user });
            }
          }}
          user={user}
        />
        <SecurityModal open={showSecurityModal} onClose={() => setShowSecurityModal(false)} user={user} setUser={setUser} passkeyLoading={passkeyLoading} passkeySuccess={passkeySuccess} passkeyError={passkeyError} handleRegisterPasskey={handleRegisterPasskey} showGoogleAuthModal={showGoogleAuthModal} setShowGoogleAuthModal={setShowGoogleAuthModal} success={success} error={error} setError={props.setError} setSuccess={props.setSuccess} router={router} linkText={linkText} />
      </div>
    </div>
  );
}

export default function Settings() {
  const isMobile = useIsMobile();
  const logic = useSettingsLogic();
  return isMobile ? <SettingsMobile {...logic} /> : <SettingsDesktop {...logic} />;
}
