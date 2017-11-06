import {
    ActionFailedResponse,
    ActionCannotRunResponse,
    ActionFinishedResponse,
    RunActionRequest,
    ActionEvent,
    SocketEvent
} from '@kix/core/dist/model/client';

import { SocketListener } from '@kix/core/dist/model/client/socket/SocketListener';
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
            this.actionSocket.close();
        });

        this.actionSocket.on(SocketEvent.CONNECT_TIMEOUT, () => {
            this.store.dispatch(ACTION_ERROR('Timeout!'));
            this.actionSocket.close();
        });

        this.actionSocket.on('error', (error) => {
            this.store.dispatch(ACTION_ERROR(String(error)));
            this.actionSocket.close();
        });

        this.actionSocket.on(ActionEvent.ACTION_CANNOT_RUN, (data: ActionCannotRunResponse) => {
            this.store.dispatch(ACTION_ERROR(data.message));
        });

        this.actionSocket.on(ActionEvent.ACTION_FAILED, (data: ActionFailedResponse) => {
            this.store.dispatch(ACTION_ERROR(data.message));
        });

        this.actionSocket.on(ActionEvent.ACTION_FINISHED, (data: ActionFinishedResponse) => {
            this.store.dispatch(ACTION_FINISHED());
        });
    }
}
