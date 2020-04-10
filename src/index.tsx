import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {Provider} from "react-redux";
import store from "./redux/store";
import {createMuiTheme, CssBaseline, MuiThemeProvider} from "@material-ui/core";
import 'typeface-roboto';
import 'raleway-webfont';

const darkTheme = createMuiTheme({
    palette: {
        type: 'dark',
        background: {
            default: '#0f0f0f',
        },
        primary: {
            main: '#4d1419',
        }
    },
});

ReactDOM.render(
    <Provider store={store}>
        <MuiThemeProvider theme={darkTheme}>
            <CssBaseline/>
            <App/>
        </MuiThemeProvider>
    </Provider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
