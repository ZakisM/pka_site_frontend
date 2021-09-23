import "react-app-polyfill/ie11";
import "react-app-polyfill/stable";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Provider } from "react-redux";
import store from "./redux/store";
import { createTheme, CssBaseline, MuiThemeProvider } from "@material-ui/core";
import "./App.css";
import "typeface-roboto";
import "raleway-webfont";

const darkTheme = createTheme({
    palette: {
        type: "dark",
        background: {
            default: "#0f0f0f",
        },
        primary: {
            main: "#151515",
        },
        secondary: {
            main: "#171717",
        },
    },
});

ReactDOM.render(
    <Provider store={store}>
        <MuiThemeProvider theme={darkTheme}>
            <CssBaseline />
            <App />
        </MuiThemeProvider>
    </Provider>,
    document.getElementById("root")
);
