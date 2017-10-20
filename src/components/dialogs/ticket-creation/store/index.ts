import { TicketCreationProcessReduxState } from './TicketCreationProcessReduxState';
import { ClientStorageHandler } from '@kix/core/dist/model/client';
import promiseMiddleware from 'redux-promise-middleware';
import { applyMiddleware, createStore, combineReducers } from 'redux';
import { TicketCreationReduxState } from './TicketCreationReduxState';

import ticketState from './reducers/TicketStateReducer';
import ticketProcessState from './reducers/TicketProcessReducer';

export { TicketCreationReduxState } from './TicketCreationReduxState';

const STATE_ID = 'TicketCreationDialog';

export class CreationTicketStore {

    public static INSTANCE = new CreationTicketStore();

    private store: any;

    private constructor() {
        this.initialize();
    }

    public initialize(): void {
        const state = ClientStorageHandler.loadState<TicketCreationReduxState>(STATE_ID);

        const reducer = combineReducers({
            ticketState,
            ticketProcessState
        });

        this.store = createStore(reducer, { ticketState: state }, applyMiddleware(
            promiseMiddleware()
        ));
    }

    public getStore(): any {
        return this.store;
    }

}
