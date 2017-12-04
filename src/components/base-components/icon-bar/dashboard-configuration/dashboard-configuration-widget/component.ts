import { TranslationHandler } from '@kix/core/dist/browser/TranslationHandler';
import { ApplicationStore } from '@kix/core/dist/browser/application/ApplicationStore';

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
        ApplicationStore.getInstance().addStateListener(this.applicationStateChanged.bind(this));
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
        ApplicationStore.getInstance().toggleConfigurationMode();
    }

    private openDashboardConfigurationDialog(): void {
        this.toggleDashboardConfigurationWidget();
        ApplicationStore.getInstance().toggleDialog(
            require('../dashboard-configuration-dialog'),
            { title: 'Dashboard Config - Paltzhalter-Titel' }
        );
    }

    private getTranslation(id: DashboardConfigurationWidgetTranslationId): string {
        return (this.state.translations && this.state.translations[id]) ? this.state.translations[id] : id.toString();
    }

    private applicationStateChanged() {
        (this as any).setStateDirty();
    }

    private isConfigMode(): boolean {
        return ApplicationStore.getInstance().isConfigurationMode();
    }

    private isConfigDialogShown(): boolean {
        return ApplicationStore.getInstance().isShowDialog();
    }
}

module.exports = DashboardConfigurationWidget;
