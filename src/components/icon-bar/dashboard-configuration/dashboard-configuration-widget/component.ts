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

    private toggleDashboardConfigurationWidget(): void {
        this.state.showDashboardConfigurationWidget = !this.state.showDashboardConfigurationWidget;
    }

    private toggleConfigurationMode(): void {
        this.toggleDashboardConfigurationWidget();
        ApplicationStore.getInstance().toggleConfigurationMode();
    }

    private openDashboardConfigurationDialog(): void {
        this.toggleDashboardConfigurationWidget();
        ApplicationStore.getInstance().toggleMainDialog(
            'dashboard-configuration-dialog',
            { title: 'Dashboard Config - Paltzhalter-Titel' }
        );
    }

    private isConfigMode(): boolean {
        return ApplicationStore.getInstance().isConfigurationMode();
    }

    private isConfigDialogShown(): boolean {
        return ApplicationStore.getInstance().isShowMainDialog();
    }
}

module.exports = DashboardConfigurationWidget;
