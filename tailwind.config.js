/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./src/**/*.tsx'],
  theme: {
    extend: {
      fontFamily: {
        // Sets default sans-serif font to Roboto
        sans: ['Roboto'],
        // Adds a custom font family 'raleway'
        raleway: ['Raleway'],
      },
      height: {
        // Adds a custom height utility for navigation bar
        'nav-height': '50px',
      },
    },
  },
  plugins: [
    // Add any Tailwind plugins here
  ],
};

// Export the configuration using ES Module syntax
export default config;
