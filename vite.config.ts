import { defineConfig } from 'vite';
import license from 'rollup-plugin-license';
import path from 'node:path';

export default defineConfig({
  base: '/',
  define: { __BUILD_ID__: JSON.stringify((process.env.COMMIT_REF ?? 'dev').slice(0, 7)) },
  build: { chunkSizeWarningLimit: 1600 },
  server: { port: 8080, strictPort: true },
  plugins: [
    {
      ...license({
        thirdParty: { includePrivate: false, output: { file: path.resolve('dist/licenses.txt') } },
      }),
      apply: 'build',
      enforce: 'post',
    },
  ],
});
