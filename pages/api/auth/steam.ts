import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiBase = process.env.API_BASE_URL || 'http://localhost:3456';

  fetch(`${apiBase}/users/steam-redirect`, {
    method: 'GET',
  })
    .then(response => response.text())
    .then(url => {
      console.log('Redirecting to Steam auth URL:', url);
      res.redirect(url);
    })
    .catch(error => {
      console.error('Error fetching Steam auth URL:', error);
      res.status(500).send('Internal Server Error');
    });
}
