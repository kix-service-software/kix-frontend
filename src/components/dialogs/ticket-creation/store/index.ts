import { TicketCreationSocketListener } from './../socket/TicketCreationSocketListener';
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

    public static getInstance(): CreationTicketStore {
        if (!CreationTicketStore.INSTANCE) {
            CreationTicketStore.INSTANCE = new CreationTicketStore();
        }

        return CreationTicketStore.INSTANCE;
    }

    private static INSTANCE = null;

    private store: any;

    private stateListener: Array<() => void> = [];

    private constructor() {
        this.initialize();
    }

    public addStateListener(listener: () => void): void {
        this.stateListener.push(listener);
        this.store.subscribe(listener);
    }

    public getStore(): any {
        return this.store;
    }

    public getProcessState(): TicketCreationProcessReduxState {
        return this.getStore().getState().ticketProcessState;
    }

    public getTicketState(): TicketCreationReduxState {
        return this.getStore().getState().ticketState;
    }

    public getSocketListener(): TicketCreationSocketListener {
        return this.getProcessState().socketListener;
    }

    private initialize(): void {
        const state = ClientStorageHandler.loadState<TicketCreationReduxState>(STATE_ID);

        const reducer = combineReducers({
            ticketState,
            ticketProcessState
        });

        this.store = createStore(reducer, { ticketState: state }, applyMiddleware(
            promiseMiddleware()
        ));

        for (const listener of this.stateListener) {
            this.store.subscribe(listener);
        }
    }
}
