import { KIXCommunicator } from './KIXCommunicator';
import {
    LoadTranslationRequest,
    LoadTranslationResponse,
    SocketEvent,
    TranslationEvent
} from '@kix/core/dist/model';
import { CommunicatorResponse } from '@kix/core/dist/common';

export class TranslationCommunicator extends KIXCommunicator {

    protected getNamespace(): string {
        return 'translation';
    }

    protected registerEvents(): void {
        this.registerEventHandler(TranslationEvent.LOAD_TRANSLATIONS, this.loadTranslations.bind(this));
    }

    private async loadTranslations(data: LoadTranslationRequest): Promise<CommunicatorResponse> {
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

        return new CommunicatorResponse(
            TranslationEvent.TRANSLATIONS_LOADED,
            new LoadTranslationResponse(translations));
    }
}
