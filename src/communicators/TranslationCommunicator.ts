import { KIXCommunicator } from './KIXCommunicator';
import {
    LoadTranslationRequest,
    LoadTranslationResponse,
    SocketEvent,
    TranslationEvent
} from '@kix/core/dist/model';

export class TranslationCommunicator extends KIXCommunicator {

    private client: SocketIO.Socket;

    public getNamespace(): string {
        return 'translation';
    }

    protected registerEvents(client: SocketIO.Socket): void {
        this.client = client;
        client.on(TranslationEvent.LOAD_TRANSLATIONS, this.loadTranslations.bind(this));
    }

    private async loadTranslations(data: LoadTranslationRequest): Promise<void> {
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

        this.client.emit(TranslationEvent.TRANSLATIONS_LOADED, new LoadTranslationResponse(translations));
    }
}
