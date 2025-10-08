import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import useIsMobile from '../../hooks/useIsMobile';

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

function AppCard({ app, onIframe, onEdit, onDelete, spoilers, toggleSpoiler }) {
  const { t } = useTranslation('common');
  return (
    <div className='bg-[#1c1c24] rounded-xl overflow-hidden flex flex-col border border-[#333] shadow-lg transform transition-transform hover:scale-[1.02] hover:shadow-xl'>
      <div className='relative h-8 bg-[#18181c]'>
        <div className='absolute inset-0 bg-gradient-to-t from-[#1c1c24] to-transparent opacity-60' />
        <div className='absolute -bottom-8 left-8'>
          <div className='flex flex-col'>
            <h3 className='text-xl font-bold text-white'>{app.name}</h3>
          </div>
        </div>
      </div>

      <div className='pt-16 px-8 pb-6 flex flex-col gap-6'>
        <div className='bg-[#2a2a32] rounded-lg p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-gray-400'>{t('oauth2.apps.clientId')}</span>
            <button onClick={() => navigator.clipboard.writeText(app.client_id)} className='text-xs text-gray-400 hover:text-white transition-colors'>
              {t('oauth2.apps.copy')}
            </button>
          </div>
          <code className='block w-full bg-[#1c1c24] rounded p-2 text-sm font-mono cursor-pointer select-all truncate'>{app.client_id}</code>
        </div>

        {app.client_secret && (
          <div className='bg-[#2a2a32] rounded-lg p-4'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm text-gray-400'>{t('oauth2.apps.clientSecret')}</span>
              <div className='flex items-center gap-2'>
                <button onClick={() => toggleSpoiler(app.client_id)} className='text-xs text-gray-400 hover:text-white transition-colors'>
                  {spoilers[app.client_id] ? t('oauth2.apps.hide') : t('oauth2.apps.show')}
                </button>
                <button onClick={() => navigator.clipboard.writeText(app.client_secret)} className='text-xs text-gray-400 hover:text-white transition-colors'>
                  {t('oauth2.apps.copy')}
                </button>
              </div>
            </div>
            <code className='block w-full bg-[#1c1c24] rounded p-2 text-sm font-mono cursor-pointer select-all truncate'>{spoilers[app.client_id] ? app.client_secret : '*'.repeat(32)}</code>
          </div>
        )}

        <div className='bg-[#2a2a32] rounded-lg p-4'>
          <span className='text-sm text-gray-400 block mb-2'>{t('oauth2.apps.redirectUrls')}</span>
          <div className='text-sm text-white'>{Array.isArray(app.redirect_urls) ? app.redirect_urls.join(', ') : app.redirect_urls}</div>
        </div>

        <div className='flex flex-col gap-2'>
          <button onClick={() => onIframe(app.client_id)} className='w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors'>
            {t('oauth2.apps.integrationCode')}
          </button>
          <button onClick={() => onEdit(app)} className='w-full bg-[#2a2a32] hover:bg-[#32323a] text-white py-3 rounded-lg transition-colors border border-[#444]'>
            {t('oauth2.apps.edit')}
          </button>
          <button onClick={() => onDelete(app.client_id)} className='w-full bg-[#2a2a32] hover:bg-[#32323a] text-white py-3 rounded-lg transition-colors border border-[#444]'>
            {t('oauth2.apps.delete')}
          </button>
        </div>
      </div>
    </div>
  );
}

