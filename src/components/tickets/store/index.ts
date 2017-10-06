import promiseMiddleware from 'redux-promise-middleware';
import { applyMiddleware, createStore } from 'redux';

import reducer from './reducer';

export { TicketsState } from './TicketState';

// TODO: create einbauen
module.exports = createStore(reducer, {}, applyMiddleware(
    promiseMiddleware()
));
