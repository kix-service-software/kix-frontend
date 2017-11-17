import { DashboardComponentState } from './model/DashboardComponentState';

import { DashboardStore } from '@kix/core/dist/model/client/dashboard/store/DashboardStore';
import { ClientStorageHandler, ContainerConfiguration } from '@kix/core/dist/model/client/';
import { DashboardReduxState, DashboardConfiguration } from '@kix/core/dist/model/client/dashboard';

class DashboardComponent {

    public state: DashboardComponentState;

    public store: any;

    public onCreate(input: any): void {
        this.state = new DashboardComponentState();
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
        const dashboardConfiguration: DashboardConfiguration = DashboardStore.getDashboardConfiguration();
        if (dashboardConfiguration) {
            this.state.containerConfiguration = dashboardConfiguration.configuration;
            this.state.widgetTemplates = dashboardConfiguration.widgetTemplates;
        }
    }
}

module.exports = DashboardComponent;
