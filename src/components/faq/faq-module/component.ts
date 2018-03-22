import { FaqComponentState } from './model/FaqComponentState';
import { ComponentRouterService } from '@kix/core/dist/browser/router/';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';
import { Context, BreadcrumbDetails } from '@kix/core/dist/model';

class FAQComponent {

    public state: FaqComponentState;

    public store: any;

    public onCreate(input: any): void {
        this.state = new FaqComponentState();
    }

    public onMount(): void {
        ContextService.getInstance().provideContext(new Context('faq', 'faq'), true);

        const breadcrumbDetails =
            new BreadcrumbDetails('faq', null, null, 'FAQ-Dashboard');
        ComponentRouterService.getInstance().prepareBreadcrumbDetails(breadcrumbDetails);
    }
}

module.exports = FAQComponent;
