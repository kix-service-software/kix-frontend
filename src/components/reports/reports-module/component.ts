import { ReportsComponentState } from './model/ComponentState';
import { BreadcrumbDetails } from '@kix/core/dist/browser/router';
import { ComponentRouterStore } from '@kix/core/dist/browser/router/ComponentRouterStore';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';
import { Context } from '@kix/core/dist/model';

class ReportsComponent {

    public state: ReportsComponentState;

    public store: any;

    public onCreate(input: any): void {
        this.state = new ReportsComponentState();
    }

    public onMount(): void {
        ContextService.getInstance().provideContext(new Context('reports', 'reports'), true);

        const breadcrumbDetails =
            new BreadcrumbDetails('reports', null, null, 'Reports-Dashboard');
        ComponentRouterStore.getInstance().prepareBreadcrumbDetails(breadcrumbDetails);
    }

}

module.exports = ReportsComponent;
