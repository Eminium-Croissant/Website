import React from "react";

type Props = {
  title: string;
  description: string;
  bannerUrl: string;
  gameUrl: string;
};

export default function OgGameMetaLinks({ title, description, bannerUrl, gameUrl }: Props) {
  return (
    <>
      <title>{title}</title>
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={bannerUrl} />
      <meta property="og:url" content={gameUrl} />
      <meta property="og:type" content="website" />
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={bannerUrl} />
    </>
  );
}