import React from "react";

type Props = {
  metaLinksTitle?: string;
  metaDescription?: string;
  from?: string;
};

export default function ({ metaLinksTitle, metaDescription, from }: Props) {
  const isLauncher = from === "app";
  if (isLauncher) {
    // Keep the legacy cookie for launcher detection
    document.cookie = "from=app; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT";
  }

  const defaultTitle = metaLinksTitle || "Croissant Inventory System";
  const defaultDescription =
    metaDescription || `${defaultTitle} - Manage your inventory with ease.`;

  return (
    <>
      {/* Primary Meta Tags */}
      <title>{defaultTitle}</title>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content={defaultDescription} />
      <meta name="keywords" content="Croissant, Inventory, System, API, Opensource, Scalable, Network Technology" />
      <meta name="author" content="Fox3000foxy" />
      <meta name="theme-color" content="#222222" />

      {/* Open Graph / Facebook - prefer AVIF then PNG fallback */}
      <meta property="og:title" content={defaultTitle} />
      <meta property="og:description" content={defaultDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://croissant-api.fr/" />
      {/* Provide both AVIF and PNG images; social crawlers will pick supported ones */}
      <meta property="og:image" content="/assets/icons/launcher.avif" />
      <meta property="og:image" content="/assets/icons/launcher.png" />
      <meta property="og:site_name" content={defaultTitle} />

      {/* Icons - prefer .avif, then .png fallback. Browsers pick the first they support. */}
      <link rel="icon" type="image/avif" sizes="16x16" href="/assets/icons/favicon-16x16.avif" />
      <link rel="icon" type="image/png" sizes="16x16" href="/assets/icons/favicon-16x16.png" />

      <link rel="icon" type="image/avif" sizes="32x32" href="/assets/icons/favicon-32x32.avif" />
      <link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/favicon-32x32.png" />

      <link rel="icon" type="image/avif" sizes="96x96" href="/assets/icons/favicon-96x96.avif" />
      <link rel="icon" type="image/png" sizes="96x96" href="/assets/icons/favicon-96x96.png" />

      <link rel="icon" type="image/avif" sizes="192x192" href="/assets/icons/android-icon-192x192.avif" />
      <link rel="icon" type="image/png" sizes="192x192" href="/assets/icons/android-icon-192x192.png" />

      {/* Apple touch icons (use PNG as AVIF is not widely supported on iOS) */}
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
      {/* Use correct MIME type for robots.txt for Firefox compatibility */}
      <link rel="robots" type="text/plain" href="/robots.txt" />
      <meta name="msapplication-TileColor" content="#ffffff" />
      {/* Use PNG for ms tile (better compatibility) */}
      <meta name="msapplication-TileImage" content="/assets/icons/ms-icon-144x144.png" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
    </>
  );
}
