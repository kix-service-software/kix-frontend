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

}

module.exports = CMDBComponent;
