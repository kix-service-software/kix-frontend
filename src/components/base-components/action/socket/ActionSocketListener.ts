import { ActionFinishedResponse } from './../../../../model/client/socket/action/ActionFinishedResponse';
import { RunActionRequest } from './../../../../model/client/socket/action/RunActionRequest';
import { SocketListener } from '../../../../model/client/socket/SocketListener';
import { ActionEvent } from './../../../../model/client/socket/action/';
import { SocketEvent } from '../../../../model/client/socket/SocketEvent';
import {
    ACTION_ERROR,
    ACTION_FINISHED
} from '../store/actions';

export class ActionSocketListener extends SocketListener {

    private actionSocket: SocketIO.Server;

    private store: any;

    public constructor(store: any) {
        super();

        this.actionSocket = this.createSocket("action");
        this.store = store;
        this.initActionSocketListener();
    }

    public runAction(runActionRequest: RunActionRequest): void {
        this.actionSocket.emit(ActionEvent.RUN_ACTION, runActionRequest);
    }

    private initActionSocketListener(): void {
        this.actionSocket.on(SocketEvent.CONNECT, () => {
            this.store.dispatch(ACTION_ERROR(null));
        });

        this.actionSocket.on(SocketEvent.CONNECT_ERROR, (error) => {
            this.store.dispatch(ACTION_ERROR(String(error)));
        });

        this.actionSocket.on(SocketEvent.CONNECT_TIMEOUT, () => {
            this.store.dispatch(ACTION_ERROR('Timeout!'));
        });

        this.actionSocket.on('error', (error) => {
            this.store.dispatch(ACTION_ERROR(String(error)));
        });

        this.actionSocket.on(ActionEvent.ACTION_FINISHED, (data: ActionFinishedResponse) => {
            this.store.dispatch(ACTION_FINISHED());
        });
    }
}
