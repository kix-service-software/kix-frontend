import promiseMiddleware from 'redux-promise-middleware';
import { applyMiddleware, createStore } from 'redux';

import reducer from './reducer';

export { LoginState } from './LoginState';

module.exports = createStore(reducer, {}, applyMiddleware(
    promiseMiddleware()
));
