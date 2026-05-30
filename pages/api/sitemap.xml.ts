const actuaSitemap = `
    <url>
        <loc>https://croissant-api.eminium.ovh/</loc>
        <lastmod>2025-07-28</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>https://croissant-api.eminium.ovh/tos</loc>
        <lastmod>2025-07-28</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>https://croissant-api.eminium.ovh/privacy</loc>
        <lastmod>2025-07-28</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>https://croissant-api.eminium.ovh/api-docs</loc>
        <lastmod>2025-07-28</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>https://croissant-api.eminium.ovh/contact</loc>
        <lastmod>2025-07-28</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>https://croissant-api.eminium.ovh/download-launcher</loc>
        <lastmod>2025-07-28</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>https://croissant-api.eminium.ovh/studios</loc>
        <lastmod>2025-07-28</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>https://croissant-api.eminium.ovh/search</loc>
        <lastmod>2025-07-28</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>https://croissant-api.eminium.ovh/game-shop</loc>
        <lastmod>2025-07-28</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>https://croissant-api.eminium.ovh/login</loc>
        <lastmod>2025-07-28</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>
    <url>
        <loc>https://croissant-api.eminium.ovh/register</loc>
        <lastmod>2025-07-28</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>
    <url>
        <loc>https://croissant-api.eminium.ovh/buy-credits</loc>
        <lastmod>2025-07-28</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>https://croissant-api.eminium.ovh/dev-zone/create-game</loc>
        <lastmod>2025-07-28</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>
    <url>
        <loc>https://croissant-api.eminium.ovh/dev-zone/create-item</loc>
        <lastmod>2025-07-28</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>
    <url>
        <loc>https://croissant-api.eminium.ovh/dev-zone/my-games</loc>
        <lastmod>2025-07-28</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.5</priority>
    </url>
    <url>
        <loc>https://croissant-api.eminium.ovh/dev-zone/my-items</loc>
        <lastmod>2025-07-28</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.5</priority>
    </url>
    <url>
        <loc>https://croissant-api.eminium.ovh/launcher</loc>
        <lastmod>2025-07-28</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>https://croissant-api.eminium.ovh/launcher/home</loc>
        <lastmod>2025-07-28</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>https://croissant-api.eminium.ovh/oauth2/apps</loc>
        <lastmod>2025-07-28</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
    </url>
`;

const genGameItem = (games: { gameId: string }[]) => {
  const today = new Date().toISOString().slice(0, 10);
  return games
    .map(
      game => `
        <url>
            <loc>https://croissant-api.eminium.ovh/game?gameId=${game.gameId}</loc>
            <lastmod>${today}</lastmod>
            <changefreq>weekly</changefreq>
            <priority>0.6</priority>
        </url>
    `
    )
    .join('');
};

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed');

  const games = fetch('https://croissant-api.eminium.ovh/api/games')
    .then(response => response.json())
    .then(data => data.map((game: { gameId: string }) => ({ gameId: game.gameId })))
    .catch(() => []);

  const gameItems = await games;
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${actuaSitemap}
    ${genGameItem(gameItems)}
</urlset>
`;

  res.setHeader('Content-Type', 'application/xml');
  res.write(sitemap);
  res.end();
}
