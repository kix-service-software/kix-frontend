import { SearchComponentState } from './model/SearchComponentState';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';
import { Context, BreadcrumbDetails } from '@kix/core/dist/model';
import { ComponentRouterService } from '@kix/core/dist/browser/router';

class SearchComponent {

    public state: SearchComponentState;

    public store: any;

    public onCreate(input: any): void {
        this.state = new SearchComponentState();
    }

    public onMount(): void {
        ContextService.getInstance().provideContext(new Context('search', 'search'), true);

        const breadcrumbDetails =
            new BreadcrumbDetails('search', null, null, 'Search-Dashboard');
        ComponentRouterService.getInstance().prepareBreadcrumbDetails(breadcrumbDetails);
    }

}

module.exports = SearchComponent;
