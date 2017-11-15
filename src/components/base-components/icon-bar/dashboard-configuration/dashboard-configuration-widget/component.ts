import { TranslationHandler } from '@kix/core/dist/model/client';

import { DashboardConfigurationWidgetComponentState } from './model/DashboardConfigurationWidgetComponentState';
import { DashboardConfigurationWidgetTranslationId } from './model/DashboardConfigurationWidgetTranslationId';

class DashboardConfigurationWidget {

    private state: DashboardConfigurationWidgetComponentState;

    private translationIds: any;

    public onCreate(input: any): void {
        this.state = new DashboardConfigurationWidgetComponentState();
        this.translationIds = DashboardConfigurationWidgetTranslationId;
    }

    public async onMount(input: any): Promise<void> {
        const translationHandler = await TranslationHandler.getInstance();
        this.state.translations = translationHandler.getTranslations([
            DashboardConfigurationWidgetTranslationId.TITLE,
            DashboardConfigurationWidgetTranslationId.PRE_DESCRIPTION,
            DashboardConfigurationWidgetTranslationId.DESCRIPTION,
            DashboardConfigurationWidgetTranslationId.OPEN_DIALOG,
            DashboardConfigurationWidgetTranslationId.DESCRIPTION_INFO,
            DashboardConfigurationWidgetTranslationId.START,
            DashboardConfigurationWidgetTranslationId.STOP
        ]);
    }

    private toggleDashboardConfigurationWidget(): void {
        this.state.showDashboardConfigurationWidget = !this.state.showDashboardConfigurationWidget;
    }

    private toggleConfigurationMode(): void {
        this.toggleDashboardConfigurationWidget();
        this.state.configurationMode = !this.state.configurationMode;
        (this as any).emit('toggleConfigurationMode');
    }

    private openDashboardConfigurationDialog(): void {
        this.toggleDashboardConfigurationWidget();
        this.state.showDashboardConfigurationDialog = true;
    }

    private closeDashboardConfigurationDialog(): void {
        this.state.showDashboardConfigurationDialog = false;
    }

    private getTranslation(id: DashboardConfigurationWidgetTranslationId): string {
        return (this.state.translations && this.state.translations[id]) ? this.state.translations[id] : id.toString();
    }
}

module.exports = DashboardConfigurationWidget;
