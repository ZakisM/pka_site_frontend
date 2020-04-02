import React from 'react';
import RootComponent from "./components/RootComponent";
import "./App.css";

export const SERVER_IP = `${window.location.hostname}:3030`;

const App: React.FC = () => {
    return (
        <div className="App">
            <RootComponent/>
        </div>
    );
};

export default App;
