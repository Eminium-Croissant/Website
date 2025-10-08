import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_CALLBACK_URL!,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'].join(' '),
  });
  return {
    redirect: {
      destination: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
      permanent: false,
    },
  };
};

export default function GoogleRedirectPage() {
  return null;
}
