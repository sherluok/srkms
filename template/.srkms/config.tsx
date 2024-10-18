import { defineConfig } from 'srkms';

export default defineConfig({
  database: [
    {
      type: 'local-sqlite-file',
      path: 'db.sqlite3',
    },
    {
      type: 'remote-database-api',
      endpoint: 'http://localhost:8081/api/v1/',
    },
    {
      type: 'cloudflare-d1',
      accessConfig: {
        type: 'env-file',
        path: './.env',
      },
    },
  ],
});
