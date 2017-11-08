import { TranslationHandler } from '@kix/core/dist/model/client';

import { ConfigurationOverlayComponentState } from './model/ConfigurationOverlayComponentState';
import { ConfigurationOverlayTranslationId } from './model/ConfigurationOverlayTranslationId';

class ConfigurationOverlay {

    public state: ConfigurationOverlayComponentState;

    public translationIds: any;

    public onCreate(input: any): void {
        this.state = new ConfigurationOverlayComponentState();
        this.translationIds = ConfigurationOverlayTranslationId;
    }

    public async onMount(input: any): Promise<void> {
        const translationHandler = await TranslationHandler.getInstance();
        this.state.translations = translationHandler.getTranslations([
            ConfigurationOverlayTranslationId.TITLE,
            ConfigurationOverlayTranslationId.OPEN_DIALOG,
            ConfigurationOverlayTranslationId.DESCRIPTION,
            ConfigurationOverlayTranslationId.START,
            ConfigurationOverlayTranslationId.STOP
        ]);
    }

    public toggleConfigurationMode(): void {
        this.state.configurationMode = !this.state.configurationMode;
        (this as any).emit('toggleConfigurationMode');
    }

    public getTranslation(id: ConfigurationOverlayTranslationId): string {
        return (this.state.translations && this.state.translations[id]) ? this.state.translations[id] : id.toString();
    }

    // TODO: remove - nur Platzhalter bis "header" in icon-bar ist
    public toggleConfigurationOverlay(): void {
        (this as any).emit('toggleConfigurationOverlay');
    }
}

module.exports = ConfigurationOverlay;
