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
        DashboardStore.addStateListener(this.stateChanged.bind(this));
        DashboardStore.loadDashboardConfiguration();
    }

    public onInput(input: any) {
        this.state.configurationMode = input.configurationMode;
    }

    public stateChanged(): void {
        const dashboardConfiguration = DashboardStore.getDashboardConfiguration();
        if (dashboardConfiguration) {
            this.state.containerConfiguration = dashboardConfiguration.configuration;
            this.state.widgetTemplates = dashboardConfiguration.widgetTemplates;
        }
    }
}

module.exports = TicketsComponent;
