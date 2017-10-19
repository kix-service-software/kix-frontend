import { ClientStorageHandler } from '@kix/core/dist/model/client';
import promiseMiddleware from 'redux-promise-middleware';
import { applyMiddleware, createStore } from 'redux';
import { TicketCreationReduxState } from './TicketCreationReduxState';

import reducer from './reducer';

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
        this.store = createStore(reducer, state, applyMiddleware(
            promiseMiddleware()
        ));
    }

    public getStore(): any {
        return this.store;
    }

}
