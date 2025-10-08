import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import useIsMobile from '../../hooks/useIsMobile';

const OAUTH2_SERVER_URL = '/downloadables/oauth2-test-server.js';
const OAUTH2_RESULT_IMG = '/assets/oauth2_result.avif';

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

function OAuth2DemoDesktop() {
  const { t } = useTranslation('common');
  const [serverCode, setServerCode] = useState<string>('');

  useEffect(() => {
    fetch(OAUTH2_SERVER_URL)
      .then(r => r.text())
      .then(setServerCode);
  }, []);

  return (
    <div className='glass-page-container flex justify-center items-center min-h-screen'>
      <div className="glass-content-card max-w-[900px] w-full mx-auto my-10 rounded-[18px] shadow-xl p-8 font-['Montserrat',Arial,sans-serif] text-white">
        <h1 className='text-[#3a8fdc] text-4xl mb-2'>{t('oauth2.demo.title')}</h1>

        <h2 className='text-white text-2xl mt-8'>{t('oauth2.demo.subtitle')}</h2>
        <p className='text-[#aaa] text-lg'>{t('oauth2.demo.description')}</p>

        <button
          data-client_id='2b90be46-3fdb-45f1-98bd-081b70cc3d9f'
          className='croissant-oauth2-btn inline-flex items-center gap-2 px-[22px] py-[10px] text-lg rounded-lg bg-[#333] text-white cursor-pointer font-semibold mb-6 shadow-[0_2px_8px_rgba(0,0,0,0.18)] transition-colors hover:bg-[#3a3a3a]'
          onClick={e => {
            const clientId = e.currentTarget.getAttribute('data-client_id');
            const redirectUri = location.origin;
            let page = window.open(`/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}`, '_oauth2', 'width=600,height=600');

            function lookForCode() {
              requestAnimationFrame(lookForCode);
              if (!page || page.closed) return;
              try {
                const code = new URL(page.location.href).searchParams.get('code');
                if (code) {
                  page.close();
                  const oauthBtn = document.querySelector('.croissant-oauth2-btn');
                  const clientId = oauthBtn.getAttribute('data-client_id');
                  fetch(`/api/oauth2/user?code=${code}&client_id=${clientId}`)
                    .then(response => response.json())
                    .then(data => {
                      if (data.error) {
                        console.error('Error fetching user by code:', data.error);
                        return;
                      }
                      const user = { ...data, code };
                      console.log('User data:', user);
                      const callback = oauthBtn.getAttribute('data-callback');
                      if (callback) {
                        window[callback](user);
                      }
                    });
                }
              } catch (e) {
                // ignore
              }
            }

            lookForCode();
          }}
        >
          <img src='https://croissant-api.fr/assets/icons/favicon-32x32.avif' alt='icon' className='w-6 h-6' />
          <span>{t('oauth2.demo.connectButton')}</span>
        </button>

        <h2 className='text-white text-2xl mt-8'>{t('oauth2.demo.expectedResult')}</h2>
        <p className='text-[#aaa]'>{t('oauth2.demo.expectedDescription')}</p>
        <img src={OAUTH2_RESULT_IMG} alt='Expected result of OAuth2 authentication' className='max-w-full rounded-xl shadow-[0_2px_12px_rgba(58,143,220,0.08)] text-left' />
        <br />
        <br />

        <a href='/downloadables/oauth2-test.html' className='inline-block my-4 px-6 py-3 bg-[#3a8fdc] text-white rounded-lg no-underline font-bold transition-colors hover:bg-[#3272b3] border border-[#222] shadow-[0_2px_8px_rgba(58,143,220,0.08)]' download target='_blank' rel='noopener noreferrer'>
          {t('oauth2.demo.downloadCode')}
        </a>
      </div>
    </div>
  );
}

function OAuth2DemoMobile() {
  const { t } = useTranslation('common');
  const [serverCode, setServerCode] = useState<string>('');

  useEffect(() => {
    fetch(OAUTH2_SERVER_URL)
      .then(r => r.text())
      .then(setServerCode);
  }, []);

  return (
    <div className='glass-page-container flex justify-center items-center min-h-screen'>
      <div className="glass-content-card max-w-[420px] w-full mx-auto my-[18px] rounded-[10px] shadow-xl p-[18px] font-['Montserrat',Arial,sans-serif] text-white text-[0.98em]">
        <h1 className='text-[#3a8fdc] text-2xl mb-1.5'>{t('oauth2.demo.title')}</h1>

        <h2 className='text-white text-lg mt-[18px]'>{t('oauth2.demo.subtitle')}</h2>
        <p className='text-[#aaa] text-base'>{t('oauth2.demo.description')}</p>

        <button
          data-client_id='2b90be46-3fdb-45f1-98bd-081b70cc3d9f'
          className='croissant-oauth2-btn w-full flex items-center justify-center gap-2 py-[10px] text-base rounded-[7px] bg-[#333] text-white cursor-pointer font-semibold mb-4 shadow-[0_2px_8px_rgba(0,0,0,0.18)] transition-colors hover:bg-[#3a3a3a]'
          onClick={e => {
            const clientId = e.currentTarget.getAttribute('data-client_id');
            const redirectUri = location.origin;
            let page = window.open(`/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}`, '_oauth2', 'width=600,height=600');

            function lookForCode() {
              requestAnimationFrame(lookForCode);
              if (!page || page.closed) return;
              try {
                const code = new URL(page.location.href).searchParams.get('code');
                if (code) {
                  page.close();
                  const oauthBtn = document.querySelector('.croissant-oauth2-btn');
                  const clientId = oauthBtn.getAttribute('data-client_id');
                  fetch(`/api/oauth2/user?code=${code}&client_id=${clientId}`)
                    .then(response => response.json())
                    .then(data => {
                      if (data.error) {
                        console.error('Error fetching user by code:', data.error);
                        return;
                      }
                      const user = { ...data, code };
                      alert('User data:' + JSON.stringify(user, null, 2));
                      const callback = oauthBtn.getAttribute('data-callback');
                      if (callback) {
                        window[callback](user);
                      }
                    });
                }
              } catch (e) {
                // ignore
              }
            }

            lookForCode();
          }}
        >
          <img src='https://croissant-api.fr/assets/icons/favicon-32x32.avif' alt='icon' className='w-5 h-5' />
          <span>{t('oauth2.demo.connectButton')}</span>
        </button>

        <h2 className='text-white text-lg mt-[18px]'>{t('oauth2.demo.expectedResult')}</h2>
        <p className='text-[0.97em]'>{t('oauth2.demo.expectedDescription')}</p>
        <img src={OAUTH2_RESULT_IMG} alt='Expected result of OAuth2 authentication' className='max-w-full rounded-xl shadow-[0_2px_12px_rgba(58,143,220,0.08)] text-left' />
        <br />
        <br />
      </div>
    </div>
  );
}

export default function OAuth2Demo() {
  const isMobile = useIsMobile();
  return isMobile ? <OAuth2DemoMobile /> : <OAuth2DemoDesktop />;
}
