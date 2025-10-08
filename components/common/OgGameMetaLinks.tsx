
type Props = {
  title: string;
  description: string;
  bannerUrl: string;
  gameUrl: string;
  card?: boolean;
};

export default function OgGameMetaLinks({ title, description, bannerUrl, gameUrl, card }: Props) {
  return (
    <>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content={description} />
      <meta name="keywords" content="Croissant, Inventory, System, API, Opensource, Scalable, Network Technology, Game" />
      <meta name="author" content="Fox3000foxy" />
      <meta name="theme-color" content="#222222" />

      {/* Open Graph / Facebook */}
      <meta property="og:title" content={title + " on Croissant API"} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={gameUrl} />
      <meta property="og:image" content={bannerUrl} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:secure_url" content={bannerUrl} />
      <meta property="og:site_name" content={title} />

      {/* Twitter */}
      {card && (
        <>
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={title + " on Croissant API"} />
          <meta name="twitter:description" content={description} />
          <meta name="twitter:image" content={bannerUrl} />
        </>
      )}

      {/* Icons */}
      <link rel="icon" type="image/png" sizes="16x16" href="/assets/icons/favicon-16x16.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="96x96" href="/assets/icons/favicon-96x96.png" />
      <link rel="icon" type="image/png" sizes="192x192" href="/assets/icons/android-icon-192x192.png" />

      {/* Apple touch icons */}
      <link rel="apple-touch-icon" sizes="57x57" href="/assets/icons/apple-icon-57x57.png" />
      <link rel="apple-touch-icon" sizes="60x60" href="/assets/icons/apple-icon-60x60.png" />
      <link rel="apple-touch-icon" sizes="72x72" href="/assets/icons/apple-icon-72x72.png" />
      <link rel="apple-touch-icon" sizes="76x76" href="/assets/icons/apple-icon-76x76.png" />
      <link rel="apple-touch-icon" sizes="114x114" href="/assets/icons/apple-icon-114x114.png" />
      <link rel="apple-touch-icon" sizes="120x120" href="/assets/icons/apple-icon-120x120.png" />
      <link rel="apple-touch-icon" sizes="144x144" href="/assets/icons/apple-icon-144x144.png" />
      <link rel="apple-touch-icon" sizes="152x152" href="/assets/icons/apple-icon-152x152.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/assets/icons/apple-icon-180x180.png" />

      {/* Manifest & Misc */}
      <link rel="manifest" href="/manifest.json" />
      <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      <link rel="robots" type="text/plain" href="/robots.txt" />
      <meta name="msapplication-TileColor" content="#ffffff" />
      <meta name="msapplication-TileImage" content="/assets/icons/ms-icon-144x144.png" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
    </>
  );
}
