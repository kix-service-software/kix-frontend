import { RunActionRequest } from './../../../model/client/socket/action/RunActionRequest';
import { DeleteActionSocketListener } from './socket/DeleteActionSocketListener';
import { DELETE_ACTION_INITIALIZE } from './store/actions';

class DeleteActionComponent {

    public state: any;

    private store: any;

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
        this.state.running = true;
        const socketListener: DeleteActionSocketListener = this.store.getState().socketListener;
        socketListener.runAction(new RunActionRequest(this.state.action.id, {}));
    }

}

module.exports = DeleteActionComponent;
