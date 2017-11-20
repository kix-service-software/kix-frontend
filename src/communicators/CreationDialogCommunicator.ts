import { KIXCommunicator } from './KIXCommunicator';
import {
    CreationDialog,
    CreationDialogEvent,
    LoadCreationDialogRequest,
    LoadCreationDialogResponse,
    SocketEvent
} from '@kix/core/dist/model';

import { ICreationDialogExtension, KIXExtensions } from '@kix/core/dist/extensions';

const CREATION_DIALOG = "creation-dialog";

export class CreationDialogCommunicator extends KIXCommunicator {

    public registerNamespace(socketIO: SocketIO.Server): void {
        const nsp = socketIO.of('/' + CREATION_DIALOG);
        nsp
            .use(this.authenticationService.isSocketAuthenticated.bind(this.authenticationService))
            .on(SocketEvent.CONNECTION, (client: SocketIO.Socket) => {
                this.registerEvents(client);
            });
    }

    private registerEvents(client: SocketIO.Socket): void {
        client.on(CreationDialogEvent.LOAD_CREATION_DIALOGS, async (data: LoadCreationDialogRequest) => {

            const createDialogExtensions = await this.pluginService
                .getExtensions<ICreationDialogExtension>(KIXExtensions.CREATION_DIALOG);

            const dialogs: CreationDialog[] = [];
            for (const dialog of createDialogExtensions) {
                dialogs.push(dialog.getDialog());
            }

            const loadResponse = new LoadCreationDialogResponse(dialogs);
            client.emit(CreationDialogEvent.CREATION_DIALOGS_LOADED, loadResponse);
        });
    }

}
