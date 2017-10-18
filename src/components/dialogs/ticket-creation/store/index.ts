import { ClientStorageHandler } from '@kix/core/dist/model/client';
import promiseMiddleware from 'redux-promise-middleware';
import { applyMiddleware, createStore } from 'redux';
import { TicketCreationReduxState } from './TicketCreationReduxState';

import reducer from './reducer';

export { TicketCreationReduxState } from './TicketCreationReduxState';

const STATE_ID = 'TicketCreationDialog';

const state = ClientStorageHandler.loadState<TicketCreationReduxState>(STATE_ID);
const store = createStore(reducer, state, applyMiddleware(
    promiseMiddleware()
));

// TODO: Really save on each change?
store.subscribe(() => {
    ClientStorageHandler.saveState<TicketCreationReduxState>(STATE_ID, store.getState());
});

module.exports = store;
