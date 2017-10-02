import { KIXCommunicator } from './KIXCommunicator';
import {
    LoadTranslationRequest,
    LoadTranslationResponse,
    SocketEvent,
    TranslationEvent
} from '@kix/core';

export class TranslationCommunicator extends KIXCommunicator {

    public registerNamespace(socketIO: SocketIO.Server): void {
        const nsp = socketIO.of('/translation');
        nsp.on(SocketEvent.CONNECTION, (client: SocketIO.Socket) => {
            this.registerUsersEvents(client);
        });
    }

    private registerUsersEvents(client: SocketIO.Socket): void {
        client.on(TranslationEvent.LOAD_TRANSLATIONS, async (data: LoadTranslationRequest) => {
            // TODO: Get language shortcut from personal settings of user. Token is optional.
            // TODO: If no token then use default language setting.
            const translations = this.translationService.getTranslations(data.ids, "de");

            client.emit(TranslationEvent.TRANSLATIONS_LOADED, new LoadTranslationResponse(translations));
        });
    }

}
