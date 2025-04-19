import 'overlayscrollbars/overlayscrollbars.css';
import './App.css';
import {NavBar} from './components/NavBar';
import {Watch} from './components/Watch';

const App = () => {
  return (
    <div>
      <NavBar />
      <div className="p-4 content-area"></div>
    </div>
  );
};

export default App;
