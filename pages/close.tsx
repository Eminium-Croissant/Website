import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default function ClosePage() {
  const { t } = useTranslation('common');

  return (
    <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
      <div className='container p-5 rounded-lg'>
        <h1 className='text-4xl text-center my-10 text-white tracking-wider'>{t('close.title')}</h1>
      </div>
    </div>
  );
}

