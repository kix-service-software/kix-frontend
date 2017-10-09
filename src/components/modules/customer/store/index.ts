import promiseMiddleware from 'redux-promise-middleware';
import { applyMiddleware, createStore } from 'redux';

import reducer from './reducer';

export { CustomerState } from './State';

// TODO: create einbauen
module.exports = createStore(reducer, {}, applyMiddleware(
    promiseMiddleware()
));
