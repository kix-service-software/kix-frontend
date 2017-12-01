import { TicketsComponentState } from './model/TicketsComponentState';
import { DashboardStore } from '@kix/core/dist/browser/dashboard/DashboardStore';

class TicketsComponent {

    public state: TicketsComponentState;

    public store: any;

    public onCreate(input: any): void {
        this.state = new TicketsComponentState();
        this.state.configurationMode = input.configurationMode;
    }

    public onMount(): void {
        DashboardStore.getInstance().addStateListener(this.stateChanged.bind(this));
        DashboardStore.getInstance().loadDashboardConfiguration();
    }

    public onInput(input: any) {
        this.state.configurationMode = input.configurationMode;
    }

    public stateChanged(): void {
        const dashboardConfiguration = DashboardStore.getInstance().getDashboardConfiguration();
        if (dashboardConfiguration) {
            this.state.rows = dashboardConfiguration.contentRows;
            this.state.configuredWidgets = dashboardConfiguration.contentConfiguredWidgets;
            this.state.widgetTemplates = dashboardConfiguration.widgetTemplates;
        }
    }
}

module.exports = TicketsComponent;
