import process from 'node:process';

export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
    // Conditionally add cssnano in production.
    // This relies on `process.env.NODE_ENV` being correctly set.
    // The `define` block in your vite.config.ts should handle this.
    ...(process.env.NODE_ENV === 'production' ? {cssnano: {}} : {}),
  },
};
