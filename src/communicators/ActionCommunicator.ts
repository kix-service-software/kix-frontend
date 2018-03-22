import { KIXCommunicator } from './KIXCommunicator';
import { KIXExtensions, IMainMenuExtension, IActionFactoryExtension } from '@kix/core/dist/extensions';

import {
    ActionCannotRunResponse,
    ActionFailedResponse,
    ActionEvent,
    SocketEvent,
    RunActionRequest,
} from '@kix/core/dist/model';
import { CommunicatorResponse } from '@kix/core/dist/common';

export class ActionCommunicator extends KIXCommunicator {

    protected getNamespace(): string {
        return 'action';
    }

    protected registerEvents(): void {
        this.registerEventHandler(ActionEvent.RUN_ACTION, this.runAction.bind(this));
    }

    private async runAction(data: RunActionRequest): Promise<CommunicatorResponse> {
        const actionFactoryExtensions =
            await this.pluginService.getExtensions<IActionFactoryExtension>(KIXExtensions.ACTION);

        const actionFactory = actionFactoryExtensions.find((af) => af.getActionId() === data.actionId);
        const action = actionFactory.createAction();

        if (action.canRun(data.input)) {
            await action.run(data.input).then(() => {
                return new CommunicatorResponse(ActionEvent.ACTION_FINISHED);
            }).catch((error) => {
                return new CommunicatorResponse(ActionEvent.ACTION_FAILED, new ActionFailedResponse(error));
            });

        } else {
            return new CommunicatorResponse(
                ActionEvent.ACTION_CANNOT_RUN,
                new ActionCannotRunResponse("Action cannot be executed."));
        }
    }
}

