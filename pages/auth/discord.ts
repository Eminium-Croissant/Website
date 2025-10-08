import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID!,
    redirect_uri: process.env.DISCORD_CALLBACK_URL!,
    response_type: 'code',
    scope: 'identify email',
  });
  return {
    redirect: {
      destination: `https://discord.com/api/oauth2/authorize?${params.toString()}`,
      permanent: false,
    },
  };
};

export default function DiscordRedirectPage() {
  return null;
}
