import { getServerSideTranslations as serverSideTranslations, useTranslation } from '../components/utils/CloudflareI18n';

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  };
}

export default function ClosePage() {
  const { t } = useTranslation();

  return (
    <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
      <div className='container p-5 rounded-lg'>
        <h1 className='text-4xl text-center my-10 text-white tracking-wider'>{t('close.title')}</h1>
      </div>
    </div>
  );
}
