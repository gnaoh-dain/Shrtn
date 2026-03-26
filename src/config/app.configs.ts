import { env } from './env';

export default () => ({
  app: {
    port: env.PORT,
    baseUrl: env.BASE_URL,
  },
});
