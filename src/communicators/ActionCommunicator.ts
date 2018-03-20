import { KIXCommunicator } from './KIXCommunicator';
import { KIXExtensions, IMainMenuExtension, IActionFactoryExtension } from '@kix/core/dist/extensions';

import {
    ActionCannotRunResponse,
    ActionFailedResponse,
    ActionEvent,
    SocketEvent,
    RunActionRequest,
} from '@kix/core/dist/model';

export class ActionCommunicator extends KIXCommunicator {

    private client: SocketIO.Socket;

    public getNamespace(): string {
        return 'action';
    }

    protected registerEvents(client: SocketIO.Socket): void {
        this.client = client;
        client.on(ActionEvent.RUN_ACTION, this.runAction.bind(this));
    }

    private async runAction(data: RunActionRequest) {
        const actionFactoryExtensions =
            await this.pluginService.getExtensions<IActionFactoryExtension>(KIXExtensions.ACTION);

        const actionFactory = actionFactoryExtensions.find((af) => af.getActionId() === data.actionId);
        const action = actionFactory.createAction();

        if (action.canRun(data.input)) {
            await action.run(data.input).then(() => {
                this.client.emit(ActionEvent.ACTION_FINISHED);
            }).catch((error) => {
                this.client.emit(ActionEvent.ACTION_FAILED, new ActionFailedResponse(error));
            });

        } else {
            this.client.emit(ActionEvent.ACTION_CANNOT_RUN, new ActionCannotRunResponse("Action cannot be executed."));
        }
    }

}

