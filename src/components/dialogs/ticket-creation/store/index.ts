import promiseMiddleware from 'redux-promise-middleware';
import { applyMiddleware, createStore } from 'redux';

import reducer from './reducer';

export { TicketCreationReduxState } from './TicketCreationReduxState';

module.exports = createStore(reducer, {}, applyMiddleware(
    promiseMiddleware()
));
