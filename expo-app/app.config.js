import 'dotenv/config';

export default ({ config }) => {
  const env = process.env.APP_ENV ?? 'local';

  return {
    ...config,
    extra: {
      ...config.extra,
      env,
      API_URL: process.env.API_URL,
      SOCKET_URL: process.env.SOCKET_URL,
      eas: {
        projectId: "460b0d77-860d-4116-a777-adae29e8089d"
      }
    }
  };
};
