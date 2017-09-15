import { RunActionRequest } from './../../../model/client/socket/action/RunActionRequest';
import { ActionSocketListener } from './socket/ActionSocketListener';
import { DELETE_ACTION_INITIALIZE } from './store/actions';

export class ActionComponent {

    private store: any;

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            action: input.action,
            running: false
        };
    }

    public onMount(): void {
        this.store = require('./store').create();
        this.store.subscribe(this.stateChanged.bind(this));
        this.store.dispatch(DELETE_ACTION_INITIALIZE(this.store));
    }

    public stateChanged(): void {
        const reduxState = this.store.getState();
        this.state.running = reduxState.running;
    }

    public doAction(): void {
        // TODO: Dispatch Action to invoke action
        this.state.running = true;
        const socketListener: ActionSocketListener = this.store.getState().socketListener;
        socketListener.runAction(new RunActionRequest(this.state.action.id, {}));
    }

}

module.exports = ActionComponent;
