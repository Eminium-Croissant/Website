import Head from 'next/head'
import { useTranslation } from '../utils/CloudflareI18n'

type Props = {
  metaLinksTitle?: string
  metaDescription?: string
  from?: string
}

export default function ({ metaLinksTitle, metaDescription, from }: Props) {
  const { t } = useTranslation()

  const titleFromKeys = t('index.hero.title') || t('index.title') || t('launcher.title') || t('apiDocs.title')
  const descFromKeys = t('index.hero.subtitle') || t('index.description') || t('apiDocs.intro') || t('index.topspan')

  const defaultTitle = metaLinksTitle || titleFromKeys || 'Croissant Inventory System'
  const defaultDescription = metaDescription || descFromKeys || `${defaultTitle} - Manage your inventory with ease.`

  return (
    <Head>
      <title>{defaultTitle}</title>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content={defaultDescription} />
      <meta name="keywords" content="Croissant, Inventory, System, API, Opensource, Scalable, Network Technology" />
      <meta name="author" content="Fox3000foxy" />
      <meta name="theme-color" content="#222222" />

      <meta property="og:title" content={defaultTitle} />
      <meta property="og:description" content={defaultDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://croissant-api.eminium.ovh/" />
      <meta property="og:image" content="/assets/launcher.png" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:secure_url" content="https://croissant-api.eminium.ovh/assets/launcher.png" />
      <meta property="og:site_name" content={defaultTitle} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={defaultTitle} />
      <meta name="twitter:description" content={defaultDescription} />
      <meta name="twitter:image" content="/assets/launcher.png" />
      <link rel="icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="16x16" href="/assets/icons/favicon-16x16.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="96x96" href="/assets/icons/favicon-96x96.png" />
      <link rel="icon" type="image/png" sizes="192x192" href="/assets/icons/android-icon-192x192.png" />

      <link rel="apple-touch-icon" sizes="57x57" href="/assets/icons/apple-icon-57x57.png" />
      <link rel="apple-touch-icon" sizes="60x60" href="/assets/icons/apple-icon-60x60.png" />
      <link rel="apple-touch-icon" sizes="72x72" href="/assets/icons/apple-icon-72x72.png" />
      <link rel="apple-touch-icon" sizes="76x76" href="/assets/icons/apple-icon-76x76.png" />
      <link rel="apple-touch-icon" sizes="114x114" href="/assets/icons/apple-icon-114x114.png" />
      <link rel="apple-touch-icon" sizes="120x120" href="/assets/icons/apple-icon-120x120.png" />
      <link rel="apple-touch-icon" sizes="144x144" href="/assets/icons/apple-icon-144x144.png" />
      <link rel="apple-touch-icon" sizes="152x152" href="/assets/icons/apple-icon-152x152.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/assets/icons/apple-icon-180x180.png" />

      <link rel="manifest" href="/manifest.json" />
      <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      <link rel="robots" type="text/plain" href="/robots.txt" />
      <meta name="msapplication-TileColor" content="#ffffff" />
      <meta name="msapplication-TileImage" content="/assets/icons/ms-icon-144x144.png" />
    </Head>
  )
}
