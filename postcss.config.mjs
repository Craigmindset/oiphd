import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/** @type {import('postcss-load-config').Config} */
export default {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
};

