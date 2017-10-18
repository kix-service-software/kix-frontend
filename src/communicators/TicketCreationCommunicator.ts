import { SocketEvent } from '@kix/core';
import { KIXCommunicator } from './KIXCommunicator';

export class TicketCreationCommunicator extends KIXCommunicator {
    public registerNamespace(socketIO: SocketIO.Server): void {
        const nsp = socketIO.of('/ticket-creation');
        nsp.on(SocketEvent.CONNECTION, (client: SocketIO.Socket) => {
            this.registerEvents(client);
        });
    }

    private registerEvents(client: SocketIO.Socket): void {
        // client.on(TicketCreationEvent.LOAD_TRANSLATIONS, async (data: LoadTranslationRequest) => {
        //     client.emit(TranslationEvent.TRANSLATIONS_LOADED, new LoadTranslationResponse(translations));
        // });
    }
}
