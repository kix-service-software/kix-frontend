import { KIXCommunicator } from './KIXCommunicator';
import {
    ICreateObjectDialogExtension,
    CreateDialog,
    CreateDialogEvent,
    LoadCreateDialogRequest,
    LoadCreateDialogResponse,
    SocketEvent,
    KIXExtensions
} from '@kix/core';

const CREATE_DIALOG = "create-dialog";

export class CreateDialogCommunicator extends KIXCommunicator {

    public registerNamespace(socketIO: SocketIO.Server): void {
        const nsp = socketIO.of('/' + CREATE_DIALOG);
        nsp
            .use(this.authenticationService.isSocketAuthenticated.bind(this.authenticationService))
            .on(SocketEvent.CONNECTION, (client: SocketIO.Socket) => {
                this.registerEvents(client);
            });
    }

    private registerEvents(client: SocketIO.Socket): void {
        client.on(CreateDialogEvent.LOAD_CREATE_DIALOGS, async (data: LoadCreateDialogRequest) => {

            const createDialogExtensions = await this.pluginService
                .getExtensions<ICreateObjectDialogExtension>(KIXExtensions.CREATE_OBJECT_DIALOG);

            const dialogs: CreateDialog[] = [];
            for (const dialog of createDialogExtensions) {
                dialogs.push(dialog.getDialog());
            }

            const loadResponse = new LoadCreateDialogResponse(dialogs);
            client.emit(CreateDialogEvent.CREATE_DIALOGS_LOADED, loadResponse);
        });
    }

}