function useOAuth2AppsLogic() {
  const [apps, setApps] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [redirectUrls, setRedirectUrls] = useState('');
  const [iframeCode, setIframeCode] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [spoilers, setSpoilers] = useState<{ [k: string]: boolean }>({});
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetch('/api/oauth2/apps', {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => res.json())
      .then(setApps)
      .catch(() => setApps([]));
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      const res = await fetch(`/api/oauth2/app/${editing}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name,
          redirect_urls: redirectUrls.split(',').map(s => s.trim()),
        }),
      });
      if (res.ok) {
        setApps(apps.map(a => (a.client_id === editing ? { ...a, name, redirect_urls: redirectUrls.split(',') } : a)));
        setEditing(null);
        setName('');
        setRedirectUrls('');
        setShowEditForm(false);
      }
    } else {
      const res = await fetch('/api/oauth2/app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name,
          redirect_urls: redirectUrls.split(',').map(s => s.trim()),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setApps([
          ...apps,
          {
            client_id: data.client_id,
            name,
            redirect_urls: redirectUrls.split(','),
          },
        ]);
        setName('');
        setRedirectUrls('');
        setShowForm(false);
      }
    }
  };

  const handleIframe = (client_id: string) => {
    setIframeCode(
      `<script src="https://croissant-api.fr/oauth2/script.js"></script>
<button 
  data-client_id="${client_id}"
  data-callback="function(user) { console.log('User data:', user); }"
  class="croissant-oauth2-btn">
  <img
    src="https://croissant-api.fr/assets/icons/favicon-32x32.avif"
    alt="icon"
  />
  Login with Croissant
</button>`
    );
  };

  const handleEdit = (app: any) => {
    setName(app.name);
    setRedirectUrls(Array.isArray(app.redirect_urls) ? app.redirect_urls.join(',') : app.redirect_urls);
    setEditing(app.client_id);
    setShowEditForm(true);
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setName('');
    setRedirectUrls('');
    setShowEditForm(false);
    setShowForm(false);
  };

  const handleDelete = async (client_id: string) => {
    if (!window.confirm('Are you sure you want to delete this app?')) return;
    const res = await fetch(`/api/oauth2/app/${client_id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) setApps(apps.filter(a => a.client_id !== client_id));
    if (editing === client_id) handleCancelEdit();
  };

  function toggleSpoiler(client_id: string) {
    setSpoilers(s => ({ ...s, [client_id]: !s[client_id] }));
  }

  return {
    apps,
    name,
    setName,
    redirectUrls,
    setRedirectUrls,
    iframeCode,
    setIframeCode,
    editing,
    setEditing,
    showForm,
    setShowForm,
    showEditForm,
    setShowEditForm,
    spoilers,
    setSpoilers,
    handleCreate,
    handleIframe,
    handleEdit,
    handleCancelEdit,
    handleDelete,
    toggleSpoiler,
  };
}

function OAuth2AppsDesktop(props: ReturnType<typeof useOAuth2AppsLogic>) {
  const { t } = useTranslation('common');
  const { apps, name, setName, redirectUrls, setRedirectUrls, iframeCode, setIframeCode, editing, showForm, setShowForm, showEditForm, handleCreate, handleIframe, handleEdit, handleCancelEdit, handleDelete, spoilers, toggleSpoiler, setEditing } = props;

  return (
    <div className='glass-page-container'>
      <div className='glass-content-card mb-8 flex justify-between items-center'>
        <h1 className='text-3xl font-bold' style={{ color: 'var(--glass-text)' }}>
          {t('oauth2.apps.title')}
        </h1>
        <div className='flex items-center gap-4'>
          <Link href='/oauth2/test' className='text-sm text-gray-400 hover:text-gray-300 transition-colors underline'>
            {t('oauth2.apps.testLink')}
          </Link>
          <button
            onClick={() => {
              setShowForm(true);
              setEditing(null);
              setName('');
              setRedirectUrls('');
            }}
            className='glass-button-neon'>
            {t('oauth2.apps.addButton')}
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>{apps && apps.map(app => <AppCard key={app.client_id} app={app} onIframe={handleIframe} onEdit={handleEdit} onDelete={handleDelete} spoilers={spoilers} toggleSpoiler={toggleSpoiler} />)}</div>

      {(showForm || showEditForm) && <OAuth2AppModal title={editing ? t('Edit Application') : t('Create Application')} name={name} setName={setName} redirectUrls={redirectUrls} setRedirectUrls={setRedirectUrls} onSubmit={handleCreate} onCancel={handleCancelEdit} submitLabel={editing ? t('Save Changes') : t('Create')} />}
      {iframeCode && <OAuth2CodeModal code={iframeCode} onClose={() => setIframeCode(null)} />}
    </div>
  );
}

function OAuth2AppsMobile(props: ReturnType<typeof useOAuth2AppsLogic>) {
  const { t } = useTranslation('common');
  const { apps, name, setName, redirectUrls, setRedirectUrls, iframeCode, setIframeCode, editing, showForm, setShowForm, showEditForm, handleCreate, handleIframe, handleEdit, handleCancelEdit, handleDelete, spoilers, toggleSpoiler, setEditing } = props;

  return (
    <div className='glass-page-container'>
      <div className='glass-content-card mb-6 flex flex-col items-center gap-2'>
        <h2 className='text-lg font-semibold mb-2' style={{ color: 'var(--glass-text)' }}>
          {t('My OAuth2 Applications')}
        </h2>
        <div className='flex gap-3'>
          <Link href='/oauth2/test' className='text-sm text-gray-400 hover:text-gray-300 transition-colors underline'>
            {t('Test OAuth2')} ↗
          </Link>
          <button
            onClick={() => {
              setShowForm(true);
              setEditing(null);
              setName('');
              setRedirectUrls('');
            }}
            className='glass-button-neon text-sm'>
            {t('+ Add')}
          </button>
        </div>
      </div>

      <div className='flex flex-col gap-4'>
        {apps?.map(app => (
          <AppCard key={app.client_id} app={app} onIframe={handleIframe} onEdit={handleEdit} onDelete={handleDelete} spoilers={spoilers} toggleSpoiler={toggleSpoiler} />
        ))}
      </div>

      {(showForm || showEditForm) && <OAuth2AppModal title={editing ? t('Edit Application') : t('Create Application')} name={name} setName={setName} redirectUrls={redirectUrls} setRedirectUrls={setRedirectUrls} onSubmit={handleCreate} onCancel={handleCancelEdit} submitLabel={editing ? t('Save Changes') : t('Create')} />}
      {iframeCode && <OAuth2CodeModal code={iframeCode} onClose={() => setIframeCode(null)} />}
    </div>
  );
}

function OAuth2AppModal({ title, name, setName, redirectUrls, setRedirectUrls, onSubmit, onCancel, submitLabel }) {
  const { t } = useTranslation('common');
  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50' onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} className='bg-[#1c1c24] rounded-xl p-6 w-full  relative'>
        <button onClick={onCancel} className='absolute top-4 right-4 text-gray-400 hover:text-white text-xl'>
          ×
        </button>

        <h3 className='text-xl font-bold text-white mb-6'>{title}</h3>

        <form onSubmit={onSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <label className='block text-sm text-gray-400'>{t('oauth2.apps.appName')}</label>
            <input type='text' value={name} onChange={e => setName(e.target.value)} required placeholder={t('oauth2.apps.appNamePlaceholder')} className='w-full bg-[#2a2a32] border border-[#444] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500' />
          </div>

          <div className='space-y-2'>
            <label className='block text-sm text-gray-400'>
              {t('oauth2.apps.redirectUrls')} <span className='font-normal opacity-70'>{t('oauth2.apps.redirectUrlsHelp')}</span>
            </label>
            <input type='text' value={redirectUrls} onChange={e => setRedirectUrls(e.target.value)} required placeholder={t('oauth2.apps.redirectUrlsPlaceholder')} className='w-full bg-[#2a2a32] border border-[#444] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500' />
          </div>

          <div className='flex gap-3 pt-2'>
            <button type='submit' className='flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors'>
              {submitLabel}
            </button>
            <button type='button' onClick={onCancel} className='flex-1 bg-[#2a2a32] hover:bg-[#32323a] text-white py-2 rounded-lg transition-colors border border-[#444]'>
              {t('oauth2.apps.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OAuth2CodeModal({ code, onClose }) {
  const { t } = useTranslation('common');
  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50' onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className='bg-[#1c1c24] rounded-xl p-6 w-full  relative'>
        <button onClick={onClose} className='absolute top-4 right-4 text-gray-400 hover:text-white text-xl'>
          ×
        </button>

        <h4 className='text-lg font-bold text-white mb-4'>{t('oauth2.apps.integrationTitle')}</h4>

        <pre className='bg-[#2a2a32] rounded-lg p-3 text-sm font-mono text-white overflow-x-auto whitespace-pre-wrap'>{code}</pre>
      </div>
    </div>
  );
}

export default function OAuth2Apps() {
  const isMobile = useIsMobile();
  const logic = useOAuth2AppsLogic();
  return isMobile ? <OAuth2AppsMobile {...logic} /> : <OAuth2AppsDesktop {...logic} />;
}
