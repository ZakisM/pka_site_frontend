/** @type {import('postcss-load-config').Config} */
import process from 'node:process';
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
    // Conditionally add cssnano in production.
    // This relies on `process.env.NODE_ENV` being correctly set.
    // The `define` block in your vite.config.ts should handle this.
    ...(process.env.NODE_ENV === 'production' ? {cssnano: {}} : {}),
  },
};

// Use export default for ES Module syntax
export default config;
