import promiseMiddleware from 'redux-promise-middleware';
import { applyMiddleware, createStore } from 'redux';

import combineReducer from './reducers';

module.exports = createStore(combineReducer, {}, applyMiddleware(
    promiseMiddleware()
));
