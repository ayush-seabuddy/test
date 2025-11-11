// app.config.ts
import 'dotenv/config';

export default ({ config }) => {
  const env = process.env.APP_ENV ?? 'local';

  const API_URL = process.env.API_URL;
  const SOCKET_URL = process.env.SOCKET_URL;


  return {
    ...config,
    extra: {
      env,
      API_URL, 
      SOCKET_URL
    },
  };
};