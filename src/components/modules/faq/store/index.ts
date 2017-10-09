import promiseMiddleware from 'redux-promise-middleware';
import { applyMiddleware, createStore } from 'redux';

import reducer from './reducer';

export { FAQState } from './State';

// TODO: create einbauen
module.exports = createStore(reducer, {}, applyMiddleware(
    promiseMiddleware()
));
