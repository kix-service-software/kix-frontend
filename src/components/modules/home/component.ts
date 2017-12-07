import { DashboardComponentState } from './model/DashboardComponentState';
import { DashboardStore } from '@kix/core/dist/browser/dashboard/DashboardStore';
import { DashboardConfiguration, ContainerConfiguration } from '@kix/core/dist/model/';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { BreadcrumbDetails } from '@kix/core/dist/browser/router';
import { ComponentRouterStore } from '@kix/core/dist/browser/router/ComponentRouterStore';

class HomeComponent {

    public state: DashboardComponentState;

    public store: any;

    public onCreate(input: any): void {
        this.state = new DashboardComponentState();
        this.state.configurationMode = input.configurationMode;
    }

    public onMount(): void {
        DashboardStore.getInstance().addStateListener(this.stateChanged.bind(this));
        DashboardStore.getInstance().loadDashboardConfiguration();

        const contextId = ClientStorageHandler.getContextId();
        const breadcrumbDetails =
            new BreadcrumbDetails(contextId, null, null, 'Home-Dashboard');
        ComponentRouterStore.getInstance().prepareBreadcrumbDetails(breadcrumbDetails);
    }

    public onInput(input: any) {
        this.state.configurationMode = input.configurationMode;
    }

    public stateChanged(): void {
        const dashboardConfiguration: DashboardConfiguration = DashboardStore.getInstance().getDashboardConfiguration();
        if (dashboardConfiguration) {
            this.state.containerConfiguration = dashboardConfiguration.configuration;
            this.state.widgetTemplates = dashboardConfiguration.widgetTemplates;
        }
    }
}

module.exports = HomeComponent;
