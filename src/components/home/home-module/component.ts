import { HomeComponentState } from './model/HomeComponentState';
import { DashboardStore } from '@kix/core/dist/browser/dashboard/DashboardStore';
import { Context, DashboardConfiguration } from '@kix/core/dist/model/';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { BreadcrumbDetails } from '@kix/core/dist/browser/router';
import { ComponentRouterStore } from '@kix/core/dist/browser/router/ComponentRouterStore';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';

class HomeComponent {

    public state: HomeComponentState;

    public onCreate(input: any): void {
        this.state = new HomeComponentState();
    }

    public onMount(): void {
        DashboardStore.getInstance().addStateListener(this.stateChanged.bind(this));
        DashboardStore.getInstance().loadDashboardConfiguration('home');

        const breadcrumbDetails =
            new BreadcrumbDetails('home', null, null, 'Home-Dashboard');
        ComponentRouterStore.getInstance().prepareBreadcrumbDetails(breadcrumbDetails);
    }

    private stateChanged(id: string): void {
        const dashboardConfiguration: DashboardConfiguration =
            DashboardStore.getInstance().getDashboardConfiguration('home');

        if (id === 'home' && dashboardConfiguration) {
            this.state.rows = dashboardConfiguration.contentRows;
            this.state.configuredWidgets = dashboardConfiguration.contentConfiguredWidgets;
            ContextService.getInstance().provideContext(new Context('home', dashboardConfiguration), 'home', true);
        }
    }
}

module.exports = HomeComponent;
