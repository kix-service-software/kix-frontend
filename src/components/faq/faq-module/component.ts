import { FaqComponentState } from './model/FaqComponentState';
import { BreadcrumbDetails } from '@kix/core/dist/browser/router';
import { ComponentRouterStore } from '@kix/core/dist/browser/router/ComponentRouterStore';
import { DashboardStore } from '@kix/core/dist/browser/dashboard/DashboardStore';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';
import { Context } from '@kix/core/dist/model';

class FAQComponent {

    public state: FaqComponentState;

    public store: any;

    public onCreate(input: any): void {
        this.state = new FaqComponentState();
    }

    public onMount(): void {
        DashboardStore.getInstance().loadDashboardConfiguration();

        ContextService.getInstance().provideContext(new Context('faq'), 'faq', true);

        const breadcrumbDetails =
            new BreadcrumbDetails('faq', null, null, 'FAQ-Dashboard');
        ComponentRouterStore.getInstance().prepareBreadcrumbDetails(breadcrumbDetails);
    }
}

module.exports = FAQComponent;
