import { ApplicationService } from '@kix/core/dist/browser/application/ApplicationService';

import { DashboardConfigurationWidgetComponentState } from './model/DashboardConfigurationWidgetComponentState';

class DashboardConfigurationWidget {

    private state: DashboardConfigurationWidgetComponentState;

    public onCreate(input: any): void {
        this.state = new DashboardConfigurationWidgetComponentState();
    }

    private toggleDashboardConfigurationWidget(): void {
        this.state.showDashboardConfigurationWidget = !this.state.showDashboardConfigurationWidget;
    }

    private toggleConfigurationMode(): void {
        this.toggleDashboardConfigurationWidget();
        ApplicationService.getInstance().toggleConfigurationMode();
    }

    private openDashboardConfigurationDialog(): void {
        this.toggleDashboardConfigurationWidget();
        ApplicationService.getInstance().toggleMainDialog(
            'dashboard-configuration-dialog',
            { title: 'Dashboard Config - Paltzhalter-Titel' }
        );
    }

    private isConfigMode(): boolean {
        return ApplicationService.getInstance().isConfigurationMode();
    }

    private isConfigDialogShown(): boolean {
        return ApplicationService.getInstance().isShowMainDialog();
    }
}

module.exports = DashboardConfigurationWidget;
