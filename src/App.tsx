import React, {type ReactElement} from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import 'overlayscrollbars/overlayscrollbars.css';
import './App.css';
import {DrawerComponent} from './components/DrawerComponent';
import {Watch} from './components/Watch';

const App = (): ReactElement => {
    return (
        <div>
            <p className="text-white">Nav</p>
            <div className="content-area mt-4 ml-8 mr-8">
                <BrowserRouter>
                    <Routes>
                        <Route
                            path="/watch/:episodeNumber?"
                            element={<Watch />}
                        />
                    </Routes>
                </BrowserRouter>
            </div>
        </div>
    );
};

export default App;
