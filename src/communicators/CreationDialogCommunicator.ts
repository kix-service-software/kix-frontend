import { KIXCommunicator } from './KIXCommunicator';
import {
    CreationDialog,
    CreationDialogEvent,
    LoadCreationDialogRequest,
    LoadCreationDialogResponse,
    SocketEvent
} from '@kix/core/dist/model';

import { ICreationDialogExtension, KIXExtensions } from '@kix/core/dist/extensions';

export class CreationDialogCommunicator extends KIXCommunicator {

    private client: SocketIO.Socket;

    public getNamespace(): string {
        return 'creation-dialog';
    }

    protected registerEvents(client: SocketIO.Socket): void {
        this.client = client;
        client.on(CreationDialogEvent.LOAD_CREATION_DIALOGS, this.loadCreationDialogs.bind(this));
    }

    private async loadCreationDialogs(data: LoadCreationDialogRequest): Promise<void> {

        const createDialogExtensions = await this.pluginService
            .getExtensions<ICreationDialogExtension>(KIXExtensions.CREATION_DIALOG);

        const dialogs: CreationDialog[] = [];
        for (const dialog of createDialogExtensions) {
            dialogs.push(dialog.getDialog());
        }

        const loadResponse = new LoadCreationDialogResponse(dialogs);
        this.client.emit(CreationDialogEvent.CREATION_DIALOGS_LOADED, loadResponse);
    }
}
