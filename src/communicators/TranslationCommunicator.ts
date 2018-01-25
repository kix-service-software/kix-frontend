import { KIXCommunicator } from './KIXCommunicator';
import {
    LoadTranslationRequest,
    LoadTranslationResponse,
    SocketEvent,
    TranslationEvent
} from '@kix/core/dist/model';

export class TranslationCommunicator extends KIXCommunicator {

    public registerNamespace(socketIO: SocketIO.Server): void {
        const nsp = socketIO.of('/translation');
        nsp.on(SocketEvent.CONNECTION, (client: SocketIO.Socket) => {
            this.registerUsersEvents(client);
        });
    }

    private registerUsersEvents(client: SocketIO.Socket): void {
        client.on(TranslationEvent.LOAD_TRANSLATIONS, async (data: LoadTranslationRequest) => {
            // TODO: Get default language.
            const language = 'de';
            if (data.token) {
                // TODO: Get language shortcut from personal settings of user.
            }

            let translations = {};
            if (!data.ids || data.ids.length === 0) {
                translations = this.translationService.getAllTranslations(language);
            } else {
                translations = this.translationService.getTranslations(data.ids, language);
            }

            client.emit(TranslationEvent.TRANSLATIONS_LOADED, new LoadTranslationResponse(translations));
        });
    }

}
