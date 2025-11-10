import 'dotenv/config';

export default ({ config }) => {
  const env = process.env.APP_ENV || 'local'; // default

  return {
    ...config,
    extra: {
      env,
      API_URL: process.env.EXPO_PUBLIC_API_URL,
    },
  };
};
