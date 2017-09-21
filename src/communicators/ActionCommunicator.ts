import { KIXCommunicator } from './KIXCommunicator';
import {
    RunActionRequest,
    KIXExtensions,
    ActionEvent,
    IMainMenuExtension,
    SocketEvent,
    IActionFactoryExtension,
    ActionCannotRunResponse,
    ActionFailedResponse
} from '@kix/core';

export class ActionCommunicator extends KIXCommunicator {

    public registerNamespace(socketIO: SocketIO.Server): void {
        const nsp = socketIO.of('/action');
        nsp
            .use(this.authenticationService.isSocketAuthenticated.bind(this.authenticationService))
            .on(SocketEvent.CONNECTION, (client: SocketIO.Socket) => {
                this.registerActionEvents(client);
            });
    }

    private registerActionEvents(client: SocketIO.Socket): void {
        client.on(ActionEvent.RUN_ACTION, async (data: RunActionRequest) => {

            const actionFactoryExtensions =
                await this.pluginService.getExtensions<IActionFactoryExtension>(KIXExtensions.ACTION);

            const actionFactory = actionFactoryExtensions.find((af) => af.getActionId() === data.actionId);
            const action = actionFactory.createAction();

            if (action.canRun(data.input)) {
                await action.run(data.input).then(() => {
                    client.emit(ActionEvent.ACTION_FINISHED);
                }).catch((error) => {
                    client.emit(ActionEvent.ACTION_FAILED, new ActionFailedResponse(error));
                });

            } else {
                client.emit(ActionEvent.ACTION_CANNOT_RUN, new ActionCannotRunResponse("Action cannot be executed."));
            }
        });
    }

}

