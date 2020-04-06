import {applyMiddleware, createStore, StoreEnhancer} from "redux";
import {rootReducer} from "./index";
import {composeWithDevTools} from "redux-devtools-extension";
import {createBrowserHistory} from 'history';
import thunk from "redux-thunk";
import {routerMiddleware} from "connected-react-router";

export const history = createBrowserHistory();

const middlewares = [thunk, routerMiddleware(history)];
const middlewareEnhancer = applyMiddleware(...middlewares);
const enhancers = [middlewareEnhancer];
const composedEnhancer: StoreEnhancer = composeWithDevTools(...enhancers);

export default createStore(rootReducer(history), composedEnhancer);