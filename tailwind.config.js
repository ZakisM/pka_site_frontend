/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.tsx'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Roboto'],
                raleway: ['Raleway'],
            },
            height: {
                'nav-height': '50px',
            },
        },
    },
    plugins: [],
};
