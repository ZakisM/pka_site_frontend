import {routerMiddleware} from 'connected-react-router';
import {createBrowserHistory} from 'history';
import {type StoreEnhancer, applyMiddleware, createStore} from 'redux';
import {composeWithDevTools} from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import {rootReducer} from './index';

export const history = createBrowserHistory();

const middlewares = [thunk, routerMiddleware(history)];
const middlewareEnhancer = applyMiddleware(...middlewares);
const enhancers = [middlewareEnhancer];
const composedEnhancer: StoreEnhancer = composeWithDevTools(...enhancers);

export default createStore(rootReducer(history), composedEnhancer);
