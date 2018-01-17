import { SearchComponentState } from './model/SearchComponentState';
import { BreadcrumbDetails } from '@kix/core/dist/browser/router';
import { ComponentRouterStore } from '@kix/core/dist/browser/router/ComponentRouterStore';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';
import { Context } from '@kix/core/dist/model';

class SearchComponent {

    public state: SearchComponentState;

    public store: any;

    public onCreate(input: any): void {
        this.state = new SearchComponentState();
    }

    public onMount(): void {
        ContextService.getInstance().provideContext(new Context('search'), 'search', true);

        const breadcrumbDetails =
            new BreadcrumbDetails('search', null, null, 'Search-Dashboard');
        ComponentRouterStore.getInstance().prepareBreadcrumbDetails(breadcrumbDetails);
    }

}

module.exports = SearchComponent;
