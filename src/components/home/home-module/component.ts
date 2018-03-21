import { HomeComponentState } from './model/HomeComponentState';
import { BreadcrumbDetails, Context, DashboardConfiguration } from '@kix/core/dist/model/';
import { ComponentRouterService } from '@kix/core/dist/browser/router';
import { ContextNotification, ContextService } from '@kix/core/dist/browser/context/';
import { DashboardService } from '@kix/core/dist/browser/dashboard/DashboardService';

class HomeComponent {

    public state: HomeComponentState;

    public onCreate(input: any): void {
        this.state = new HomeComponentState();
    }

    public onMount(): void {
        ContextService.getInstance().addStateListener(this.contextServiceNotified.bind(this));
        ContextService.getInstance().provideContext(
            new Context(HomeComponentState.MODULE_ID, 'home'), true
        );

        DashboardService.getInstance().loadDashboardConfiguration(HomeComponentState.MODULE_ID);

        const breadcrumbDetails =
            new BreadcrumbDetails(HomeComponentState.MODULE_ID, null, null, 'Home-Dashboard');
        ComponentRouterService.getInstance().prepareBreadcrumbDetails(breadcrumbDetails);
    }

    private contextServiceNotified(id: string, type: ContextNotification, ...args: any[]): void {
        if (type === ContextNotification.CONTEXT_CONFIGURATION_CHANGED && id === HomeComponentState.MODULE_ID) {
            const dashboardConfiguration: DashboardConfiguration = args[0];
            if (dashboardConfiguration) {
                this.state.rows = dashboardConfiguration.contentRows;
                this.state.configuredWidgets = dashboardConfiguration.contentConfiguredWidgets;
            }
        }
    }
}

module.exports = HomeComponent;
