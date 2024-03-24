import '@fontsource/raleway/800.css';
import 'core-js/stable';
import 'typeface-roboto';
import App from './App.tsx';
import '@fontsource/raleway/800.css';
import 'core-js/stable';
import {createRoot} from 'react-dom/client';
import 'typeface-roboto';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Failed to find element for createRoot.');
}

const root = createRoot(container);
root.render(<App />);
