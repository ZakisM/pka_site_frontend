import '@fontsource-variable/raleway';
import '@fontsource-variable/roboto';
import 'core-js/stable';
import App from './App.tsx';
import {createRoot} from 'react-dom/client';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Failed to find element for createRoot.');
}

const root = createRoot(container);
root.render(<App />);
