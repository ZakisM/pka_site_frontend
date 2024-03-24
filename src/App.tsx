import 'overlayscrollbars/overlayscrollbars.css';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import './App.css';
import {NavBar} from './components/NavBar';
import {Watch} from './components/Watch';

const App = () => {
  return (
    <div>
      <NavBar />
      <div className="p-4 content-area">
        <BrowserRouter>
          <Routes>
            <Route path="/watch/:episodeNumber?" element={<Watch />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
};

export default App;
