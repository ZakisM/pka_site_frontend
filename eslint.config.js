import reactCompilerPlugin from 'eslint-plugin-react-compiler';

export default [
  {
    plugins: {
      'react-compiler': reactCompilerPlugin,
    },
    rules: {
      'react-compiler/react-compiler': 'error',
    },
  },
];
