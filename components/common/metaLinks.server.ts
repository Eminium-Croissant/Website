import { getServerSideTranslations as serverSideTranslations } from '../utils/CloudflareI18n';

export async function getMetaLinksProps(locale = 'en') {
  const translations = await serverSideTranslations(locale);

  const common = (await import(`../../public/locales/${locale}/common.json`)).default;

  const metaLinksTitle = common?.index?.hero?.title || common?.index?.title || common?.launcher?.title || common?.apiDocs?.title || 'Croissant Inventory System';

  const metaDescription = common?.index?.hero?.subtitle || common?.index?.description || common?.apiDocs?.intro || common?.index?.topspan || `${metaLinksTitle} - Manage your inventory with ease.`;

  return {
    ...translations,
    metaLinksTitle,
    metaDescription,
  };
}
