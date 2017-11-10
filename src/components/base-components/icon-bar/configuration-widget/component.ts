import { TranslationHandler } from '@kix/core/dist/model/client';

import { ConfigurationWidgetComponentState } from './model/ConfigurationWidgetComponentState';
import { ConfigurationWidgetTranslationId } from './model/ConfigurationWidgetTranslationId';

class ConfigurationOverlay {

    private state: ConfigurationWidgetComponentState;

    private translationIds: any;

    public onCreate(input: any): void {
        this.state = new ConfigurationWidgetComponentState();
        this.translationIds = ConfigurationWidgetTranslationId;
    }

    public async onMount(input: any): Promise<void> {
        const translationHandler = await TranslationHandler.getInstance();
        this.state.translations = translationHandler.getTranslations([
            ConfigurationWidgetTranslationId.TITLE,
            ConfigurationWidgetTranslationId.PRE_DESCRIPTION,
            ConfigurationWidgetTranslationId.DESCRIPTION,
            ConfigurationWidgetTranslationId.OPEN_DIALOG,
            ConfigurationWidgetTranslationId.DESCRIPTION_INFO,
            ConfigurationWidgetTranslationId.START,
            ConfigurationWidgetTranslationId.STOP
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

    private getTranslation(id: ConfigurationWidgetTranslationId): string {
        return (this.state.translations && this.state.translations[id]) ? this.state.translations[id] : id.toString();
    }
}

module.exports = ConfigurationOverlay;
