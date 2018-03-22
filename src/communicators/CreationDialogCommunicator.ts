import { KIXCommunicator } from './KIXCommunicator';
import {
    CreationDialog,
    CreationDialogEvent,
    LoadCreationDialogRequest,
    LoadCreationDialogResponse,
    SocketEvent
} from '@kix/core/dist/model';

import { ICreationDialogExtension, KIXExtensions } from '@kix/core/dist/extensions';
import { CommunicatorResponse } from '@kix/core/dist/common';

export class CreationDialogCommunicator extends KIXCommunicator {

    protected getNamespace(): string {
        return 'creation-dialog';
    }

    protected registerEvents(): void {
        this.registerEventHandler(CreationDialogEvent.LOAD_CREATION_DIALOGS, this.loadCreationDialogs.bind(this));
    }

    private async loadCreationDialogs(data: LoadCreationDialogRequest): Promise<CommunicatorResponse> {

        const createDialogExtensions = await this.pluginService
            .getExtensions<ICreationDialogExtension>(KIXExtensions.CREATION_DIALOG);

        const dialogs: CreationDialog[] = [];
        for (const dialog of createDialogExtensions) {
            dialogs.push(dialog.getDialog());
        }

        const loadResponse = new LoadCreationDialogResponse(dialogs);
        return new CommunicatorResponse(CreationDialogEvent.CREATION_DIALOGS_LOADED, loadResponse);
    }
}
