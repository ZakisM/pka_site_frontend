import {applyMiddleware, createStore, StoreEnhancer} from "redux";
import {rootReducer} from "./index";
import {composeWithDevTools} from "redux-devtools-extension";
import thunk from "redux-thunk";

const middlewares = [thunk];
const middlewareEnhancer = applyMiddleware(...middlewares);
const enhancers = [middlewareEnhancer];
const composedEnhancer: StoreEnhancer = composeWithDevTools(...enhancers);

export default createStore(rootReducer, composedEnhancer);