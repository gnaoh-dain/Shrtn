import { env } from './env';

export default () => ({
  database: {
    url: env.DATABASE_URL,
  },
});
