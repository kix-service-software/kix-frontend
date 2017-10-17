import { TicketCreationReduxState } from './../store/TicketCreationReduxState';

export abstract class AbstractTicketCreationInputComponent {

    protected state: any;

    protected store: any;

    public initialize(stateChanged: (state: TicketCreationReduxState) => void): void {
        this.store = require('../store');
        this.store.subscribe(stateChanged.bind(this));
    }

}
