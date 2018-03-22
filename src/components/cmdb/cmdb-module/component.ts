import { CmdbComponentState } from './model/CmdbComponentState';
import { ComponentRouterService } from '@kix/core/dist/browser/router/ComponentRouterService';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';
import { BreadcrumbDetails, Context } from '@kix/core/dist/model';

class CMDBComponent {

    public state: CmdbComponentState;

    public store: any;

    public onCreate(input: any): void {
        this.state = new CmdbComponentState();
    }

    public onMount(): void {
        ContextService.getInstance().provideContext(new Context('cmdb', 'cmdb'), true);

        const breadcrumbDetails =
            new BreadcrumbDetails('cmdb', null, null, 'CMDB-Dashboard');
        ComponentRouterService.getInstance().prepareBreadcrumbDetails(breadcrumbDetails);
    }

}

module.exports = CMDBComponent;
