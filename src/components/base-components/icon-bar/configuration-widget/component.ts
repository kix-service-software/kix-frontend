import { TranslationHandler } from '@kix/core/dist/model/client';

import { ConfigurationOverlayComponentState } from './model/ConfigurationOverlayComponentState';
import { ConfigurationOverlayTranslationId } from './model/ConfigurationOverlayTranslationId';

class ConfigurationOverlay {

    private state: ConfigurationOverlayComponentState;

    private translationIds: any;

    public onCreate(input: any): void {
        this.state = new ConfigurationOverlayComponentState();
        this.translationIds = ConfigurationOverlayTranslationId;
    }

    public async onMount(input: any): Promise<void> {
        const translationHandler = await TranslationHandler.getInstance();
        this.state.translations = translationHandler.getTranslations([
            ConfigurationOverlayTranslationId.TITLE,
            ConfigurationOverlayTranslationId.PRE_DESCRIPTION,
            ConfigurationOverlayTranslationId.DESCRIPTION,
            ConfigurationOverlayTranslationId.OPEN_DIALOG,
            ConfigurationOverlayTranslationId.DESCRIPTION_INFO,
            ConfigurationOverlayTranslationId.START,
            ConfigurationOverlayTranslationId.STOP
        ]);
    }

    private toggleConfigurationWidget(): void {
        this.state.showConfigurationWidget = !this.state.showConfigurationWidget;
    }

    private toggleConfigurationMode(): void {
        this.toggleConfigurationWidget();
        this.state.configurationMode = !this.state.configurationMode;
        (this as any).emit('toggleConfigurationMode');
    }

    private openConfigurationDialog(): void {
        this.toggleConfigurationWidget();
        this.state.showConfigurationDialog = true;
    }

    private closeConfigurationDialog(): void {
        this.state.showConfigurationDialog = false;
    }

    private getTranslation(id: ConfigurationOverlayTranslationId): string {
        return (this.state.translations && this.state.translations[id]) ? this.state.translations[id] : id.toString();
    }
}

module.exports = ConfigurationOverlay;
